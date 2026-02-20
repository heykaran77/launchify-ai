import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
});

export type VoiceLanguage = 'en' | 'es' | 'fr' | 'ja' | 'hi' | 'de';
export type VoiceType =
  | 'executive_male'
  | 'executive_female'
  | 'presenter_male'
  | 'presenter_female';

// Voice ID mapping for different voice types
// High-quality ElevenLabs voices
const VOICE_MAP: Record<VoiceType, string> = {
  executive_male: 'JBFqnCBsd6RMkjVDRZzb', // George - Standard American Male
  executive_female: '21m00Tcm4TlvDq8ikWAM', // Rachel - Standard American Female
  presenter_male: 'ErXwobaYiN019PkySvjV', // Antoni
  presenter_female: 'AZnzlk1XvdvUeBnXmlld', // Domi
};

export interface AudioResult {
  audioBase64: string;
  duration: number;
}

/**
 * Get appropriate voice ID for voice type
 */
function getVoiceId(voiceType: VoiceType): string {
  return VOICE_MAP[voiceType];
}

/**
 * Generate audio from text using ElevenLabs TTS
 */
export async function generateAudio(
  text: string,
  language: VoiceLanguage,
  voiceType: VoiceType = 'executive_female',
): Promise<AudioResult> {
  try {
    const voiceId = getVoiceId(voiceType);

    const audioStream = await client.textToSpeech.convert(voiceId, {
      text,
      modelId: 'eleven_flash_v2_5',
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
      },
    });

    // Generate an array of chunks from stream
    const chunks: Uint8Array[] = [];
    // @ts-ignore - ElevenLabs SDK stream type compatibility
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);
    const audioBase64 = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;

    // Estimate duration (rough calculation: ~150 words/minute)
    const wordCount = text.split(/\s+/).length;
    const duration = Math.round(wordCount * 0.4); // seconds

    return {
      audioBase64,
      duration,
    };
  } catch (error: any) {
    console.error('ElevenLabs TTS error:', error);
    throw new Error(`Audio generation failed: ${error.message}`);
  }
}
