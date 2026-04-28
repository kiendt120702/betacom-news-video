# Codebase Summary

**Version:** 1.0.0  
**Last Updated:** 2026-04-28  
**Total Source Code:** ~1,240 LOC (TypeScript/React)  
**Files:** 28 source files across 5 key modules

## Quick Navigation

| Module | Purpose | Key Files | LOC |
|---|---|---|---|
| Core Pipeline | Remotion setup & composition | Root.tsx, Composition.tsx | 195 |
| Components | Reusable UI building blocks | Background.tsx, KenBurnsImage.tsx | 115 |
| Types & Config | Type defs, constants, styling | types.ts, fonts.ts | 50 |
| Styles | 2 preset templates | centered-bold/, text-image-card/ | 500+ |
| Audio/TTS | Voiceover generation & playback | scripts/, audio/ | 380 |

## Core Pipeline (195 LOC)

### Root.tsx (116 LOC)
Remotion entry point. Defines the `NewsVideo` composition and metadata calculation.

**Key Functions:**
- `tryLoadManifest()` — Fetches `public/voiceover/manifest.json` asynchronously
- `calculateNewsMetadata()` — Async metadata resolver that:
  1. Loads voiceover manifest
  2. Queries audio durations via Mediabunny for each scene (title, segments, outro)
  3. Adds 0.4s padding per scene (AUDIO_PADDING_SECONDS)
  4. Converts seconds → frame counts
  5. Calculates total duration minus transition overlap (12 frames per transition)
  6. Falls back to hardcoded constants if manifest missing

**Props Flow:**
```
newsData (from news.json)
  ↓
calculateMetadata({ props: newsData })
  ↓
Adds: voiceover, sceneFrames
  ↓
NewsVideo Component (Composition.tsx)
```

**FPS & Dimensions:** 30 fps, 1080×1920 (standard TikTok vertical)

### Composition.tsx (79 LOC)
Main video composition. Builds a `<TransitionSeries>` with scenes in order: Title → Segments → Outro.

**Structure:**
```
Title (durationInFrames = titleFrames)
  ↓ [slide from-bottom] ← 12-frame transition
Segment[0] (durationInFrames = segmentFrames[0])
  ↓ [slide from-right] ← 12-frame transition (repeated for each segment)
Segment[N-1]
  ↓ [fade] ← 12-frame transition
Outro (durationInFrames = outroFrames)
```

**Props Used:**
- Looks up `style` in registry via `getStyle()`
- Reads `voiceover` paths for audio files
- Reads `sceneFrames` for per-scene durations
- Falls back to hardcoded constants if scene metadata missing

**No Direct Styling:** Style rendering delegated to Title/Segment/Outro components from the selected preset.

---

## Components (115 LOC)

### Background.tsx (48 LOC)
Reusable background component. Shared by all styles.

**Visual Elements:**
- Dark gradient fill (#0a0a1a → slightly lighter at bottom)
- Cyan dot grid pattern (using SVG/CSS; density ~20×20 dots per viewport)
- Vignette mask (dark edges, emphasis on center)

**Props:** None (purely presentational)

**Used By:** Every style's Title, Segment, Outro components

### KenBurnsImage.tsx (67 LOC)
Ken Burns animation wrapper for images. Slow zoom-in + pan effect for visual interest.

**Props:**
- `src: string` — Image file path (e.g., `publicImages/1phicodinh.png`)
- `overlay?: number` — Optional dark overlay opacity (0–1, default ~0.3 for text legibility)
- Other standard `<Img>` props (style, etc.)

**Animation:**
- Initial scale: 1.0
- Final scale: 1.2 (20% zoom over duration)
- Pan: Slight horizontal/vertical offset
- Duration: Full scene length (inherits from parent `<Sequence>`)
- Easing: Linear (subtle, professional)

**Error Handling:** If `src` is undefined/empty, returns null gracefully (calling component handles layout fallback)

**Used By:** Both styles (text-image-card, centered-bold) for background images

### SceneAudio.tsx (Audio Wrapper)
Thin wrapper over `<Audio>` from `@remotion/media`.

**Props:**
- `src?: string` — Audio file path from manifest
- Standard `<Audio>` props

**Behavior:** If `src` is undefined, renders nothing (no-op). Prevents Remotion warnings about missing audio.

**Used By:** Title, Segment, Outro components in all styles

---

## Types & Config (50 LOC)

### types.ts (34 LOC)
Central type definitions for the entire app.

**Key Types:**
```typescript
type NewsSegment = {
  text: string;           // On-screen bullet
  voiceText?: string;     // Full narration (if different from text)
  image?: string;         // Image filename
};

type NewsData = {
  title: string;
  date: string;           // DD/MM/YYYY
  highlight?: string;     // Cyan-colored keyword
  style?: string;         // Style preset name
  titleImage?: string;    // Title background
  segments: NewsSegment[]; // Content array
  voiceover?: Voiceover;  // Internal: set by calculateMetadata
  sceneFrames?: SceneFrames; // Internal: per-scene frame counts
};

type Voiceover = {
  title?: string;
  segments?: string[];
  outro?: string;
};

type SceneFrames = {
  title: number;
  segments: number[];
  outro: number;
};
```

**Constants:**
- `TITLE_SECONDS = 3` — Default title duration
- `SEGMENT_SECONDS = 5` — Default segment duration
- `OUTRO_SECONDS = 2` — Default outro duration
- `TRANSITION_FRAMES = 12` — Overlap per transition
- `AUDIO_PADDING_SECONDS = 0.4` — Extra time after audio ends

### fonts.ts (16 LOC)
Remotion font setup and color palette.

**Font:** Be Vietnam Pro (loaded via `@remotion/google-fonts`)

**Colors Exported:**
```typescript
COLORS = {
  bg: "#0a0a1a",     // Dark charcoal
  accent: "#00d4ff", // Cyan (highlights)
  text: "#ffffff",   // White (main)
  muted: "#888888",  // Gray (secondary)
};
```

---

## Styles: 2 Presets

Both presets export `Title`, `Segment`, `Outro` components matching the `StyleModule` interface defined in `registry.ts`.

### centered-bold/ (~280 LOC)

**Visual Design:**
- Headline fills screen center (large, bold font)
- Brand line at top ("BETACOM NEWS" or similar)
- Animated divider (fade in/out)
- Date below headline (muted gray)
- Segment text centered (one bullet per screen)
- Large translucent index top-left (e.g., "01/04" for segment 1 of 4)
- Progress bar at bottom (fills left→right as video progresses)

**Title.tsx (92 LOC)**
- Renders main headline with optional highlight color
- Optional background image (Ken Burns)
- Optionally plays audio

**Segment.tsx (138 LOC)**
- Renders one content bullet
- Shows progress (e.g., "2/4")
- Optional image background
- Text styling: center-aligned, readable on dark background
- Optionally plays audio

**Outro.tsx (50 LOC)**
- Simple "Thank you / Subscribe" closing
- Optionally plays audio

**Best For:** News headlines, quick announcements, text-heavy content

### text-image-card/ (~220 LOC)

**Visual Design:**
- Short headline text at top
- Image card centered (preserves aspect ratio, cyan border, shadow)
- Falls back to text-only if image missing
- Progress bar at bottom

**Title.tsx (55 LOC)**
- Headline + optional background image
- Uses KenBurnsImage for slow pan effect

**Segment.tsx (255 LOC)** — Longest component in codebase (borderline 200-line limit, justified by layout complexity)
- Text headline top
- Image card below (with fallback logic)
- Cyan border + drop shadow for card
- Aspect ratio preservation: uses `aspectRatio` CSS
- If image missing: shrinks card, emphasizes text fallback
- Progress bar
- Optionally plays audio

**Outro.tsx (42 LOC)**
- Simple closing with optional image

**Best For:** Policy updates, infographics, image-heavy news, product announcements

### registry.ts (34 LOC)

**Purpose:** Central lookup for style presets. Enables swapping styles via `style` prop in `news.json`.

**Exports:**
- `StyleName` type: `"centered-bold" | "text-image-card"`
- `StyleModule` interface: Prop contracts for Title, Segment, Outro
- `STYLES` record: Maps style name → module
- `DEFAULT_STYLE`: `"centered-bold"`
- `getStyle(name?)`: Lookup function (returns DEFAULT_STYLE if name not found)

**To Add a New Style:**
1. Create folder `src/styles/my-style/`
2. Implement Title.tsx, Segment.tsx, Outro.tsx, index.ts (export all three)
3. Add import and entry to STYLES map
4. Add name to StyleName type
5. Use in news.json: `"style": "my-style"`

---

## Audio & TTS (380 LOC)

### scripts/generate-voiceover.ts (141 LOC)
Main TTS orchestration script. Reads `news.json`, synthesizes voiceover, writes MP3s + manifest.

**Workflow:**
1. Load news.json
2. Load existing manifest.json (or create empty)
3. For each scene (title, segments, outro):
   - Get voiceText (or fall back to text)
   - Hash text with SHA-256 (12-char truncation)
   - If text unchanged (hash matches manifest): skip
   - If text changed or new: call TTS provider → write MP3
4. Write updated manifest.json to `public/voiceover/`

**Hash-Based Dedup:** Prevents re-synthesizing unchanged text. Saves API quota & time.

**Provider Selection:** Reads `TTS_PROVIDER` env var, instantiates via factory function.

**Entry Point:** `npm run voiceover`

### audio/get-audio-duration.ts
Utility to measure MP3 duration without FFmpeg.

**Dependency:** Mediabunny library (WASM-based, works in Node)

**Returns:** Duration in seconds (float)

**Used By:** Root.tsx to calculate per-scene frame counts

### audio/SceneAudio.tsx
React component wrapper over Remotion's `<Audio>` tag.

**Props:** `src?: string` (optional audio file path)

**Behavior:** If no src, renders nothing (prevents warnings)

### audio/manifest.ts
TypeScript type for voiceover manifest.

```typescript
export type VoiceoverManifest = {
  provider: "ElevenLabs" | "Google";
  voiceId: string;
  modelId: string;
  entries: Record<string, {
    id: string;
    text: string;
    textHash: string;
    file: string;
  }>;
};
```

### scripts/tts-providers/

**types.ts:** `TTSProvider` interface
```typescript
interface TTSProvider {
  name: string;
  voiceId: string;
  modelId: string;
  synthesize(text: string): Promise<Buffer>;
}
```

**elevenlabs.ts (91 LOC)**
- Uses `@elevenlabs/elevenlabs-js` SDK
- Default model: `eleven_v3` (latest)
- Default voice: Configurable via `ELEVENLABS_VOICE_ID` env var
- Returns MP3 bytes

**google.ts (95 LOC)**
- Google Cloud Text-to-Speech REST API
- Default locale: `vi-VN` (Vietnamese)
- Default voice: `vi-VN-Wavenet-D` (configurable)
- Supports SSML for fine-grained control
- Returns MP3 bytes

---

## Data Files

### src/data/news.json
User-editable content. Example (Shopee fee policy update):

```json
{
  "title": "Chính sách phí Shopee cho các seller không phải Shop Mall",
  "highlight": "01/05/2026",
  "date": "28/04/2026",
  "style": "text-image-card",
  "titleImage": "shopee-logo.png",
  "segments": [
    {
      "text": "Phí cố định tăng từ 1.5% lên 2.5%",
      "voiceText": "Từ ngày 01/05/2026, Shopee sẽ tăng phí cố định từ 1.5% lên 2.5% cho các seller không phải Shop Mall.",
      "image": "1phicodinh.png"
    },
    {
      "text": "Phí xử lý giao dịch: 2.5%",
      "voiceText": "Phí xử lý giao dịch cứng nhân là 2.5% trên mỗi đơn hàng.",
      "image": "2phixulygiaodich.png"
    }
  ]
}
```

### public/images/
User-supplied images (JPEG/PNG/WebP). Referenced by filename in news.json.

Example files:
- `1phicodinh.png` — Fixed fee table
- `2phixulygiaodich.png` — Transaction fee table
- `shopee-logo.png` — Title background

### public/voiceover/ (Auto-Generated)
Manifest + MP3 files. **Gitignored** (regenerate via `npm run voiceover`).

```
public/voiceover/
├── manifest.json
├── title.mp3
├── seg-01.mp3
├── seg-02.mp3
├── seg-03.mp3
├── seg-04.mp3
└── outro.mp3
```

---

## Configuration Files

### .env & .env.example
TTS provider credentials. `.env.example` is a template; `.env` is gitignored.

**Required:**
- `TTS_PROVIDER` — `"google"` or `"elevenlabs"`

**Google-Only:**
- `GOOGLE_TTS_API_KEY`
- `GOOGLE_TTS_VOICE_ID` (default: `vi-VN-Wavenet-D`)

**ElevenLabs-Only:**
- `ELEVENLABS_API_KEY`
- `ELEVENLABS_VOICE_ID` (default: Vietnamese library voice if Pro plan)
- `ELEVENLABS_MODEL_ID` (default: `eleven_v3`)

### package.json
Scripts:
- `npm run dev` — Start Remotion Studio
- `npm run voiceover` — Generate TTS audio + manifest
- `npm run build` — Bundle for rendering
- `npm run lint` — ESLint + TypeScript check
- `npm run upgrade` — Update Remotion packages

Dependencies:
- **Core:** `remotion@4.0.452`, `react@19.2.3`, `typescript@5.9.3`
- **Remotion Modules:** `@remotion/media`, `@remotion/transitions`, `@remotion/google-fonts`
- **TTS:** `@elevenlabs/elevenlabs-js`, (Google uses REST API, no SDK)
- **Audio:** `mediabunny@1.41.0` (duration measurement)
- **Styling:** `tailwindcss@4.0.0` (optional; minimal use)

### tsconfig.json
TypeScript configuration with `strict: true` (non-negotiable for type safety).

---

## Data Flow Diagram

```
1. USER EDITS NEWS.JSON
   title, date, segments[text, voiceText?, image?]

2. npm run voiceover
   ↓
   scripts/generate-voiceover.ts reads news.json
   ↓
   For each scene:
     - Hash voiceText
     - Check manifest: skip if unchanged
     - Call TTS provider (Google / ElevenLabs)
     - Write public/voiceover/{scene}.mp3
   ↓
   Write public/voiceover/manifest.json
     (provider, voiceId, modelId, entries[id, text, hash, file])

3. npm run dev (Preview)
   OR
   npx remotion render NewsVideo out/video.mp4 (Render)

4. RemotionRoot (src/Root.tsx)
   ↓
   calculateMetadata() is called
   - Reads news.json → props
   - Fetches manifest.json
   - For each scene: measure audio duration via mediabunny
   - Add padding (0.4s per scene)
   - Convert to frame counts (× FPS=30)
   - Subtract transition overlaps (12 frames each)
   - Return: durationInFrames, props { voiceover, sceneFrames }

5. NewsVideo Component (src/Composition.tsx)
   ↓
   Builds TransitionSeries:
   - Title (durationInFrames = sceneFrames.title)
   - [slide from-bottom transition, 12 frames]
   - Segment[0..N-1]
   - [slide from-right transitions between segments]
   - [fade transition, 12 frames]
   - Outro (durationInFrames = sceneFrames.outro)

6. Style Rendering (e.g., text-image-card/Segment.tsx)
   ↓
   - Renders text, image card, progress bar
   - Plays audio from voiceover.segments[index]
   - Uses Background + KenBurnsImage components

7. Remotion CLI Render
   - Serializes component → snapshots
   - Encodes video (H.264, 30 fps, 1080×1920)
   - Output: out/video.mp4
```

---

## Module Dependencies

```
Root.tsx
  ├── imports: Composition.tsx, types.ts, news.json
  ├── uses: getAudioDuration, tryLoadManifest
  └── exports: RemotionRoot

Composition.tsx
  ├── imports: types.ts, registry.ts
  ├── uses: getStyle(), TransitionSeries
  └── exports: NewsVideo

registry.ts
  ├── imports: centered-bold/, text-image-card/
  └── exports: STYLES, StyleName, getStyle()

Each Style Preset
  ├── Title.tsx → imports: Background, KenBurnsImage, SceneAudio, types
  ├── Segment.tsx → imports: Background, KenBurnsImage, SceneAudio, types
  ├── Outro.tsx → imports: SceneAudio
  └── index.ts → re-exports all three

generate-voiceover.ts
  ├── imports: TTS provider factory (elevenlabs or google)
  └── outputs: manifest.json, .mp3 files to public/voiceover/

TTS Providers
  ├── types.ts → interface TTSProvider
  ├── elevenlabs.ts → createElevenLabsProvider()
  └── google.ts → createGoogleProvider()
```

---

## File Tree Summary

```
betacom-video/
├── src/
│   ├── Root.tsx                           116 LOC   Core pipeline
│   ├── Composition.tsx                     79 LOC   Main layout
│   ├── Background.tsx                      48 LOC   Shared background
│   ├── KenBurnsImage.tsx                   67 LOC   Image animation
│   ├── types.ts                            34 LOC   Type definitions
│   ├── fonts.ts                            16 LOC   Font + colors
│   ├── index.ts                            ~5 LOC   Remotion entry
│   ├── index.css                          ~50 LOC   Global styles
│   ├── data/news.json                     ~50 LOC   User content
│   ├── audio/
│   │   ├── SceneAudio.tsx                 ~20 LOC   Audio wrapper
│   │   ├── get-audio-duration.ts          ~30 LOC   Duration measurement
│   │   └── manifest.ts                    ~10 LOC   Type definition
│   ├── styles/
│   │   ├── registry.ts                     34 LOC   Style lookup
│   │   ├── centered-bold/
│   │   │   ├── Title.tsx                   92 LOC
│   │   │   ├── Segment.tsx                138 LOC
│   │   │   ├── Outro.tsx                   50 LOC
│   │   │   └── index.ts                    ~5 LOC
│   │   └── text-image-card/
│   │       ├── Title.tsx                   55 LOC
│   │       ├── Segment.tsx                255 LOC
│   │       ├── Outro.tsx                   42 LOC
│   │       └── index.ts                    ~5 LOC
│   └── [misc. config/import files]
├── scripts/
│   ├── generate-voiceover.ts              141 LOC   TTS orchestration
│   └── tts-providers/
│       ├── types.ts                       ~20 LOC   Interface
│       ├── elevenlabs.ts                   91 LOC   ElevenLabs impl
│       └── google.ts                       95 LOC   Google impl
├── public/
│   ├── images/                              User-supplied images
│   └── voiceover/                           Generated (gitignored)
│       ├── manifest.json
│       └── *.mp3
├── docs/
│   ├── project-overview-pdr.md            This file hierarchy
│   ├── code-standards.md
│   ├── codebase-summary.md
│   ├── system-architecture.md
│   └── project-roadmap.md
├── package.json
├── .env.example
├── .env                                   (gitignored)
├── .gitignore
├── tsconfig.json
├── README.md
└── [other config: eslint, tailwind, etc.]
```

---

## Quick Reference: Adding a Feature

### Add a New Style Preset
1. Create `src/styles/my-style/` with Title, Segment, Outro components
2. Export all three from `src/styles/my-style/index.ts`
3. Add to `src/styles/registry.ts`: import + STYLES map entry + StyleName type
4. Set `"style": "my-style"` in news.json

### Add a New Content Section
1. Edit `src/data/news.json`: add entry to segments array
2. Add voiceText (if narration differs from on-screen text)
3. (Optional) Add image filename to public/images/
4. Run `npm run voiceover` to generate audio
5. Preview in Studio (`npm run dev`)

### Swap TTS Provider
1. Edit `.env`: `TTS_PROVIDER=google` (or `elevenlabs`)
2. Add API key to `.env`
3. Run `npm run voiceover`
4. Manifest auto-detects provider change, re-synthesizes all segments

### Customize Colors
1. Edit `src/fonts.ts`: COLORS object
2. Components import COLORS and use it (search for `COLORS.accent`, etc.)

---

## Performance Stats

| Metric | Value | Notes |
|---|---|---|
| Source LOC | ~1,240 | TypeScript/React only; excludes lockfile |
| Compile time | ~3s | Cold start (TypeScript strict mode) |
| Studio startup | ~5s | Remotion Studio hot-reload |
| Preview playback | Real-time 30fps | Remotion optimizes rendering |
| Render time (90s video) | 30–60s | Depends on image complexity, CPU |
| Final MP4 size | 20–50 MB | H.264 @ 1080×1920, 30 fps |
| Voiceover generation | 2–5s per scene | ElevenLabs/Google API latency |

---

## Glossary

| Term | Definition |
|---|---|
| **Composition** | Remotion term for a video scene layout. In this project, the single composition is `NewsVideo`. |
| **TransitionSeries** | `@remotion/transitions` component that chains scenes with animated transitions. |
| **Ken Burns** | Slow zoom-in + pan effect on a static image (common in documentaries). |
| **Voiceover** | Recorded narration (MP3) separate from on-screen text. |
| **Manifest** | JSON file tracking generated audio: provider, voice ID, durations, file paths. |
| **Hash** | SHA-256 checksum of text (12-char truncation). Used to detect unchanged voiceText. |
| **Style Preset** | A folder under `src/styles/` with Title, Segment, Outro components. |
| **Scene Frame** | Frame count for a single scene (derived from audio duration). |

