export type NewsSegment = {
  text: string;
  voiceText?: string;
  image?: string;
};

export type Voiceover = {
  title?: string;
  segments?: string[];
  outro?: string;
};

export type SceneFrames = {
  title: number;
  segments: number[];
  outro: number;
};

export type NewsData = {
  title: string;
  date: string;
  highlight?: string;
  style?: string;
  titleImage?: string;
  segments: NewsSegment[];
  voiceover?: Voiceover;
  sceneFrames?: SceneFrames;
};

export const TITLE_SECONDS = 3;
export const SEGMENT_SECONDS = 5;
export const OUTRO_SECONDS = 2;
export const TRANSITION_FRAMES = 12;
export const AUDIO_PADDING_SECONDS = 0.4;
