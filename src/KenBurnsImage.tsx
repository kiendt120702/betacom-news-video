import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Direction = "in" | "out";

export const KenBurnsImage: React.FC<{
  src?: string;
  direction?: Direction;
  panX?: number;
  panY?: number;
  startScale?: number;
  endScale?: number;
}> = ({
  src,
  direction = "in",
  panX = 0,
  panY = 0,
  startScale,
  endScale,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  if (!src) return null;

  const fromScale = startScale ?? (direction === "in" ? 1.0 : 1.15);
  const toScale = endScale ?? (direction === "in" ? 1.15 : 1.0);

  const progress = interpolate(frame, [0, durationInFrames], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const scale = fromScale + (toScale - fromScale) * progress;
  const tx = panX * progress;
  const ty = panY * progress;

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <Img
        src={staticFile(`images/${src}`)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(${scale}) translate(${tx}px, ${ty}px)`,
          transformOrigin: "center center",
        }}
      />
      {/* Dark overlay so white text remains readable */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,26,0.55) 0%, rgba(10,10,26,0.35) 35%, rgba(10,10,26,0.45) 65%, rgba(10,10,26,0.85) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
