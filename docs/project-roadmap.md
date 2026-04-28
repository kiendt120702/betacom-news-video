# Project Roadmap

**Last Updated:** 2026-04-28

This roadmap reflects only what has actually been built and what has been concretely discussed. No speculative dates, costs, or unconfirmed scope.

---

## Done

**Core template**
- Vertical 1080×1920 @ 30fps composition (`NewsVideo`)
- Be Vietnam Pro font via `@remotion/google-fonts`
- Color theme: dark `#0a0a1a`, accent cyan `#00d4ff`, text white
- Shared `<Background>` component: dark gradient + cyan dot-grid pattern + vignette mask
- `<TransitionSeries>` with slide and fade transitions

**Data-driven content**
- All content lives in [src/data/news.json](../src/data/news.json)
- Schema supports: `title`, `highlight` (keyword colored cyan), `date`, `style`, `titleImage`, `segments[]` with `text` (on-screen) + `voiceText` (read by TTS) + `image`

**Style preset system**
- Preset registry at [src/styles/registry.ts](../src/styles/registry.ts)
- Preset 1: `centered-bold` — large centered text, big translucent index 01/02/03 top-left, progress bar
- Preset 2: `text-image-card` — short headline top, image card centered with cyan border + shadow, falls back to centered text when no image
- Adding a new preset = create folder with Title/Segment/Outro + 1 line in registry

**Voiceover pipeline**
- [scripts/generate-voiceover.ts](../scripts/generate-voiceover.ts) reads news.json, dispatches to TTS provider, writes MP3s + manifest
- Hash-based skip: unchanged text is not regenerated (saves API credits)
- Manifest tracks provider/voice/model — change any of them, all entries auto-regenerate

**TTS provider abstraction**
- ElevenLabs implementation via official `@elevenlabs/elevenlabs-js` SDK ([elevenlabs.ts](../scripts/tts-providers/elevenlabs.ts))
- Google Cloud TTS implementation via REST API ([google.ts](../scripts/tts-providers/google.ts))
- Switch via `TTS_PROVIDER=elevenlabs|google` in `.env`
- Default voice: Tung Dang (`3VnrjnYrskPMDsapTr8X`) — Vietnamese broadcaster on ElevenLabs Pro

**Audio + duration sync**
- `<Audio>` from `@remotion/media`
- Per-scene duration auto-calculated from MP3 length using Mediabunny ([get-audio-duration.ts](../src/audio/get-audio-duration.ts))
- `calculateMetadata` in [Root.tsx](../src/Root.tsx) reads manifest, sets `durationInFrames` per scene + 0.4s padding, subtracts transition overlap

**Image support**
- Place images in `public/images/`, reference by filename in JSON
- [KenBurnsImage.tsx](../src/KenBurnsImage.tsx) — Remotion `<Img>` with slow scale + pan animation, dark overlay gradient for text legibility
- `text-image-card` style displays images as a centered card preserving aspect ratio (suitable for screenshots/tables)

**Repository**
- Public repo: https://github.com/kiendt120702/betacom-news-video
- `.env`, `public/voiceover/*.mp3`, `manifest.json`, `out/` are gitignored
- `.env.example` template for setup

---

## Possible next steps

These are ideas surfaced during development but not committed to or scheduled. No dates, no estimates.

- **More style presets** — magazine-split (two columns), lower-third (TV-news ticker), minimal-quote (large text only)
- **AI image generation per segment** — automate image sourcing instead of manual upload (would require provider choice + API integration)
- **Background music track** with voiceover ducking
- **Burned-in captions** synchronized to voiceover (could use `eleven_v3` timestamps or Whisper)
- **Multiple news items per video** — batch several stories into a single render
- **Outro tagline customization** via JSON (currently hardcoded "Cập nhật mỗi ngày")
- **Voice variation per segment** — different voices for different speakers/quotes

---

## Known limitations

- ElevenLabs library voices (Vietnamese-native) require Pro plan ($5+/month). Free tier is restricted to default English voices that read Vietnamese with American accent.
- `eleven_v3` model is newer and may have higher latency/cost than `eleven_multilingual_v2`. Configurable via `ELEVENLABS_MODEL_ID` env var.
- Line-splitting in segments uses fixed character count per line (22 in `centered-bold`, 24 in `text-image-card`). Very long words or unusual line breaks may overflow.
- No automatic image optimization — large images are upscaled to fit canvas, small images are upscaled and may appear blurry. User is responsible for providing appropriately-sized images.
- Single-story render only. Batch processing is not implemented.
- No deployment automation. Renders run locally via `npx remotion render`.
