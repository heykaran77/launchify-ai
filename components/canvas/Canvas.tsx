'use client';

import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { Session } from '@/lib/sessions';
import { useCanvasStore } from '@/store/useCanvasStore';
import GitHubNode from './nodes/GitHubNode';
import { Button } from '@/components/ui/button';
import { Download, Save } from 'lucide-react';

import GeminiNode from './nodes/GeminiNode';

import LingoNode from './nodes/LingoNode';

import VoiceNode from './nodes/VoiceNode';
import DeletableEdge from './edges/DeletableEdge';

const nodeTypes = {
  github: GitHubNode,
  gemini: GeminiNode,
  lingo: LingoNode,
  voice: VoiceNode,
};

const edgeTypes = {
  deletable: DeletableEdge,
};

interface CanvasProps {
  session: Session;
}

export default function Canvas({ session }: CanvasProps) {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setNodes,
    setEdges,
    addNode,
  } = useCanvasStore();

  const { fitView } = useReactFlow();

  // Initialize canvas with session data
  useEffect(() => {
    if (session.nodes.length > 0) {
      setNodes(session.nodes);
      setEdges(session.edges || []);
    } else {
      // Create initial GitHub node if session is empty
      const initialNode = {
        id: 'github-root',
        type: 'github',
        position: { x: 250, y: 50 },
        data: { url: session.githubUrl },
      };
      setNodes([initialNode]);
    }
  }, [session, setNodes, setEdges]);

  // Fit view on mount/update
  useEffect(() => {
    setTimeout(() => fitView({ padding: 0.2 }), 100);
  }, [nodes.length, fitView]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={{ type: 'deletable', animated: true }}
        fitView
        className="bg-background"
      >
        <Background gap={16} size={1} />
        <Controls />
        {/* <MiniMap /> */}

        <Panel position="top-right" className="flex gap-2">
          <Button size="sm" variant="outline">
            <Save className="mr-2 h-4 w-4" />
            Save Session
          </Button>
          <Button size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  );
}
