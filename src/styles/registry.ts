import * as CenteredBold from "./centered-bold";
import * as TextImageCard from "./text-image-card";

export type StyleName = "centered-bold" | "text-image-card";

export type StyleModule = {
  Title: React.FC<{
    title: string;
    date: string;
    highlight?: string;
    audioSrc?: string;
    image?: string;
  }>;
  Segment: React.FC<{
    text: string;
    index: number;
    total: number;
    audioSrc?: string;
    image?: string;
  }>;
  Outro: React.FC<{ audioSrc?: string }>;
};

export const STYLES: Record<StyleName, StyleModule> = {
  "centered-bold": CenteredBold,
  "text-image-card": TextImageCard,
};

export const DEFAULT_STYLE: StyleName = "centered-bold";

export const getStyle = (name?: string): StyleModule => {
  if (name && name in STYLES) return STYLES[name as StyleName];
  return STYLES[DEFAULT_STYLE];
};
