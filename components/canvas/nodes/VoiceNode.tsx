import { useState, useEffect, useRef } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Mic,
  Play,
  Pause,
  Download,
  Loader2,
  Volume2,
  RotateCcw,
} from 'lucide-react';
import { useCanvasStore } from '@/store/useCanvasStore';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';

interface VoiceNodeData {
  sourceNodeId: string;
  text: string;
  language: string;
}

export default function VoiceNode({ data, id }: NodeProps<VoiceNodeData>) {
  const [voiceType, setVoiceType] = useState('executive_female');
  const [audioBase64, setAudioBase64] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([1.0]);

  // Cache for generated audio URLs: { 'executive_female': 'url...' }
  const [cache, setCache] = useState<Record<string, string>>({});

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // When voice type changes, check cache
  useEffect(() => {
    if (cache[voiceType]) {
      setAudioBase64(cache[voiceType]);
    } else {
      setAudioBase64('');
    }
  }, [voiceType, cache]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume[0];
    }
  }, [volume]);

  const handleGenerateAudio = async () => {
    // Check cache
    if (cache[voiceType]) {
      setAudioBase64(cache[voiceType]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: data.text,
          language: data.language,
          voiceType,
        }),
      });

      if (!res.ok) throw new Error('Audio generation failed');

      const result = await res.json();
      setAudioBase64(result.audioBase64);
      setCache((prev) => ({ ...prev, [voiceType]: result.audioBase64 }));
    } catch (error) {
      console.error('Audio error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioBase64) return;
    const link = document.createElement('a');
    link.href = audioBase64;
    link.download = `pitch-${voiceType}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="bg-card w-[350px] border-green-500/20 shadow-lg">
      <Handle
        type="target"
        position={Position.Left}
        className="border-background h-3 w-3 border-2 bg-green-500"
      />

      <CardHeader className="bg-green-500/5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-green-200 bg-green-500/10 text-green-600"
          >
            <Mic className="h-3 w-3" />
            Voice Generation
          </Badge>
          <div className="text-muted-foreground font-mono text-xs uppercase">
            {data.language === 'en' ? 'English' : data.language}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 py-4">
        <div className="space-y-2 px-1">
          <label className="text-muted-foreground text-xs font-medium">
            Voice Style
          </label>
          <Select value={voiceType} onValueChange={setVoiceType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="executive_female">
                Executive Female (Sarah)
              </SelectItem>
              <SelectItem value="executive_male">
                Executive Male (Brian)
              </SelectItem>
              <SelectItem value="presenter_female">
                Presenter Female (Rachel)
              </SelectItem>
              <SelectItem value="presenter_male">
                Presenter Male (Callum)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Audio Player UI */}
        <div className="bg-muted/50 flex min-h-[100px] flex-col justify-center gap-4 rounded-md p-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              <span className="text-muted-foreground text-xs">
                Generating audio...
              </span>
            </div>
          ) : audioBase64 ? (
            <>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 shrink-0 rounded-full border-green-500/30 text-green-600 hover:bg-green-500/10"
                  onClick={togglePlay}
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="ml-0.5 h-5 w-5" />
                  )}
                </Button>
                <div className="flex-1 space-y-1">
                  {/* Fake visualizer using simple bars */}
                  <div className="flex h-8 w-full items-end justify-between gap-0.5 px-1 opacity-50">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-t-sm bg-green-500 transition-all duration-300 ${isPlaying ? 'animate-pulse' : ''}`}
                        style={{
                          height: `${Math.max(20, Math.random() * 100)}%`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Audio Element */}
              <audio
                ref={audioRef}
                src={audioBase64}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 py-2">
              <p className="text-muted-foreground px-4 text-center text-xs">
                Ready to convert text to speech. Select a voice style above.
              </p>
              <Button
                size="sm"
                onClick={handleGenerateAudio}
                className="bg-green-600 hover:bg-green-700"
              >
                <Mic className="mr-2 h-3 w-3" />
                Generate Audio
              </Button>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="bg-muted/20 flex items-center justify-between p-3">
        <div className="flex w-1/2 items-center gap-2">
          {audioBase64 && (
            <>
              <Volume2 className="text-muted-foreground h-3 w-3" />
              <Slider
                value={volume}
                onValueChange={setVolume}
                max={1}
                step={0.1}
                className="w-20"
              />
            </>
          )}
        </div>

        {audioBase64 && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleGenerateAudio}
              title="Regenerate"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              onClick={handleDownload}
              className="h-8 bg-green-600 text-xs hover:bg-green-700"
            >
              <Download className="mr-2 h-3 w-3" />
              Download
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
