import { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Github, Star, GitFork, AlertCircle, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCanvasStore } from '@/store/useCanvasStore';
import { nanoid } from 'nanoid';

interface GitHubNodeData {
  url: string;
  repoData?: any; // Will type properly later
}

export default function GitHubNode({ data, id }: NodeProps<GitHubNodeData>) {
  const [selectedLang, setSelectedLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [repoData, setRepoData] = useState<any>(data.repoData || null);

  const { addNode, nodes } = useCanvasStore();

  const handleAnalyze = async () => {
    if (!data.url) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/analyze-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: data.url }),
      });

      if (!res.ok) throw new Error('Failed to analyze repository');

      const result = await res.json();
      setRepoData(result);

      // Update node data in store so it persists
      // (Implementation pending in store actions)
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePitch = () => {
    if (!repoData) return;

    // Create a new Gemini Node connected to this one
    const newNodeId = nanoid();
    const newNode = {
      id: newNodeId,
      type: 'gemini',
      position: { x: 600, y: 100 }, // Position to the right
      data: {
        sourceNodeId: id,
        repoData: repoData,
        language: selectedLang,
      },
    };

    addNode(newNode);

    // Create edge from GitHub to Gemini
    const { addEdge } = useCanvasStore.getState();
    addEdge({
      id: `e-${id}-${newNodeId}`,
      source: id,
      target: newNodeId,
      type: 'deletable',
      animated: true,
      style: { stroke: '#a855f7' }, // Purple edge
    });
  };

  return (
    <Card className="border-primary/20 w-[350px] shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="flex items-center gap-1">
            <Github className="h-3 w-3" />
            GitHub Repo
          </Badge>
          {repoData && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="flex items-center gap-0.5">
                <Star className="h-3 w-3" /> {repoData.stars}
              </span>
              <span className="flex items-center gap-0.5">
                <GitFork className="h-3 w-3" /> {repoData.forks}
              </span>
            </div>
          )}
        </div>
        <CardTitle className="mt-2 text-lg leading-tight">
          {repoData ? repoData.name : 'Repository Analysis'}
        </CardTitle>
        <CardDescription className="line-clamp-2">
          {repoData ? repoData.description : data.url}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!repoData ? (
          <div className="py-4 text-center">
            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Analyze Repository
            </Button>
            {error && (
              <p className="text-destructive mt-2 flex items-center justify-center gap-1 text-xs">
                <AlertCircle className="h-3 w-3" /> {error}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <label className="text-muted-foreground text-xs font-medium">
                Target Language
              </label>
              <Select value={selectedLang} onValueChange={setSelectedLang}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="hi">Hindi</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-muted/50 space-y-1 rounded p-2 text-xs">
              <p>
                <strong>Tech Stack:</strong> {repoData.techStack.join(', ')}
              </p>
              <p>
                <strong>Driven by:</strong> Google Gemini 2.0
              </p>
            </div>
          </>
        )}
      </CardContent>

      {repoData && (
        <CardFooter>
          <Button onClick={handleGeneratePitch} className="w-full">
            Generate Pitch Node
          </Button>
        </CardFooter>
      )}

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="bg-primary border-background h-3 w-3 border-2"
      />
    </Card>
  );
}
