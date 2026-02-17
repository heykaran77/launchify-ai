'use client';

import { useState, useRef, useEffect } from 'react';
import { FiPlay, FiPause, FiDownload, FiCopy, FiCheck } from 'react-icons/fi';
import { Skeleton } from '@/components/ui/skeleton';
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

type Language = 'en' | 'es' | 'fr' | 'ja' | 'hi' | 'de';

interface LanguageCache {
  translatedText: string;
  audioUrl: string;
}

interface PitchDisplayProps {
  pitchText: string;
  audioUrl: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  isGeneratingAudio: boolean;
  languageCache: Record<Language, LanguageCache>;
}

export default function PitchDisplay({
  pitchText,
  audioUrl,
  language,
  onLanguageChange,
  isGeneratingAudio,
  languageCache,
}: PitchDisplayProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Reset playback when audio URL changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.load();
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [audioUrl]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pitchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getLanguageLabel = (code: Language) => {
    const labels = {
      en: 'English',
      es: 'Spanish',
      fr: 'French',
      ja: 'Japanese',
      hi: 'Hindi',
      de: 'German',
    };
    return labels[code];
  };

  // Check if a language has cached content
  const hasLanguageContent = (lang: Language) => {
    return languageCache[lang].translatedText !== '';
  };

  return (
    <TooltipProvider>
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm space-y-6">
        {/* Header with Language Selector */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Generated Pitch</h2>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch languages to see cached translations</p>
                <p className="text-xs text-muted-foreground">
                  ✓ = Already translated
                </p>
              </TooltipContent>
            </Tooltip>
            <Select
              value={language}
              onValueChange={(value) => onLanguageChange(value as Language)}
              disabled={isGeneratingAudio}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  🇬🇧 English {hasLanguageContent('en') && '✓'}
                </SelectItem>
                <SelectItem value="es">
                  🇪🇸 Spanish {hasLanguageContent('es') && '✓'}
                </SelectItem>
                <SelectItem value="fr">
                  🇫🇷 French {hasLanguageContent('fr') && '✓'}
                </SelectItem>
                <SelectItem value="ja">
                  🇯🇵 Japanese {hasLanguageContent('ja') && '✓'}
                </SelectItem>
                <SelectItem value="hi">
                  🇮🇳 Hindi {hasLanguageContent('hi') && '✓'}
                </SelectItem>
                <SelectItem value="de">
                  🇩🇪 German {hasLanguageContent('de') && '✓'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pitch Text */}
        <div className="relative">
          <div className="bg-secondary/50 border border-border rounded-md p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {pitchText}
          </div>
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 hover:bg-background rounded-md transition-colors"
            title="Copy to clipboard">
            {copied ? (
              <FiCheck className="w-4 h-4 text-primary" />
            ) : (
              <FiCopy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Audio Player - Show skeleton if generating, otherwise show player */}
        {isGeneratingAudio && !audioUrl ? (
          <div className="bg-secondary/30 border border-border rounded-md p-4 space-y-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-10 w-28" />
            </div>
          </div>
        ) : audioUrl ? (
          <div className="bg-secondary/30 border border-border rounded-md p-4 space-y-3">
            {/* Play/Pause and Download Row */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                disabled={!audioUrl}
                className="bg-primary text-primary-foreground p-3 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
                {isPlaying ? (
                  <FiPause className="w-5 h-5" />
                ) : (
                  <FiPlay className="w-5 h-5 ml-0.5" />
                )}
              </button>

              {/* Progress Bar and Time */}
              <div className="flex-1 space-y-2">
                {/* Progress Bar */}
                <div
                  className="h-2 bg-secondary rounded-full cursor-pointer relative"
                  onClick={handleProgressClick}>
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Time Display */}
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <a
                href={audioUrl}
                download={`pitch_${language}.mp3`}
                className="flex items-center gap-2 px-4 py-2 bg-background border border-border rounded-md hover:bg-secondary transition-colors shrink-0">
                <FiDownload className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </a>
            </div>

            {/* Hidden Audio Element */}
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        ) : null}

        {/* Languages with cached content indicator */}
        {Object.keys(languageCache).some(
          (lang) =>
            languageCache[lang as Language].translatedText !== '' &&
            lang !== language,
        ) && (
          <div className="text-xs text-muted-foreground">
            Available languages:{' '}
            {(['en', 'es', 'fr', 'ja', 'hi', 'de'] as Language[])
              .filter((lang) => hasLanguageContent(lang))
              .map((lang) => getLanguageLabel(lang))
              .join(', ')}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
