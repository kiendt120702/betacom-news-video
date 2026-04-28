import { loadFont } from "@remotion/google-fonts/BeVietnamPro";

const { fontFamily } = loadFont("normal", {
  weights: ["400", "500", "600", "700", "800"],
  subsets: ["latin", "vietnamese"],
});

export const FONT = fontFamily;

export const COLORS = {
  bg: "#0a0a1a",
  accent: "#00d4ff",
  text: "#ffffff",
  textMuted: "rgba(255, 255, 255, 0.6)",
  textFaint: "rgba(255, 255, 255, 0.35)",
};
