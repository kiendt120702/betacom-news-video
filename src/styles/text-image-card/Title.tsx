import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { Background } from "../../Background";
import { COLORS, FONT } from "../../fonts";
import { SceneAudio } from "../../audio/SceneAudio";

const renderTitleWithHighlight = (title: string, highlight?: string) => {
  if (!highlight) return title;
  const idx = title.toLowerCase().indexOf(highlight.toLowerCase());
  if (idx === -1) return title;
  return (
    <>
      {title.slice(0, idx)}
      <span style={{ color: COLORS.accent }}>
        {title.slice(idx, idx + highlight.length)}
      </span>
      {title.slice(idx + highlight.length)}
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
  const imgFade = interpolate(frame, [40, 70], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const imgScale = interpolate(frame, [40, 70], [0.92, 1], {
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
          padding: "80px 60px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            opacity: brandFade,
            color: COLORS.accent,
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: 8,
            marginTop: 20,
          }}
        >
          BETACOM NEWS
        </div>

        <div
          style={{
            height: 2,
            width: `${lineWidth}%`,
            background: COLORS.accent,
            margin: "40px 0 36px",
            boxShadow: `0 0 16px ${COLORS.accent}`,
          }}
        />

        <h1
          style={{
            opacity: titleFade,
            transform: `translateY(${titleY}px)`,
            color: COLORS.text,
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.18,
            letterSpacing: -1,
            margin: 0,
            textAlign: "center",
          }}
        >
          {renderTitleWithHighlight(title, highlight)}
        </h1>

        <div
          style={{
            opacity: dateFade,
            color: COLORS.textMuted,
            fontSize: 32,
            marginTop: 28,
            fontWeight: 500,
            letterSpacing: 2,
          }}
        >
          {date}
        </div>

        {image ? (
          <div
            style={{
              opacity: imgFade,
              transform: `scale(${imgScale})`,
              marginTop: 60,
              maxWidth: 880,
              width: "100%",
              borderRadius: 24,
              overflow: "hidden",
              border: `2px solid ${COLORS.accent}33`,
              boxShadow: `0 20px 60px rgba(0,0,0,0.5), 0 0 40px ${COLORS.accent}22`,
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
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
