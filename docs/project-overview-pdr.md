# Betacom News Video — Project Overview

**Last Updated:** 2026-04-28
**Repository:** https://github.com/kiendt120702/betacom-news-video

## What this is

A vertical news video template (1080×1920, 30 fps) built with Remotion. Content is data-driven from a single JSON file. Vietnamese AI voiceover is generated from that JSON via ElevenLabs or Google Cloud TTS. Output is a deterministic MP4 ready for TikTok/Reels/Shorts.

## What it does

- Reads news content from [src/data/news.json](../src/data/news.json)
- Generates Vietnamese voiceover (per scene) via configured TTS provider, writes MP3 + manifest
- Reads audio durations and auto-sizes each scene to match its narration + small padding
- Composes title → segments → outro with slide and fade transitions
- Renders to MP4

## What's implemented

| Capability | Notes |
|---|---|
| Vertical 1080×1920 @ 30 fps composition | ID: `NewsVideo` |
| Be Vietnam Pro font with cyan accent theme | Loaded via `@remotion/google-fonts` |
| 2 style presets | `centered-bold`, `text-image-card` (registry-based, easy to add more) |
| ElevenLabs TTS via official SDK | Default voice: Tung Dang (Vietnamese, requires Pro plan) |
| Google Cloud TTS via REST | Vietnamese Wavenet voices (`vi-VN-Wavenet-A/B/C/D`) |
| Voiceover manifest with hash-based skip | Unchanged text is not re-synthesized |
| Image support per scene | Place in `public/images/`, reference by filename in JSON |
| Ken Burns animation on images | Slow scale + pan with dark overlay for text legibility |
| `<TransitionSeries>` slide + fade transitions | 12-frame overlap each |
| Async `calculateMetadata` | Reads manifest, computes per-scene frames, subtracts transition overlap |
| Dual prop on segments | `text` (on-screen short headline) + `voiceText` (full narration) |
| Highlight keyword in title | Single substring colored cyan |

## What's not implemented

These are intentionally out of scope for current state:
- BGM track / music with voiceover ducking
- Burned-in captions / subtitles
- Multiple news items in a single render
- AI image generation
- Web UI for non-developers
- Headless preview (preview uses Remotion Studio at localhost:3000)
- Deployment automation (renders run locally)

See [project-roadmap.md](./project-roadmap.md) for ideas surfaced during development.

## Workflow

```bash
# 1. Edit content
vim src/data/news.json

# 2. Generate voiceover (skips unchanged text)
npm run voiceover

# 3. Preview (optional)
npm run dev    # opens Remotion Studio at localhost:3000

# 4. Render
npx remotion render NewsVideo out/video.mp4
```

## news.json schema

```json
{
  "title": "Headline text",
  "highlight": "substring of title to color cyan",
  "date": "DD/MM/YYYY",
  "style": "centered-bold | text-image-card",
  "titleImage": "filename-in-public-images.png",
  "segments": [
    {
      "text": "Short on-screen text",
      "voiceText": "Full sentence read by TTS (optional, falls back to text)",
      "image": "filename-in-public-images.jpg"
    }
  ]
}
```

All image fields and `voiceText`/`highlight`/`titleImage` are optional. Style defaults to `centered-bold` if omitted.

## Architecture summary

```
src/data/news.json
        │
        ▼
scripts/generate-voiceover.ts ──► public/voiceover/*.mp3 + manifest.json
        │
        ▼
src/Root.tsx (calculateMetadata: read manifest, measure durations)
        │
        ▼
src/Composition.tsx (TransitionSeries: title → segments → outro)
        │
        ▼
src/styles/<style>/ (Title, Segment, Outro components)
        │
        ▼
Remotion render → out/video.mp4
```

Detail in [system-architecture.md](./system-architecture.md).

## Style preset pattern

Each style is a folder under `src/styles/` with:
- `Title.tsx`, `Segment.tsx`, `Outro.tsx` — components matching shared prop signatures
- `index.ts` — re-exports the three components

To add a new style, create the folder and add 1 entry to `STYLES` map in [src/styles/registry.ts](../src/styles/registry.ts). User selects via `"style": "<name>"` in news.json.

## TTS provider pattern

Defined by [TTSProvider interface](../scripts/tts-providers/types.ts):
```ts
{ name: string; voiceId: string; modelId: string;
  synthesize: (text: string) => Promise<Buffer> }
```

Two implementations live in `scripts/tts-providers/`. `TTS_PROVIDER` env var picks one. The voiceover manifest tracks which provider/voice/model produced each MP3 — changing any of them auto-triggers regeneration on next `npm run voiceover`.

## Constraints

- ElevenLabs Vietnamese-native voices (Voice Library) require **Pro plan** ($5+/month). Free tier default voices read Vietnamese with English accent.
- Google Cloud TTS requires billing account linked, even on free tier (1M chars/month).
- `eleven_v3` model is the default per ElevenLabs's quickstart docs; switchable via `ELEVENLABS_MODEL_ID`.
- Line-splitting in segments uses fixed character count (22 in `centered-bold`, 24 in `text-image-card`). Very long words may overflow.
- No automatic image optimization. Provide images close to 1080×1920 for full-screen styles, or use `text-image-card` style which preserves aspect ratio in a card.

## Files of interest

- [src/Root.tsx](../src/Root.tsx) — Remotion entry, `calculateMetadata`
- [src/Composition.tsx](../src/Composition.tsx) — TransitionSeries layout
- [src/styles/registry.ts](../src/styles/registry.ts) — Style preset registry
- [src/data/news.json](../src/data/news.json) — Content source
- [scripts/generate-voiceover.ts](../scripts/generate-voiceover.ts) — TTS pipeline
- [.env.example](../.env.example) — Environment template
