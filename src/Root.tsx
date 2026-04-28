import "./index.css";
import { CalculateMetadataFunction, Composition, staticFile } from "remotion";
import { NewsVideo } from "./Composition";
import {
  AUDIO_PADDING_SECONDS,
  NewsData,
  OUTRO_SECONDS,
  SceneFrames,
  SEGMENT_SECONDS,
  TITLE_SECONDS,
  TRANSITION_FRAMES,
  Voiceover,
} from "./types";
import newsData from "./data/news.json";
import { getAudioDuration } from "./audio/get-audio-duration";
import type { VoiceoverManifest } from "./audio/manifest";

const FPS = 30;

const tryLoadManifest = async (): Promise<VoiceoverManifest | null> => {
  try {
    const res = await fetch(staticFile("voiceover/manifest.json"));
    if (!res.ok) return null;
    return (await res.json()) as VoiceoverManifest;
  } catch {
    return null;
  }
};

const calculateNewsMetadata: CalculateMetadataFunction<NewsData> = async ({
  props,
}) => {
  const manifest = await tryLoadManifest();

  let voiceover: Voiceover | undefined;
  let sceneSeconds: { title: number; segments: number[]; outro: number };

  if (manifest) {
    const titleEntry = manifest.entries.title;
    const outroEntry = manifest.entries.outro;
    const segEntries = props.segments.map(
      (_, i) =>
        manifest.entries[`seg-${String(i + 1).padStart(2, "0")}`] ?? null,
    );

    const haveAll =
      titleEntry && outroEntry && segEntries.every((e) => e !== null);

    if (haveAll) {
      const [titleDur, outroDur, ...segDurs] = await Promise.all([
        getAudioDuration(staticFile(titleEntry.file)),
        getAudioDuration(staticFile(outroEntry.file)),
        ...segEntries.map((e) => getAudioDuration(staticFile(e!.file))),
      ]);

      sceneSeconds = {
        title: titleDur + AUDIO_PADDING_SECONDS,
        outro: outroDur + AUDIO_PADDING_SECONDS,
        segments: segDurs.map((d) => d + AUDIO_PADDING_SECONDS),
      };

      voiceover = {
        title: titleEntry.file,
        outro: outroEntry.file,
        segments: segEntries.map((e) => e!.file),
      };
    } else {
      sceneSeconds = {
        title: TITLE_SECONDS,
        outro: OUTRO_SECONDS,
        segments: props.segments.map(() => SEGMENT_SECONDS),
      };
    }
  } else {
    sceneSeconds = {
      title: TITLE_SECONDS,
      outro: OUTRO_SECONDS,
      segments: props.segments.map(() => SEGMENT_SECONDS),
    };
  }

  const sceneFrames: SceneFrames = {
    title: Math.ceil(sceneSeconds.title * FPS),
    outro: Math.ceil(sceneSeconds.outro * FPS),
    segments: sceneSeconds.segments.map((s) => Math.ceil(s * FPS)),
  };

  const totalScenes =
    sceneFrames.title +
    sceneFrames.outro +
    sceneFrames.segments.reduce((a, b) => a + b, 0);
  const numTransitions = sceneFrames.segments.length + 1;
  const durationInFrames = totalScenes - numTransitions * TRANSITION_FRAMES;

  return {
    durationInFrames: Math.max(durationInFrames, 1),
    props: { ...props, voiceover, sceneFrames },
  };
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="NewsVideo"
        component={NewsVideo}
        durationInFrames={300}
        fps={FPS}
        width={1080}
        height={1920}
        defaultProps={newsData as NewsData}
        calculateMetadata={calculateNewsMetadata}
      />
    </>
  );
};
