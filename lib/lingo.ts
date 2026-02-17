import { LingoDotDevEngine } from '@lingo.dev/_sdk';

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'ja' | 'hi' | 'de';

// Initialize Lingo.dev SDK engine
console.log(
  'Initializing Lingo.dev SDK with API key:',
  process.env.LINGODOTDEV_API_KEY ? 'present' : 'missing',
);
const lingoDotDev = new LingoDotDevEngine({
  apiKey: process.env.LINGODOTDEV_API_KEY || process.env.LINGO_API_KEY || '',
});

/**
 * Translate pitch text to target language using Lingo.dev SDK
 */
export async function translatePitch(
  text: string,
  targetLang: SupportedLanguage,
): Promise<string> {
  console.log('translatePitch called:', {
    targetLang,
    textLength: text.length,
  });

  // If target is English, return original text
  if (targetLang === 'en') {
    console.log('Target is English, returning original text');
    return text;
  }

  try {
    console.log('Calling lingoDotDev.localizeText...');
    // Use Lingo.dev SDK's localizeText function
    const translatedText = await lingoDotDev.localizeText(text, {
      sourceLocale: 'en',
      targetLocale: targetLang,
    });

    console.log('Translation completed:', {
      targetLang,
      resultLength: translatedText?.length,
    });
    return translatedText;
  } catch (error: any) {
    console.error('Lingo.dev translation error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
    });
    throw new Error(`Translation failed: ${error.message}`);
  }
}

/**
 * Batch translate to multiple languages (for Global Launch Mode)
 */
export async function batchTranslate(
  text: string,
  languages: SupportedLanguage[],
): Promise<Record<SupportedLanguage, string>> {
  const translations: Record<string, string> = {};

  const promises = languages.map(async (lang) => {
    const translated = await translatePitch(text, lang);
    translations[lang] = translated;
  });

  await Promise.all(promises);

  return translations as Record<SupportedLanguage, string>;
}

/**
 * Get language display name
 */
export function getLanguageName(code: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    ja: 'Japanese',
    hi: 'Hindi',
    de: 'German',
  };

  return names[code];
}
