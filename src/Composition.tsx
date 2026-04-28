import React from "react";
import { useVideoConfig } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { getStyle } from "./styles/registry";
import {
  NewsData,
  OUTRO_SECONDS,
  SEGMENT_SECONDS,
  TITLE_SECONDS,
  TRANSITION_FRAMES,
} from "./types";

export const NewsVideo: React.FC<NewsData> = ({
  title,
  date,
  highlight,
  style,
  titleImage,
  segments,
  voiceover,
  sceneFrames,
}) => {
  const { fps } = useVideoConfig();
  const { Title, Segment, Outro } = getStyle(style);

  const titleFrames = sceneFrames?.title ?? TITLE_SECONDS * fps;
  const outroFrames = sceneFrames?.outro ?? OUTRO_SECONDS * fps;
  const segmentFrames = (i: number) =>
    sceneFrames?.segments[i] ?? SEGMENT_SECONDS * fps;

  const transition = (direction: "from-left" | "from-right" | "from-bottom") => (
    <TransitionSeries.Transition
      presentation={slide({ direction })}
      timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
    />
  );

  return (
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={titleFrames}>
        <Title
          title={title}
          date={date}
          highlight={highlight}
          audioSrc={voiceover?.title}
          image={titleImage}
        />
      </TransitionSeries.Sequence>

      {transition("from-bottom")}

      {segments.map((seg, i) => (
        <React.Fragment key={`seg-${i}`}>
          <TransitionSeries.Sequence durationInFrames={segmentFrames(i)}>
            <Segment
              text={seg.text}
              index={i}
              total={segments.length}
              audioSrc={voiceover?.segments?.[i]}
              image={seg.image}
            />
          </TransitionSeries.Sequence>
          {i < segments.length - 1 && transition("from-right")}
        </React.Fragment>
      ))}

      <TransitionSeries.Transition
        presentation={fade()}
        timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
      />

      <TransitionSeries.Sequence durationInFrames={outroFrames}>
        <Outro audioSrc={voiceover?.outro} />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  );
};
