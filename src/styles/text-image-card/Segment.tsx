import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Background } from "../../Background";
import { COLORS, FONT } from "../../fonts";
import { SceneAudio } from "../../audio/SceneAudio";

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

  const lines = splitIntoLines(text, 24);

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
  const totalLabel = String(total).padStart(2, "0");

  const imgFade = interpolate(frame, [25, 55], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const imgY = interpolate(frame, [25, 55], [40, 0], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const imgScale = interpolate(
    frame,
    [25, durationInFrames],
    [0.95, 1.04],
    {
      easing: Easing.bezier(0.45, 0, 0.55, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneAudio src={audioSrc} />
      <Background />

      {/* Top: index + label */}
      <div
        style={{
          position: "absolute",
          top: 70,
          left: 70,
          display: "flex",
          alignItems: "baseline",
          gap: 24,
          opacity: indexFade,
        }}
      >
        <div
          style={{
            fontSize: 140,
            fontWeight: 800,
            color: COLORS.accent,
            opacity: 0.28,
            lineHeight: 1,
            letterSpacing: -3,
          }}
        >
          {indexLabel}
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 600,
            color: COLORS.accent,
            letterSpacing: 4,
          }}
        >
          SEGMENT {indexLabel} / {totalLabel}
        </div>
      </div>

      {/* Text headline — sits above image when present, centered when not */}
      <div
        style={
          image
            ? {
                position: "absolute",
                top: 300,
                left: 60,
                right: 60,
                textAlign: "center",
              }
            : {
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "0 60px",
                textAlign: "center",
              }
        }
      >
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
                fontSize: image ? 76 : 68,
                fontWeight: 800,
                lineHeight: 1.22,
                letterSpacing: -0.5,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>

      {/* Image card — vertically centered in the lower-middle area */}
      {image ? (
        <div
          style={{
            position: "absolute",
            top: "55%",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              opacity: imgFade,
              transform: `translateY(${imgY}px) scale(${imgScale})`,
              maxWidth: 940,
              width: "calc(100% - 100px)",
              borderRadius: 24,
              overflow: "hidden",
              border: `2px solid ${COLORS.accent}33`,
              boxShadow: `0 24px 60px rgba(0,0,0,0.55), 0 0 40px ${COLORS.accent}22`,
              background: "rgba(255,255,255,0.04)",
            }}
          >
            <Img
              src={staticFile(`images/${image}`)}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>
        </div>
      ) : null}

      {/* Progress bar */}
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
            {indexLabel} / {totalLabel}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
