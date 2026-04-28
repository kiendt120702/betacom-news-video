import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { createElevenLabsProvider } from "./tts-providers/elevenlabs.ts";
import { createGoogleProvider } from "./tts-providers/google.ts";
import type { TTSProvider } from "./tts-providers/types.ts";

type NewsSegment = { text: string; voiceText?: string };
type NewsData = {
  title: string;
  date: string;
  segments: NewsSegment[];
};

type VoiceoverEntry = {
  id: string;
  text: string;
  textHash: string;
  file: string;
};

type Manifest = {
  provider: string;
  voiceId: string;
  modelId: string;
  entries: Record<string, VoiceoverEntry>;
};

const PROJECT_ROOT = join(import.meta.dirname, "..");
const NEWS_PATH = join(PROJECT_ROOT, "src/data/news.json");
const OUT_DIR = join(PROJECT_ROOT, "public/voiceover");
const MANIFEST_PATH = join(OUT_DIR, "manifest.json");

const PROVIDER_NAME = (process.env.TTS_PROVIDER ?? "elevenlabs").toLowerCase();

const buildProvider = (): TTSProvider => {
  if (PROVIDER_NAME === "google") return createGoogleProvider();
  if (PROVIDER_NAME === "elevenlabs") return createElevenLabsProvider();
  throw new Error(
    `Unknown TTS_PROVIDER='${PROVIDER_NAME}'. Use 'google' or 'elevenlabs'.`,
  );
};

const provider = buildProvider();

const hashText = (s: string) =>
  createHash("sha256").update(s).digest("hex").slice(0, 12);

const loadManifest = (): Manifest => {
  if (existsSync(MANIFEST_PATH)) {
    return JSON.parse(readFileSync(MANIFEST_PATH, "utf-8")) as Manifest;
  }
  return {
    provider: provider.name,
    voiceId: provider.voiceId,
    modelId: provider.modelId,
    entries: {},
  };
};

const saveManifest = (manifest: Manifest) => {
  mkdirSync(dirname(MANIFEST_PATH), { recursive: true });
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
};

const ensureEntry = async (
  manifest: Manifest,
  id: string,
  text: string,
): Promise<VoiceoverEntry> => {
  const textHash = hashText(text);
  const relFile = `voiceover/${id}.mp3`;
  const absFile = join(OUT_DIR, `${id}.mp3`);

  const existing = manifest.entries[id];
  if (existing && existing.textHash === textHash && existsSync(absFile)) {
    console.log(`  ↺ skip ${id} (unchanged)`);
    return existing;
  }

  console.log(`  ↓ generating ${id} ...`);
  const buf = await provider.synthesize(text);
  mkdirSync(dirname(absFile), { recursive: true });
  writeFileSync(absFile, buf);

  const entry: VoiceoverEntry = { id, text, textHash, file: relFile };
  manifest.entries[id] = entry;
  return entry;
};

const main = async () => {
  const news = JSON.parse(readFileSync(NEWS_PATH, "utf-8")) as NewsData;
  const manifest = loadManifest();

  const sameConfig =
    manifest.provider === provider.name &&
    manifest.voiceId === provider.voiceId &&
    manifest.modelId === provider.modelId;
  if (!sameConfig) {
    console.log(
      `Provider/voice/model changed (was ${manifest.provider}/${manifest.voiceId}/${manifest.modelId} → now ${provider.name}/${provider.voiceId}/${provider.modelId}). Regenerating all entries.`,
    );
    manifest.entries = {};
  }
  manifest.provider = provider.name;
  manifest.voiceId = provider.voiceId;
  manifest.modelId = provider.modelId;

  console.log(
    `Provider: ${provider.name}  Voice: ${provider.voiceId}  Model: ${provider.modelId}`,
  );
  console.log(`Segments: ${news.segments.length}`);

  const titleText = `${news.title}. Ngày ${news.date}.`;
  await ensureEntry(manifest, "title", titleText);

  for (let i = 0; i < news.segments.length; i++) {
    const id = `seg-${String(i + 1).padStart(2, "0")}`;
    const seg = news.segments[i];
    const speech = seg.voiceText ?? seg.text;
    await ensureEntry(manifest, id, speech);
  }

  const outroText = "Betacom News. Cập nhật mỗi ngày.";
  await ensureEntry(manifest, "outro", outroText);

  // prune entries no longer matching news file
  const validIds = new Set([
    "title",
    "outro",
    ...news.segments.map((_, i) => `seg-${String(i + 1).padStart(2, "0")}`),
  ]);
  for (const id of Object.keys(manifest.entries)) {
    if (!validIds.has(id)) delete manifest.entries[id];
  }

  saveManifest(manifest);
  console.log(`✓ Manifest written to ${MANIFEST_PATH}`);
};

await main();
