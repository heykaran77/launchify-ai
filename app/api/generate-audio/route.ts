import { NextRequest, NextResponse } from 'next/server';
import { generateAudio, VoiceLanguage, VoiceType } from '@/lib/elevenlabs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, language, voiceType } = body;

    if (!text || !language) {
      return NextResponse.json(
        { error: 'Text and language are required' },
        { status: 400 },
      );
    }

    if (!['en', 'es', 'fr', 'ja', 'hi', 'de'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be en, es, fr, ja, hi, or de' },
        { status: 400 },
      );
    }

    const validVoiceTypes = [
      'executive_male',
      'executive_female',
      'presenter_male',
      'presenter_female',
    ];
    const selectedVoiceType =
      voiceType && validVoiceTypes.includes(voiceType)
        ? (voiceType as VoiceType)
        : 'executive_female';

    const audioResult = await generateAudio(
      text,
      language as VoiceLanguage,
      selectedVoiceType,
    );

    return NextResponse.json(audioResult);
  } catch (error: any) {
    console.error('Audio generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate audio' },
      { status: 500 },
    );
  }
}
