# Code Standards & Conventions

**Version:** 1.0.0  
**Last Updated:** 2026-04-28  
**Applies to:** All TypeScript/React files in `src/` and `scripts/`

## File Organization

### Directory Structure
```
src/
├── data/                    # Data files (JSON content)
├── styles/                  # Style presets (each folder is a style)
│   ├── {style-name}/
│   │   ├── Title.tsx
│   │   ├── Segment.tsx
│   │   ├── Outro.tsx
│   │   └── index.ts         # Named export
│   └── registry.ts          # Style lookup + type definitions
├── audio/                   # Audio utilities and providers
├── {shared-component}.tsx   # Reusable React components (kebab-case)
├── types.ts                 # Global type definitions
├── fonts.ts                 # Remotion font setup
├── index.ts                 # Unused; required by Remotion
└── index.css                # Global styles (minimal; Tailwind preferred)

scripts/
├── generate-voiceover.ts    # Main TTS orchestration script
└── tts-providers/
    ├── types.ts             # TTSProvider interface
    ├── elevenlabs.ts        # ElevenLabs implementation
    └── google.ts            # Google Cloud TTS implementation
```

### File Naming
- **React Components:** `PascalCase.tsx` (e.g., `KenBurnsImage.tsx`, `SceneAudio.tsx`)
- **Utilities:** `kebab-case.ts` (e.g., `get-audio-duration.ts`)
- **Data Files:** `kebab-case.json` (e.g., `news.json`)
- **Directories:** `kebab-case/` or `style-name/` (e.g., `centered-bold/`, `text-image-card/`)

### Line Length & File Size
- **Target:** Keep individual files ≤ 200 LOC (soft guideline)
- **Exception:** Style Segment.tsx files may reach 250 LOC for layout complexity; OK if justified
- **Modularization:** If a file exceeds 200 LOC, consider extracting reusable sub-components to separate files

## TypeScript Standards

### Type Definitions
- Use explicit types; avoid `any`
- Define all props using `interface` or `type`
- Use `strict: true` in `tsconfig.json` (non-negotiable)
- Export types from `src/types.ts` (central location)

Example:
```typescript
export type NewsSegment = {
  text: string;           // On-screen text (short bullet)
  voiceText?: string;     // Narration (if different from text)
  image?: string;         // Filename in public/images/
};
```

### Prop Contracts
All React components must define their props explicitly. Use descriptive names:

```typescript
export const Title: React.FC<{
  title: string;
  date: string;
  highlight?: string;     // Word to color cyan
  audioSrc?: string;      // Audio file path (from manifest)
  image?: string;         // Title background image filename
}> = ({ title, date, ... }) => { ... };
```

### Const Assertions
Use `as const` for read-only configuration:
```typescript
export const TRANSITION_FRAMES = 12 as const;
export const FPS = 30 as const;
```

## React & Remotion Rules

### Component Structure
1. **No Class Components** — Use functional components with React hooks only
2. **Hooks Order:** `useState` → `useEffect` → `useContext` → custom hooks (React Rules of Hooks)
3. **Fragment Usage:** Use `<React.Fragment key>` when mapping in JSX
4. **Key Props:** Always provide unique `key` in `.map()` calls (use stable IDs, not index if data mutates)

### Remotion-Specific Rules

#### Audio & Image Handling
- **MUST USE:** `<Audio>` from `@remotion/media` (not HTML `<audio>`)
- **MUST USE:** `<Img>` from Remotion (not `<img>` or CSS `background-image`)
- **Rationale:** Remotion requires these for deterministic rendering and duration tracking

Wrong:
```typescript
// ❌ Remotion cannot serialize this
<div style={{ backgroundImage: `url(${src})` }} />
<audio src={src} />
```

Right:
```typescript
// ✅ Remotion can serialize and snapshot this
import { Img, Audio } from "remotion";
<Img src={src} style={{ ... }} />
<Audio src={src} />
```

#### Frame Calculations
- Always use `useVideoConfig()` to get `fps` and `durationInFrames`
- Never hardcode durations; use `calculateMetadata` to compute per-scene frames
- Convert seconds → frames: `Math.ceil(seconds * fps)`

#### Transitions
- Wrap scenes in `<TransitionSeries>` and `<TransitionSeries.Sequence>`
- Use timing helpers: `linearTiming({ durationInFrames })`
- Transition frames are subtracted from total video duration (see `Root.tsx` line 93–94)

## Naming Conventions

### Variables & Functions
- **camelCase** for variables, functions, props
- **UPPER_SNAKE_CASE** for constants (especially timing-related)

Example:
```typescript
const TITLE_SECONDS = 3;
const SEGMENT_SECONDS = 5;
const TRANSITION_FRAMES = 12;
const AUDIO_PADDING_SECONDS = 0.4;

const getAudioDuration = async (src: string): Promise<number> => { ... };
const titleFrames = sceneFrames?.title ?? TITLE_SECONDS * fps;
```

### Environment Variables
- **UPPER_SNAKE_CASE** with semantic prefix (TTS_, GOOGLE_, ELEVENLABS_)
- **REQUIRED** vs **OPTIONAL:** Document in `.env.example` with comments

```env
# Required
TTS_PROVIDER=elevenlabs

# Provider-specific
GOOGLE_TTS_API_KEY=
GOOGLE_TTS_VOICE_ID=vi-VN-Wavenet-D

ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=3VnrjnYrskPMDsapTr8X
ELEVENLABS_MODEL_ID=eleven_v3
```

## Style Preset Structure

Each style is a self-contained folder under `src/styles/{name}/` with three mandatory exports:

### Title.tsx
Intro/headline scene. Props:
- `title: string` — Main headline
- `date: string` — Publication date (DD/MM/YYYY format)
- `highlight?: string` — Word to accent (color: cyan `#00d4ff`)
- `audioSrc?: string` — Voiceover file path
- `image?: string` — Background image filename

### Segment.tsx
Content scene (repeats for each segment). Props:
- `text: string` — On-screen text (from `segments[i].text`)
- `index: number` — Zero-based segment index
- `total: number` — Total segment count (for progress bar, e.g., "2/4")
- `audioSrc?: string` — Voiceover file path
- `image?: string` — Background image filename

### Outro.tsx
Closing scene. Props:
- `audioSrc?: string` — Voiceover file path

### index.ts
Named export of all three components:
```typescript
export { Title } from "./Title";
export { Segment } from "./Segment";
export { Outro } from "./Outro";
```

### Registration
Add to `src/styles/registry.ts`:
```typescript
import * as MyStyle from "./my-style";

export type StyleName = "centered-bold" | "text-image-card" | "my-style";

export const STYLES: Record<StyleName, StyleModule> = {
  "centered-bold": CenteredBold,
  "text-image-card": TextImageCard,
  "my-style": MyStyle,  // ← add here
};
```

## TTS Provider Abstraction

### Interface Definition (`src/scripts/tts-providers/types.ts`)
```typescript
export interface TTSProvider {
  name: string;                                // e.g., "ElevenLabs", "Google Cloud"
  voiceId: string;                             // ID of voice (from env var)
  modelId: string;                             // Model identifier (for manifest tracking)
  synthesize(text: string): Promise<Buffer>;   // Returns MP3 bytes
}
```

### Implementation Pattern
Each provider is a module exporting a factory function:

```typescript
// elevenlabs.ts
export const createElevenLabsProvider = (): TTSProvider => {
  return {
    name: "ElevenLabs",
    voiceId: process.env.ELEVENLABS_VOICE_ID || "default-id",
    modelId: process.env.ELEVENLABS_MODEL_ID || "eleven_v3",
    synthesize: async (text: string) => {
      // Implementation using @elevenlabs/elevenlabs-js
    },
  };
};
```

### Swapping Providers
1. Edit `.env`: `TTS_PROVIDER=google` or `TTS_PROVIDER=elevenlabs`
2. Run: `npm run voiceover`
3. Manifest detects provider change and re-synthesizes all text

## Error Handling & Defaults

### Voice Generation
- **Missing API key:** Throw clear error with env var name and setup link
- **Synthesis failure:** Log error, skip entry, continue with next segment
- **Manifest missing:** Fall back to hardcoded timing constants (see `Root.tsx` lines 68–79)

### Image Handling
- **Missing image file:** Component renders fallback (e.g., text-only layout for text-image-card)
- **Invalid image format:** Remotion's `<Img>` logs warning; video still renders
- **Always test:** Verify fallback visuals look acceptable

### Audio Duration
- **Mediabunny library:** Uses WASM, works in Node + browser (no FFmpeg needed)
- **Fallback:** If duration query fails, use default constant (SEGMENT_SECONDS)

## Data & Configuration

### news.json Schema
Must conform to `NewsData` type in `src/types.ts`:

```typescript
export type NewsData = {
  title: string;              // Headline
  date: string;               // DD/MM/YYYY
  highlight?: string;         // Word to accent
  style?: string;             // Style preset name
  titleImage?: string;        // Background image filename
  segments: NewsSegment[];    // Content array
  voiceover?: Voiceover;      // Internal: set by calculateMetadata
  sceneFrames?: SceneFrames;  // Internal: set by calculateMetadata
};
```

### Public Images Directory
- Location: `public/images/`
- Supported formats: JPEG, PNG, WebP
- Recommended size: 1920×1080 (will be scaled/cropped to fit)
- Naming: Use lowercase, hyphens, descriptive names (e.g., `fee-table-fixed-charges.png`)

### Voiceover Manifest
Auto-generated by `npm run voiceover`. Location: `public/voiceover/manifest.json`

Structure:
```json
{
  "provider": "ElevenLabs | Google",
  "voiceId": "voice-id-from-env",
  "modelId": "model-version",
  "entries": {
    "title": {
      "id": "title",
      "text": "Original text",
      "textHash": "abc123...",
      "file": "voiceover/title.mp3"
    },
    "seg-01": { ... },
    "seg-02": { ... },
    "outro": { ... }
  }
}
```

Text is hashed (SHA-256, 12-char truncated) so unchanged text skips re-synthesis.

## Linting & Formatting

### ESLint
Config: `.eslintrc` (using Remotion's flat config)
Command: `npm run lint`

Rules:
- No `console.log` in production code (acceptable in scripts/)
- No unused variables
- No implicit `any` type

### Prettier
Code formatter (runs post-lint manually if desired)
Command: `npx prettier --write src/`

Format:
- 2-space indentation
- Single quotes for strings
- Trailing comma

### TypeScript Compiler
Command: `npm run lint` (runs `tsc` as part of lint)
Strict mode: ON (non-negotiable)

## Testing & Verification

### Pre-Commit Checklist
- [ ] `npm run lint` passes (eslint + tsc)
- [ ] Component compiles without errors
- [ ] Props match `StyleModule` interface
- [ ] New style: 3 files (Title, Segment, Outro) + 1 registry line

### Pre-Render Checklist
- [ ] `.env` file exists and has valid API keys (or use Google free tier)
- [ ] `src/data/news.json` is valid JSON and matches `NewsData` type
- [ ] All referenced images exist in `public/images/`
- [ ] Voiceover manifest generated: `npm run voiceover` completes without errors
- [ ] Preview in Remotion Studio: `npm run dev` opens at localhost:3000

## Color Palette

Defined in `src/fonts.ts`:
```typescript
export const COLORS = {
  bg: "#0a0a1a",        // Dark charcoal (background)
  accent: "#00d4ff",    // Cyan (highlights, borders, accents)
  text: "#ffffff",      // White (primary text)
  muted: "#888888",     // Gray (secondary text, date)
};
```

Do not hardcode colors; import `COLORS` from `src/fonts.ts`.

## Git & Version Control

### Commit Message Format
Use conventional commits:
```
feat: add magazine-split style preset
fix: prevent image overflow in text-image-card
refactor: extract KenBurns to shared component
docs: update style preset walkthrough
test: add voiceover manifest parsing tests
```

### .gitignore Rules
Enforced:
```
.env                    # Secrets, never commit
.env.local
public/voiceover/*      # Generated audio files
public/voiceover/*.mp3  # 
out/                    # Render output
node_modules/
dist/
.next/
```

## Documentation Standards

### Code Comments
Use when logic is non-obvious. Avoid stating the obvious:

Good:
```typescript
// Subtract transition overlap so scenes don't double-count overlapping frames
const durationInFrames = totalScenes - numTransitions * TRANSITION_FRAMES;
```

Bad:
```typescript
// Subtract transitions
const durationInFrames = totalScenes - numTransitions * TRANSITION_FRAMES;
```

### JSDoc (Optional but Encouraged)
Use for exported functions and components:

```typescript
/**
 * Loads voiceover manifest from staticFile().
 * Returns null if manifest not found or fetch fails.
 * @returns VoiceoverManifest | null
 */
const tryLoadManifest = async (): Promise<VoiceoverManifest | null> => { ... };
```

### README & Docs
Update `/README.md` and `/docs/` when:
- Adding a new style preset
- Changing TTS provider setup instructions
- Adding/removing env vars
- Updating data schema

## Performance Guidelines

### Image Optimization
- Ken Burns animation: use `scale` + `position` CSS properties (GPU-accelerated)
- Don't animate `width` or `height` (CPU-intensive)
- Lazy-load images only if count > 5 (Remotion handles memory efficiently)

### Audio Optimization
- One audio track per scene (not stacked)
- MP3 bitrate: 128 kbps (default ElevenLabs/Google, sufficient for voiceover)
- Preload only if durationInFrames < 5 minutes

### Rendering Performance
- Local render: ~30–60s for 90-second video (1080×1920 H.264, 30 fps)
- Studio preview: Real-time playback (Remotion optimizes)
- Batch rendering: Use `remotion lambda` for parallel renders (advanced)

## Security & Privacy

### API Keys
- **Never commit** `.env` with real keys
- Use `.env.example` template only
- Rotate keys quarterly
- Restrict API keys to IP whitelist (if provider supports)

### Data Handling
- news.json contains no PII (personal information)
- Voiceover MP3s stored locally; not uploaded unless explicitly rendered to cloud
- Manifests are JSON; safe to commit (no secrets)

### Dependencies
- Review `package.json` quarterly for security updates
- Run `npm audit` before major releases
- Keep Remotion & @remotion packages in sync (same version)
