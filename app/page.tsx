'use client';

import { useState } from 'react';
import Container from '@/components/common/Container';
import RepoAnalyzer from '@/components/RepoAnalyzer';
import PitchDisplay from '@/components/PitchDisplay';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

type PitchType = '30s' | '60s' | '90s';
type Language = 'en' | 'es' | 'fr' | 'ja' | 'hi' | 'de';
type VoiceType =
  | 'professional_male'
  | 'professional_female'
  | 'energetic'
  | 'calm';

interface RepoData {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  techStack: string[];
  readmeSummary: string;
  commitActivity: number;
  confidenceScore: number;
}

// Store translations and audio per language
interface LanguageCache {
  translatedText: string;
  audioUrl: string;
}

export default function Page() {
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [pitchType, setPitchType] = useState<PitchType>('60s');
  const [voiceType, setVoiceType] = useState<VoiceType>('professional_female');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState('');

  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [originalPitch, setOriginalPitch] = useState(''); // English pitch from Gemini

  // Cache translations and audio for each language
  const [languageCache, setLanguageCache] = useState<
    Record<Language, LanguageCache>
  >({
    en: { translatedText: '', audioUrl: '' },
    es: { translatedText: '', audioUrl: '' },
    fr: { translatedText: '', audioUrl: '' },
    ja: { translatedText: '', audioUrl: '' },
    hi: { translatedText: '', audioUrl: '' },
    de: { translatedText: '', audioUrl: '' },
  });

  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);

  const handleGenerate = async () => {
    if (!repoUrl.trim()) {
      setError('Please enter a GitHub repository URL');
      return;
    }

    setIsLoading(true);
    setError('');
    setRepoData(null);
    setOriginalPitch('');

    // Reset cache
    setLanguageCache({
      en: { translatedText: '', audioUrl: '' },
      es: { translatedText: '', audioUrl: '' },
      fr: { translatedText: '', audioUrl: '' },
      ja: { translatedText: '', audioUrl: '' },
      hi: { translatedText: '', audioUrl: '' },
      de: { translatedText: '', audioUrl: '' },
    });

    try {
      // Step 1: Analyze repository
      setLoadingStage('Analyzing repository...');
      const analyzeRes = await fetch('/api/analyze-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: repoUrl }),
      });

      if (!analyzeRes.ok) {
        throw new Error('Failed to analyze repository');
      }

      const repoResult = await analyzeRes.json();
      setRepoData(repoResult);

      // Step 2: Generate pitch with Gemini (always in English)
      setLoadingStage('Generating pitch with AI...');
      const pitchRes = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoData: repoResult,
          pitchType,
        }),
      });

      if (!pitchRes.ok) {
        throw new Error('Failed to generate pitch');
      }

      const pitchResult = await pitchRes.json();
      const englishPitch = pitchResult.pitchText;
      setOriginalPitch(englishPitch);

      // Store English version in cache
      setLanguageCache((prev) => ({
        ...prev,
        en: { translatedText: englishPitch, audioUrl: '' },
      }));

      // Step 3: Translate if needed
      let finalText = englishPitch;
      if (selectedLang !== 'en') {
        setLoadingStage(`Translating to ${getLanguageName(selectedLang)}...`);
        const translateRes = await fetch('/api/translate-pitch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: englishPitch,
            targetLang: selectedLang,
          }),
        });

        if (!translateRes.ok) {
          throw new Error('Failed to translate pitch');
        }

        const translateResult = await translateRes.json();
        finalText = translateResult.translatedText;

        // Update cache with translation
        setLanguageCache((prev) => ({
          ...prev,
          [selectedLang]: { translatedText: finalText, audioUrl: '' },
        }));
      }

      // Step 4: Generate audio
      setLoadingStage('Generating voice audio...');
      setIsGeneratingAudio(true);
      const audioRes = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: finalText,
          language: selectedLang,
          voiceType,
        }),
      });

      if (!audioRes.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioResult = await audioRes.json();

      // Update cache with audio
      setLanguageCache((prev) => ({
        ...prev,
        [selectedLang]: {
          ...prev[selectedLang],
          audioUrl: audioResult.audioUrl,
        },
      }));

      setIsGeneratingAudio(false);
      setLoadingStage('');
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
      setIsGeneratingAudio(false);
    }
  };

  const handleLanguageChange = async (newLang: Language) => {
    // Check if we already have translation and audio for this language
    if (languageCache[newLang].translatedText) {
      // Already have it cached, just switch
      setSelectedLang(newLang);
      return;
    }

    // Need to generate translation and audio for new language
    if (!originalPitch) return; // No pitch generated yet

    setIsGeneratingAudio(true);
    setSelectedLang(newLang);

    try {
      // Translate to new language (unless it's English)
      let translatedText = originalPitch;
      if (newLang !== 'en') {
        const translateRes = await fetch('/api/translate-pitch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: originalPitch,
            targetLang: newLang,
          }),
        });

        if (!translateRes.ok) {
          throw new Error('Failed to translate pitch');
        }

        const translateResult = await translateRes.json();
        translatedText = translateResult.translatedText;
      }

      // Update cache with translation
      setLanguageCache((prev) => ({
        ...prev,
        [newLang]: { translatedText, audioUrl: '' },
      }));

      // Generate audio for new language
      const audioRes = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: translatedText,
          language: newLang,
          voiceType,
        }),
      });

      if (!audioRes.ok) {
        throw new Error('Failed to generate audio');
      }

      const audioResult = await audioRes.json();

      // Update cache with audio
      setLanguageCache((prev) => ({
        ...prev,
        [newLang]: {
          ...prev[newLang],
          audioUrl: audioResult.audioUrl,
        },
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to switch language');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  // Get current language data
  const currentLanguageData = languageCache[selectedLang];

  return (
    <TooltipProvider>
      <Container className="py-12">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold tracking-tight">Launchify AI</h1>
            <p className="text-lg text-muted-foreground">
              Turn your GitHub repository into a compelling startup pitch with
              AI
            </p>
          </div>

          {/* Input Form */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
            <div className="space-y-6">
              {/* GitHub URL Input */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label
                    htmlFor="repo-url"
                    className="block text-sm font-medium text-left">
                    GitHub Repository URL
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter the full URL of your GitHub repository</p>
                      <p className="text-xs text-muted-foreground">
                        Example: https://github.com/username/repo
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <input
                  id="repo-url"
                  type="text"
                  placeholder="https://github.com/username/repo"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Language Selector */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-left">
                      Output Language
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Choose the language for your pitch</p>
                        <p className="text-xs text-muted-foreground">
                          Supports 6 languages with AI translation
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={selectedLang}
                    onValueChange={(value) =>
                      setSelectedLang(value as Language)
                    }
                    disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                      <SelectItem value="es">🇪🇸 Spanish</SelectItem>
                      <SelectItem value="fr">🇫🇷 French</SelectItem>
                      <SelectItem value="ja">🇯🇵 Japanese</SelectItem>
                      <SelectItem value="hi">🇮🇳 Hindi</SelectItem>
                      <SelectItem value="de">🇩🇪 German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Pitch Type Selector */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-sm font-medium text-left">
                      Pitch Length
                    </label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Select the duration of your pitch</p>
                        <p className="text-xs text-muted-foreground">
                          30s: Elevator, 60s: Investor, 90s: Demo
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select
                    value={pitchType}
                    onValueChange={(value) => setPitchType(value as PitchType)}
                    disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30s">
                        30 Second Elevator Pitch
                      </SelectItem>
                      <SelectItem value="60s">
                        60 Second Investor Pitch
                      </SelectItem>
                      <SelectItem value="90s">
                        90 Second Demo Narration
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Voice Type Selector */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <label className="block text-sm font-medium text-left">
                    Voice Type
                  </label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Choose the voice style for audio generation</p>
                      <p className="text-xs text-muted-foreground">
                        Powered by ElevenLabs Flash v2.5
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select
                  value={voiceType}
                  onValueChange={(value) => setVoiceType(value as VoiceType)}
                  disabled={isLoading}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional_female">
                      👩‍💼 Professional Female
                    </SelectItem>
                    <SelectItem value="professional_male">
                      👨‍💼 Professional Male
                    </SelectItem>
                    <SelectItem value="energetic">⚡ Energetic</SelectItem>
                    <SelectItem value="calm">🧘 Calm & Soothing</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? loadingStage : 'Generate Pitch'}
              </button>

              {/* Error Display */}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md p-3">
                  {error}
                </div>
              )}
            </div>
          </div>

          {/* Repository Analysis */}
          {repoData && (
            <div>
              <RepoAnalyzer data={repoData} />
            </div>
          )}

          {/* Pitch Display with Language Switching */}
          {currentLanguageData.translatedText && (
            <div>
              <PitchDisplay
                pitchText={currentLanguageData.translatedText}
                audioUrl={currentLanguageData.audioUrl}
                language={selectedLang}
                onLanguageChange={handleLanguageChange}
                isGeneratingAudio={isGeneratingAudio}
                languageCache={languageCache}
              />
            </div>
          )}
        </div>
      </Container>
    </TooltipProvider>
  );
}

function getLanguageName(code: Language): string {
  const names = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    ja: 'Japanese',
    hi: 'Hindi',
    de: 'German',
  };
  return names[code];
}
