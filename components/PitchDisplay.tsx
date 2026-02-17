"use client";

import { useState, useRef, useEffect } from "react";
import { FiPlay, FiPause, FiDownload, FiCopy, FiCheck } from "react-icons/fi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

type Language = "en" | "es" | "fr" | "ja" | "hi" | "de";

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
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pitchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const getLanguageLabel = (code: Language) => {
    const labels = {
      en: "English",
      es: "Spanish",
      fr: "French",
      ja: "Japanese",
      hi: "Hindi",
      de: "German",
    };
    return labels[code];
  };

  // Check if a language has cached content
  const hasLanguageContent = (lang: Language) => {
    return languageCache[lang].translatedText !== "";
  };

  return (
    <TooltipProvider>
      <div className="bg-card border-border space-y-6 rounded-lg border p-6 shadow-sm">
        {/* Header with Language Selector */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Generated Pitch</h2>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="text-muted-foreground h-4 w-4 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Switch languages to see cached translations</p>
                <p className="text-muted-foreground text-xs">
                  ✓ = Already translated
                </p>
              </TooltipContent>
            </Tooltip>
            <Select
              value={language}
              onValueChange={(value) => onLanguageChange(value as Language)}
              disabled={isGeneratingAudio}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  🇬🇧 English {hasLanguageContent("en") && "✓"}
                </SelectItem>
                <SelectItem value="es">
                  🇪🇸 Spanish {hasLanguageContent("es") && "✓"}
                </SelectItem>
                <SelectItem value="fr">
                  🇫🇷 French {hasLanguageContent("fr") && "✓"}
                </SelectItem>
                <SelectItem value="ja">
                  🇯🇵 Japanese {hasLanguageContent("ja") && "✓"}
                </SelectItem>
                <SelectItem value="hi">
                  🇮🇳 Hindi {hasLanguageContent("hi") && "✓"}
                </SelectItem>
                <SelectItem value="de">
                  🇩🇪 German {hasLanguageContent("de") && "✓"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pitch Text */}
        <div className="relative">
          <div className="bg-secondary/50 border-border rounded-md border p-4 text-sm leading-relaxed whitespace-pre-wrap">
            {pitchText}
          </div>
          <button
            onClick={handleCopy}
            className="hover:bg-background absolute top-2 right-2 rounded-md p-2 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <FiCheck className="text-primary h-4 w-4" />
            ) : (
              <FiCopy className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Audio Player - Show skeleton if generating, otherwise show player */}
        {isGeneratingAudio && !audioUrl ? (
          <div className="bg-secondary/30 border-border space-y-3 rounded-md border p-4">
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
          <div className="bg-secondary/30 border-border space-y-3 rounded-md border p-4">
            {/* Play/Pause and Download Row */}
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                disabled={!audioUrl}
                className="bg-primary text-primary-foreground shrink-0 rounded-full p-3 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPlaying ? (
                  <FiPause className="h-5 w-5" />
                ) : (
                  <FiPlay className="ml-0.5 h-5 w-5" />
                )}
              </button>

              {/* Progress Bar and Time */}
              <div className="flex-1 space-y-2">
                {/* Progress Bar */}
                <div
                  className="bg-secondary relative h-2 cursor-pointer rounded-full"
                  onClick={handleProgressClick}
                >
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Time Display */}
                <div className="text-muted-foreground flex justify-between text-xs">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <a
                href={audioUrl}
                download={`pitch_${language}.mp3`}
                className="bg-background border-border hover:bg-secondary flex shrink-0 items-center gap-2 rounded-md border px-4 py-2 transition-colors"
              >
                <FiDownload className="h-4 w-4" />
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
            languageCache[lang as Language].translatedText !== "" &&
            lang !== language,
        ) && (
          <div className="text-muted-foreground text-xs">
            Available languages:{" "}
            {(["en", "es", "fr", "ja", "hi", "de"] as Language[])
              .filter((lang) => hasLanguageContent(lang))
              .map((lang) => getLanguageLabel(lang))
              .join(", ")}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
