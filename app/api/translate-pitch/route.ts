import { NextRequest, NextResponse } from 'next/server';
import { translatePitch, SupportedLanguage } from '@/lib/lingo';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, targetLang } = body;

    console.log('Translation request:', {
      hasText: !!text,
      textLength: text?.length,
      targetLang,
      textPreview: text?.substring(0, 100),
    });

    if (!text || !targetLang) {
      console.error('Validation failed: missing text or targetLang', {
        text: !!text,
        targetLang,
      });
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 },
      );
    }

    if (!['en', 'es', 'fr', 'ja', 'hi', 'de'].includes(targetLang)) {
      console.error('Validation failed: invalid language', { targetLang });
      return NextResponse.json(
        { error: 'Invalid language. Must be en, es, fr, ja, hi, or de' },
        { status: 400 },
      );
    }

    console.log('Calling translatePitch with:', {
      targetLang,
      textLength: text.length,
    });
    const translatedText = await translatePitch(
      text,
      targetLang as SupportedLanguage,
    );

    console.log('Translation successful:', {
      targetLang,
      resultLength: translatedText.length,
    });
    return NextResponse.json({
      translatedText,
      targetLanguage: targetLang,
    });
  } catch (error: any) {
    console.error('Translation error:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: error.message || 'Failed to translate pitch' },
      { status: 500 },
    );
  }
}
