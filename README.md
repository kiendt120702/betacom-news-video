# Betacom News Video

Vertical news video template (1080×1920) built with [Remotion](https://www.remotion.dev/), with Vietnamese AI voiceover via ElevenLabs or Google Cloud TTS.

## Features

- Vertical 1080×1920 @ 30 fps news template
- 2 style presets (`centered-bold`, `text-image-card`) — easy to add more
- Data-driven: edit `src/data/news.json` → render new video
- Per-scene image backgrounds with Ken Burns animation
- Vietnamese-native AI voiceover (ElevenLabs Pro for library voices, or Google Cloud TTS free)
- Auto duration sync with audio length
- Scene transitions (slide, fade) via `@remotion/transitions`

## Setup

```bash
npm install
cp .env.example .env
# Edit .env and add your API key (ElevenLabs or Google)
```

## Workflow

```bash
# 1. Edit src/data/news.json with your news content
# 2. Generate voiceover (skips entries that haven't changed)
npm run voiceover
# 3. Preview in Remotion Studio
npm run dev
# 4. Render final video
npx remotion render NewsVideo out/video.mp4
```

## news.json schema

```json
{
  "title": "Headline...",
  "highlight": "keyword to color cyan",
  "date": "DD/MM/YYYY",
  "style": "centered-bold | text-image-card",
  "titleImage": "filename.png",
  "segments": [
    {
      "text": "Short bullet shown on screen",
      "voiceText": "Full sentence the voice reads (optional, falls back to text)",
      "image": "filename.jpg"
    }
  ]
}
```

Place images in `public/images/`. All image fields are optional.

## Project structure

```
src/
├── data/news.json          ← edit this
├── styles/
│   ├── centered-bold/      ← style preset 1: text fills screen
│   ├── text-image-card/    ← style preset 2: text headline + image card
│   └── registry.ts         ← register new styles here
├── audio/                  ← voiceover playback helpers
├── Background.tsx          ← shared dark gradient + dot pattern
├── KenBurnsImage.tsx       ← reusable image background with zoom/pan
├── Composition.tsx         ← scene composition (TransitionSeries)
└── Root.tsx                ← Remotion entry, calculateMetadata reads voiceover manifest

scripts/
└── generate-voiceover.ts   ← reads news.json, calls TTS, writes public/voiceover/*.mp3
```

## TTS providers

Switch by setting `TTS_PROVIDER` in `.env`:

| Provider | Free tier Vietnamese? | Cost |
|---|---|---|
| `google` | ✅ Native (`vi-VN-Wavenet-A/B/C/D`) | 1M chars/month free |
| `elevenlabs` (Free) | ❌ Default voices have English accent | Free 10k chars/month |
| `elevenlabs` (Pro $5/mo) | ✅ 150+ Vietnamese library voices | Free 30k chars/month |

## Adding a new style preset

1. Create folder `src/styles/your-style/` with `Title.tsx`, `Segment.tsx`, `Outro.tsx`, and `index.ts`
2. Match the prop signatures in `src/styles/registry.ts` (`StyleModule` type)
3. Add entry in `STYLES` map and `StyleName` type
4. Set `"style": "your-style"` in `news.json`

## License

Private project — see Remotion's [license terms](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md) for commercial use of Remotion itself.
