import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import fs from 'fs';
import path from 'path';

const client = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY || '',
});

export type VoiceLanguage = 'en' | 'es' | 'fr' | 'ja' | 'hi' | 'de';
export type VoiceType =
  | 'professional_male'
  | 'professional_female'
  | 'energetic'
  | 'calm';

// Voice ID mapping for different voice types
// Using ElevenLabs premade voices
const VOICE_MAP: Record<VoiceType, string> = {
  professional_male: 'pNInz6obpgDQGcFmaJgB', // Adam - Deep, professional male
  professional_female: 'EXAVITQu4vr4xnSDxMaL', // Sarah - Professional female
  energetic: 'ThT5KcBeYPX3keUQqHPh', // Dave - Energetic, young male
  calm: 'XB0fDUnXU5powFXDhCwa', // Charlie - Calm, soothing
};

export interface AudioResult {
  audioUrl: string;
  duration: number;
  filename: string;
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
  voiceType: VoiceType = 'professional_female',
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

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `pitch_${language}_${timestamp}.mp3`;
    const audioDir = path.join(process.cwd(), 'public', 'audio');
    const filepath = path.join(audioDir, filename);

    // Ensure audio directory exists
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Write audio stream to file
    const chunks: Uint8Array[] = [];
    // @ts-ignore - ElevenLabs SDK stream type compatibility
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }

    const audioBuffer = Buffer.concat(chunks);
    fs.writeFileSync(filepath, audioBuffer);

    // Estimate duration (rough calculation: ~150 words/minute)
    const wordCount = text.split(/\s+/).length;
    const duration = Math.round(wordCount * 0.4); // seconds

    return {
      audioUrl: `/audio/${filename}`,
      duration,
      filename,
    };
  } catch (error: any) {
    console.error('ElevenLabs TTS error:', error);
    throw new Error(`Audio generation failed: ${error.message}`);
  }
}

/**
 * Delete audio file from server
 */
export function deleteAudioFile(filename: string): void {
  try {
    const filepath = path.join(process.cwd(), 'public', 'audio', filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (error) {
    console.error('Failed to delete audio file:', error);
  }
}
