import { useState, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  Languages,
  ArrowRight,
  Mic,
  Copy,
  Check,
  Loader2,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface LingoNodeData {
  sourceNodeId: string;
  sourceText: string;
  sourceLang: string;
  targetLang: string;
}

// Supported languages
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'ja', name: 'Japanese' },
  { code: 'hi', name: 'Hindi' },
  { code: 'de', name: 'German' },
];

export default function LingoNode({ data, id }: NodeProps<LingoNodeData>) {
  const [targetLang, setTargetLang] = useState(data.targetLang || 'es');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Cache translations: { 'es': 'Hola...', 'fr': 'Bonjour...' }
  const [cache, setCache] = useState<Record<string, string>>({});

  const { addNode, nodes, addEdge } = useCanvasStore();

  const handleTranslate = async () => {
    // If target is English and source is English (Gemini), just use source
    // But usually LingoNode is for OTHER languages.
    if (targetLang === 'en' && data.sourceLang === 'en') {
      setTranslatedText(data.sourceText);
      setCache((prev) => ({ ...prev, en: data.sourceText }));
      return;
    }

    // Check cache
    if (cache[targetLang]) {
      setTranslatedText(cache[targetLang]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/translate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: data.sourceText,
          targetLang,
        }),
      });

      if (!res.ok) throw new Error('Translation failed');

      const result = await res.json();
      setTranslatedText(result.translatedText);
      setCache((prev) => ({ ...prev, [targetLang]: result.translatedText }));
    } catch (error) {
      console.error('Translation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateVoice = () => {
    // Create Voice Node
    const newNodeId = nanoid();
    const currentNodeIndex = nodes.findIndex((n) => n.id === id);
    const currentNode = nodes[currentNodeIndex];

    const newNode = {
      id: newNodeId,
      type: 'voice',
      position: {
        x: currentNode.position.x + 400,
        y: currentNode.position.y,
      },
      data: {
        sourceNodeId: id,
        text: translatedText,
        language: targetLang,
      },
    };

    addNode(newNode);

    // Connect edge
    addEdge({
      id: `e-${id}-${newNodeId}`,
      source: id,
      target: newNodeId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#22c55e' }, // Green edge
    });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Check if we need to show the translate button (not translated yet OR language changed and not cached)
  const showTranslateAction =
    !translatedText || (translatedText && !cache[targetLang]);
  // Actually, if language changed, translatedText might still be the OLD language one if we didn't clear it.
  // Better logic:
  // If cache[targetLang] exists, show it immediately?
  // No, let's keep it manual as requested.
  // But if we switch back to a cached language, should we require a click?
  // User said "Prevent unneccessary api calls".
  // So if cached, we should just show it?

  // UX Decision:
  // When targetLang changes:
  // 1. If in cache -> Set translatedText immediately (no cost).
  // 2. If not in cache -> Clear translatedText (or show old one greyed out?) -> Show "Translate" button.

  useEffect(() => {
    if (cache[targetLang]) {
      setTranslatedText(cache[targetLang]);
    } else {
      // New language selected, clear text to avoid confusion?
      // Or keep old text but enable button?
      // Let's clear it to be distinct.
      setTranslatedText('');
    }
  }, [targetLang, cache]);

  return (
    <Card className="bg-card w-[400px] border-blue-500/20 shadow-lg">
      <Handle
        type="target"
        position={Position.Left}
        className="border-background h-3 w-3 border-2 bg-blue-500"
      />

      <CardHeader className="bg-blue-500/5 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <Badge
            variant="outline"
            className="flex items-center gap-1 border-blue-200 bg-blue-500/10 text-blue-600"
          >
            <Languages className="h-3 w-3" />
            Lingo Translation
          </Badge>
          <Select value={targetLang} onValueChange={setTargetLang}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className="h-[200px] w-full border-y">
          <div className="p-4">
            {isLoading ? (
              <div className="text-muted-foreground flex h-40 flex-col items-center justify-center space-y-2">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                <span className="text-xs">Translating content...</span>
              </div>
            ) : translatedText ? (
              <p className="text-foreground/90 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                {translatedText}
              </p>
            ) : (
              <div className="text-muted-foreground flex h-40 flex-col items-center justify-center">
                <p className="mb-4 max-w-[200px] text-center text-sm">
                  Select a language and translate.
                </p>
                <Button
                  onClick={handleTranslate}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Languages className="mr-2 h-3 w-3" />
                  Translate
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="bg-muted/20 flex justify-between p-3">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-8 w-8 p-0"
            disabled={!translatedText}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>

        {translatedText && (
          <Button
            size="sm"
            onClick={handleGenerateVoice}
            disabled={isLoading}
            className="h-8 bg-blue-600 text-xs hover:bg-blue-700"
          >
            <Mic className="mr-2 h-3 w-3" />
            Generate Audio
          </Button>
        )}
      </CardFooter>

      <Handle
        type="source"
        position={Position.Right}
        className="border-background h-3 w-3 border-2 bg-blue-500"
      />
    </Card>
  );
}
