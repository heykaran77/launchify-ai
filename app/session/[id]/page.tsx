'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getSession, Session } from '@/lib/sessions';
import { ReactFlowProvider } from 'reactflow';
import Canvas from '@/components/canvas/Canvas';

export default function SessionPage() {
  const params = useParams();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate session on load
    const sessionId = params.id as string;
    const currentSession = getSession(sessionId);

    if (!currentSession) {
      // Session not found, redirect to home
      router.push('/');
      return;
    }

    setSession(currentSession);
    setIsLoading(false);
  }, [params.id, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="bg-background h-screen w-screen">
      <ReactFlowProvider>
        <Canvas session={session!} />
      </ReactFlowProvider>
    </div>
  );
}
