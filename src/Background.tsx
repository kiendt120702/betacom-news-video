import { AbsoluteFill } from "remotion";
import { COLORS } from "./fonts";

export const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 20% 15%, #1b1442 0%, transparent 55%), radial-gradient(ellipse at 80% 85%, #042a4a 0%, transparent 60%), linear-gradient(160deg, ${COLORS.bg} 0%, #10122e 60%, #0a0a1a 100%)`,
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ position: "absolute", inset: 0, opacity: 0.18 }}
      >
        <defs>
          <pattern
            id="dotgrid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="2" cy="2" r="1.4" fill={COLORS.accent} />
          </pattern>
          <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
            <stop offset="60%" stopColor="white" stopOpacity="1" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="vignetteMask">
            <rect width="100%" height="100%" fill="url(#vignette)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#dotgrid)"
          mask="url(#vignetteMask)"
        />
      </svg>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,26,0.55) 0%, transparent 30%, transparent 70%, rgba(10,10,26,0.7) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
