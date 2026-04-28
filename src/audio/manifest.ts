export type VoiceoverEntry = {
  id: string;
  text: string;
  textHash: string;
  file: string;
};

export type VoiceoverManifest = {
  voiceId: string;
  modelId: string;
  entries: Record<string, VoiceoverEntry>;
};

export type SegmentDurations = {
  title: number;
  segments: number[];
  outro: number;
};
