import { Audio } from "@remotion/media";
import { staticFile } from "remotion";

export const SceneAudio: React.FC<{ src?: string }> = ({ src }) => {
  if (!src) return null;
  return <Audio src={staticFile(src)} />;
};
