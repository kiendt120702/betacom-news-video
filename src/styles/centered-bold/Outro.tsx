import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "../../Background";
import { COLORS, FONT } from "../../fonts";
import { SceneAudio } from "../../audio/SceneAudio";

export const Outro: React.FC<{ audioSrc?: string }> = ({ audioSrc }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const ease = Easing.bezier(0.16, 1, 0.3, 1);

  const fadeIn = interpolate(frame, [0, 20], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 25, durationInFrames - 5],
    [1, 0],
    {
      easing: Easing.in(Easing.cubic),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );
  const opacity = Math.min(fadeIn, fadeOut);

  const lineWidth = interpolate(frame, [10, 35], [0, 60], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneAudio src={audioSrc} />
      <Background />
      <AbsoluteFill
        style={{
          opacity,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <div
          style={{
            color: COLORS.text,
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: 6,
          }}
        >
          BETACOM <span style={{ color: COLORS.accent }}>NEWS</span>
        </div>
        <div
          style={{
            height: 2,
            width: `${lineWidth}%`,
            background: COLORS.accent,
            margin: "40px auto",
            boxShadow: `0 0 16px ${COLORS.accent}`,
          }}
        />
        <div
          style={{
            color: COLORS.textMuted,
            fontSize: 36,
            fontWeight: 500,
            letterSpacing: 4,
          }}
        >
          Cập nhật mỗi ngày
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
