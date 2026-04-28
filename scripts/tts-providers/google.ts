import type { TTSProvider } from "./types.ts";

// Vietnamese Wavenet voices:
//   vi-VN-Wavenet-A (female)
//   vi-VN-Wavenet-B (male)
//   vi-VN-Wavenet-C (female)
//   vi-VN-Wavenet-D (male) — recommended for news
export const createGoogleProvider = (): TTSProvider => {
  const apiKey = process.env.GOOGLE_TTS_API_KEY;
  const voiceId = process.env.GOOGLE_TTS_VOICE_ID ?? "vi-VN-Wavenet-D";
  const languageCode = voiceId.split("-").slice(0, 2).join("-"); // "vi-VN"
  const modelId = "wavenet";

  if (!apiKey) {
    throw new Error("Missing GOOGLE_TTS_API_KEY environment variable.");
  }

  return {
    name: "google",
    voiceId,
    modelId,
    synthesize: async (text: string) => {
      const res = await fetch(
        `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            input: { text },
            voice: { languageCode, name: voiceId },
            audioConfig: {
              audioEncoding: "MP3",
              speakingRate: 1.0,
              pitch: 0.0,
            },
          }),
        },
      );

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Google TTS ${res.status}: ${errorText}`);
      }

      const data = (await res.json()) as { audioContent: string };
      return Buffer.from(data.audioContent, "base64");
    },
  };
};
