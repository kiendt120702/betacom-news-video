import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../../Background";
import { COLORS, FONT } from "../../fonts";
import { SceneAudio } from "../../audio/SceneAudio";
import { KenBurnsImage } from "../../KenBurnsImage";

const renderTitleWithHighlight = (title: string, highlight?: string) => {
  if (!highlight) return title;
  const idx = title.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return title;
  const before = title.slice(0, idx);
  const match = title.slice(idx, idx + highlight.length);
  const after = title.slice(idx + highlight.length);
  return (
    <>
      {before}
      <span style={{ color: COLORS.accent }}>{match}</span>
      {after}
    </>
  );
};

export const Title: React.FC<{
  title: string;
  date: string;
  highlight?: string;
  audioSrc?: string;
  image?: string;
}> = ({ title, date, highlight, audioSrc, image }) => {
  const frame = useCurrentFrame();

  const ease = Easing.bezier(0.16, 1, 0.3, 1);

  const brandFade = interpolate(frame, [0, 20], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const lineWidth = interpolate(frame, [10, 35], [0, 100], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const titleFade = interpolate(frame, [25, 55], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const titleY = interpolate(frame, [25, 55], [40, 0], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const dateFade = interpolate(frame, [50, 75], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ fontFamily: FONT }}>
      <SceneAudio src={audioSrc} />
      <Background />
      <KenBurnsImage src={image} direction="in" panX={-15} panY={-10} />
      <AbsoluteFill style={{ padding: 80, justifyContent: "space-between" }}>
        <div
          style={{
            opacity: brandFade,
            color: COLORS.accent,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: 8,
            textAlign: "center",
            marginTop: 40,
          }}
        >
          BETACOM NEWS
        </div>

        <div style={{ textAlign: "center" }}>
          <div
            style={{
              height: 2,
              width: `${lineWidth}%`,
              background: COLORS.accent,
              margin: "0 auto 56px",
              boxShadow: `0 0 16px ${COLORS.accent}`,
            }}
          />
          <h1
            style={{
              opacity: titleFade,
              transform: `translateY(${titleY}px)`,
              color: COLORS.text,
              fontSize: 92,
              fontWeight: 800,
              lineHeight: 1.18,
              margin: 0,
              letterSpacing: -1,
            }}
          >
            {renderTitleWithHighlight(title, highlight)}
          </h1>
          <div
            style={{
              opacity: dateFade,
              color: COLORS.textMuted,
              fontSize: 36,
              marginTop: 56,
              fontWeight: 500,
              letterSpacing: 2,
            }}
          >
            {date}
          </div>
        </div>

        <div style={{ height: 40 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
