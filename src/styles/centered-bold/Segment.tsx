import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../Background";
import { COLORS, FONT } from "../../fonts";
import { SceneAudio } from "../../audio/SceneAudio";
import { KenBurnsImage } from "../../KenBurnsImage";

const splitIntoLines = (text: string, maxCharsPerLine: number): string[] => {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > maxCharsPerLine && current) {
      lines.push(current.trim());
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines;
};

export const Segment: React.FC<{
  text: string;
  index: number;
  total: number;
  audioSrc?: string;
  image?: string;
}> = ({ text, index, total, audioSrc, image }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);

  const lines = splitIntoLines(text, 22);

  const indexFade = interpolate(frame, [0, 18], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const segmentProgress = interpolate(
    frame,
    [0, durationInFrames],
    [index / total, (index + 1) / total],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const indexLabel = String(index + 1).padStart(2, "0");

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneAudio src={audioSrc} />
      <Background />
      <KenBurnsImage
        src={image}
        direction={index % 2 === 0 ? "in" : "out"}
        panX={index % 2 === 0 ? 20 : -20}
        panY={index % 3 === 0 ? -15 : 15}
      />

      <div
        style={{
          position: "absolute",
          top: 70,
          left: 70,
          fontSize: 180,
          fontWeight: 800,
          color: COLORS.accent,
          opacity: indexFade * 0.22,
          lineHeight: 1,
          letterSpacing: -4,
        }}
      >
        {indexLabel}
      </div>
      <div
        style={{
          position: "absolute",
          top: 90,
          left: 270,
          fontSize: 28,
          fontWeight: 600,
          color: COLORS.accent,
          opacity: indexFade,
          letterSpacing: 4,
        }}
      >
        SEGMENT {indexLabel} / {String(total).padStart(2, "0")}
      </div>

      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          padding: 80,
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 920 }}>
          {lines.map((line, i) => {
            const start = 15 + i * 10;
            const lineFade = interpolate(frame, [start, start + 22], [0, 1], {
              easing: ease,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const lineY = interpolate(frame, [start, start + 22], [30, 0], {
              easing: ease,
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={i}
                style={{
                  opacity: lineFade,
                  transform: `translateY(${lineY}px)`,
                  color: COLORS.text,
                  fontSize: 68,
                  fontWeight: 700,
                  lineHeight: 1.32,
                  letterSpacing: -0.5,
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          left: 80,
          right: 80,
          bottom: 80,
        }}
      >
        <div
          style={{
            height: 4,
            width: "100%",
            background: "rgba(255,255,255,0.12)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${segmentProgress * 100}%`,
              background: COLORS.accent,
              boxShadow: `0 0 12px ${COLORS.accent}`,
            }}
          />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 16,
            color: COLORS.textFaint,
            fontSize: 22,
            letterSpacing: 3,
            fontWeight: 600,
          }}
        >
          <span>BETACOM NEWS</span>
          <span>
            {indexLabel} / {String(total).padStart(2, "0")}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
