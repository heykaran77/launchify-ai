'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/lib/sessions';
import Container from '@/components/common/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle2, Github, Globe, Mic } from 'lucide-react';
import GreenGrainient from '@/components/common/GreenGrainient';

export default function LandingPage() {
  const [repoUrl, setRepoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;

    setIsLoading(true);
    try {
      // Create a new session and redirect to the canvas
      const session = createSession(repoUrl);
      router.push(`/session/${session.id}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Background */}
      <GreenGrainient />

      {/* Content */}
      <Container className="relative z-10">
        <div className="mx-auto max-w-3xl py-32 text-center">
          <h1 className="text-4xl font-semibold tracking-tighter text-white mix-blend-difference sm:text-5xl md:text-6xl">
            Transform Your GitHub Repo into a{' '}
            <span className="font-playfair-italic text-shadow-accent font-semibold tracking-[-4px]">
              startup pitch
            </span>
          </h1>

          <p className="mt-6 text-base text-white sm:text-xl">
            AI-powered analysis, professional pitch generation, and voice
            narration. Turn code into compelling stories in minutes. No coding
            required.
          </p>

          <div className="mt-8 flex justify-center rounded-lg bg-black/20 px-4 py-8 ring-2 ring-black/30 backdrop-blur-sm">
            <form onSubmit={handleAnalyze} className="w-full max-w-lg">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1 text-neutral-700">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Github className="h-5 w-5" />
                  </div>
                  <Input
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="h-12 pl-10 text-white placeholder:text-neutral-700 focus-visible:ring-2 focus-visible:ring-black/30"
                    required
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="h-12 text-black"
                  disabled={isLoading}
                >
                  {isLoading ? 'Analyzing...' : 'Start Analysis'}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </div>
  );
}
