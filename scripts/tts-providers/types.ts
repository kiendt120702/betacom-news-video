export type TTSProvider = {
  name: string;
  voiceId: string;
  modelId: string;
  synthesize: (text: string) => Promise<Buffer>;
};
