import { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Sparkles,
  RefreshCw,
  Languages,
  Loader2,
  Copy,
  Check,
  Play,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { useCanvasStore } from '@/store/useCanvasStore';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface GeminiNodeData {
  sourceNodeId: string;
  repoData: any;
  language: string;
  pitchType?: '30s' | '60s' | '90s';
  generatedPitch?: string;
}

export default function GeminiNode({ data, id }: NodeProps<GeminiNodeData>) {
  const [pitchType, setPitchType] = useState<'30s' | '60s' | '90s'>(
    data.pitchType || '60s',
  );
  const [pitch, setPitch] = useState(data.generatedPitch || '');
  const [pitchTime, setPitchTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Caching state to prevent re-generation of same params
  const [cachedPitch, setCachedPitch] = useState<{
    '30s'?: { text: string; time: number };
    '60s'?: { text: string; time: number };
    '90s'?: { text: string; time: number };
  }>({});

  const { addNode, nodes, addEdge } = useCanvasStore();

  const [error, setError] = useState<string | null>(null);

  // Initialize cache with passed data if available
  useEffect(() => {
    if (data.generatedPitch && data.pitchType) {
      // Estimate time if not provided (approx 150 wpm = 0.4s per word)
      const wordCount = data.generatedPitch.split(/\s+/).length;
      const time = Math.round(wordCount * 0.4);
      setCachedPitch((prev) => ({
        ...prev,
        [data.pitchType!]: { text: data.generatedPitch!, time },
      }));
      if (data.pitchType === pitchType) {
        setPitchTime(time);
      }
    }
  }, [data.generatedPitch, data.pitchType]);

  const generatePitch = async () => {
    setError(null);
    // Check cache first
    if (cachedPitch[pitchType]) {
      setPitch(cachedPitch[pitchType]!.text);
      setPitchTime(cachedPitch[pitchType]!.time);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoData: data.repoData,
          pitchType,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to generate pitch');
      }

      const result = await res.json();
      setPitch(result.pitchText);
      setPitchTime(result.estimatedTime);
      setCachedPitch((prev) => ({
        ...prev,
        [pitchType]: { text: result.pitchText, time: result.estimatedTime },
      }));
    } catch (error: any) {
      console.error('Pitch generation failed:', error);
      setError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = () => {
    // Explicit regeneration creates a new variant node
    const newNodeId = nanoid();
    const currentNodeIndex = nodes.findIndex((n) => n.id === id);
    const currentNode = nodes[currentNodeIndex];

    // Offset position for visual clarity
    const position = {
      x: currentNode.position.x + 50,
      y: currentNode.position.y + 50,
    };

    const newNode = {
      id: newNodeId,
      type: 'gemini',
      position,
      data: {
        sourceNodeId: data.sourceNodeId,
        repoData: data.repoData,
        language: data.language,
        pitchType,
        // Start fresh without generated content
      },
    };

    addNode(newNode);

    // Connect to same source
    addEdge({
      id: `e-${data.sourceNodeId}-${newNodeId}`,
      source: data.sourceNodeId,
      target: newNodeId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#a855f7' },
    });
  };

  const handleTranslate = () => {
    const newNodeId = nanoid();
    const currentNodeIndex = nodes.findIndex((n) => n.id === id);
    const currentNode = nodes[currentNodeIndex];

    const newNode = {
      id: newNodeId,
      type: 'lingo',
      position: {
        x: currentNode.position.x + 450,
        y: currentNode.position.y,
      },
      data: {
        sourceNodeId: id,
        sourceText: pitch,
        sourceLang: 'en',
        targetLang: data.language,
      },
    };

    addNode(newNode);

    addEdge({
      id: `e-${id}-${newNodeId}`,
      source: id,
      target: newNodeId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#3b82f6' }, // Blue edge
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(pitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to render content to avoid complex nested ternaries
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-muted-foreground flex h-40 flex-col items-center justify-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <span className="text-sm">Crafting your pitch...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-destructive flex h-40 flex-col items-center justify-center p-2 text-center">
          <p className="mb-2 text-xs font-medium">Generation Failed</p>
          <p className="text-muted-foreground mb-4 max-w-[250px] text-[10px]">
            {error}
          </p>
          <Button
            onClick={generatePitch}
            size="sm"
            variant="outline"
            className="h-7 text-xs"
          >
            Try Again
          </Button>
        </div>
      );
    }

    const currentPitchText = cachedPitch[pitchType]?.text || pitch;
    const currentTime = cachedPitch[pitchType]?.time || pitchTime;

    if (currentPitchText) {
      return (
        <div className="space-y-2">
          <div className="text-muted-foreground mb-1 flex items-center justify-between border-b pb-1 text-[10px]">
            <span>Generated Pitch</span>
            <span className="bg-muted flex items-center gap-1 rounded px-1.5 py-0.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500"></span>
              ~{currentTime}s speech
            </span>
          </div>
          <p className="text-foreground/90 text-sm leading-relaxed font-medium whitespace-pre-wrap">
            {currentPitchText}
          </p>
        </div>
      );
    }

    // Empty state
    return (
      <div className="text-muted-foreground flex h-40 flex-col items-center justify-center">
        <p className="mb-4 max-w-[200px] text-center text-sm">
          Select a duration and generate your startup pitch.
        </p>
        <Button
          onClick={generatePitch}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Play className="mr-2 h-3 w-3" />
          Generate Pitch
        </Button>
      </div>
    );
  };

  return (
    <Card className="bg-card w-[400px] border-purple-500/20 shadow-lg">
      <Handle
        type="target"
        position={Position.Left}
        className="border-background h-3 w-3 border-2 bg-purple-500"
      />

      <CardHeader className="bg-purple-500/5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-purple-200 bg-purple-500/10 text-purple-600"
          >
            <Sparkles className="h-3 w-3" />
            Gemini Pitch
          </Badge>
          <div className="flex items-center gap-2">
            <Tabs
              value={pitchType}
              onValueChange={(v: string) => {
                const newType = v as '30s' | '60s' | '90s';
                setPitchType(newType);
                // If we have cached content for this type, update immediately
                if (cachedPitch[newType]) {
                  setPitch(cachedPitch[newType]!.text);
                  setPitchTime(cachedPitch[newType]!.time);
                }
              }}
              className="h-6"
            >
              <TabsList className="h-6 bg-transparent p-0">
                <TabsTrigger
                  value="30s"
                  className="h-6 px-2 text-[10px]"
                  disabled={isLoading}
                >
                  30s
                </TabsTrigger>
                <TabsTrigger
                  value="60s"
                  className="h-6 px-2 text-[10px]"
                  disabled={isLoading}
                >
                  60s
                </TabsTrigger>
                <TabsTrigger
                  value="90s"
                  className="h-6 px-2 text-[10px]"
                  disabled={isLoading}
                >
                  90s
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[200px] w-full border-y">
          <div className="p-4">{renderContent()}</div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="bg-muted/20 flex justify-between p-3">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 w-8 p-0"
            disabled={!pitch && !cachedPitch[pitchType]}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          {(pitch || cachedPitch[pitchType]) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRegenerate}
              disabled={isLoading}
              className="h-8 text-xs"
              title="Create a new variant"
            >
              <RefreshCw className="mr-2 h-3 w-3" />
              New Variant
            </Button>
          )}
        </div>

        {(pitch || cachedPitch[pitchType]) && (
          <Button
            size="sm"
            onClick={handleTranslate}
            disabled={isLoading}
            className="h-8 bg-purple-600 text-xs hover:bg-purple-700"
          >
            <Languages className="mr-2 h-3 w-3" />
            Translate
          </Button>
        )}
      </CardFooter>

      <Handle
        type="source"
        position={Position.Right}
        className="border-background h-3 w-3 border-2 bg-purple-500"
      />
    </Card>
  );
}
