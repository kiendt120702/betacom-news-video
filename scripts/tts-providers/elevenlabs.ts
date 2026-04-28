import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { TTSProvider } from "./types.ts";

export const createElevenLabsProvider = (): TTSProvider => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId =
    process.env.ELEVENLABS_VOICE_ID ?? "pNInz6obpgDQGcFmaJgB"; // Adam
  const modelId = process.env.ELEVENLABS_MODEL_ID ?? "eleven_multilingual_v2";

  if (!apiKey) {
    throw new Error("Missing ELEVENLABS_API_KEY environment variable.");
  }

  const client = new ElevenLabsClient({ apiKey });

  return {
    name: "elevenlabs",
    voiceId,
    modelId,
    synthesize: async (text: string) => {
      const audio = await client.textToSpeech.convert(voiceId, {
        text,
        modelId,
        outputFormat: "mp3_44100_128",
      });

      // SDK returns ReadableStream — collect into Buffer
      const chunks: Buffer[] = [];
      for await (const chunk of audio as unknown as AsyncIterable<Uint8Array>) {
        chunks.push(Buffer.from(chunk));
      }
      return Buffer.concat(chunks);
    },
  };
};
