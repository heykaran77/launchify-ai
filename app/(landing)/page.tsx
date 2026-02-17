'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSession } from '@/lib/sessions';
import Container from '@/components/common/Container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, CheckCircle2, Github, Globe, Mic } from 'lucide-react';

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
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col justify-center py-20 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Transform Your GitHub Repo into a{' '}
              <span className="text-primary">Startup Pitch</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg sm:text-xl">
              AI-powered analysis, professional pitch generation, and voice
              narration. Turn code into compelling stories in minutes. No coding
              required.
            </p>

            {/* Input Form */}
            <form onSubmit={handleAnalyze} className="mx-auto mt-10 max-w-lg">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative flex-1">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Github className="text-muted-foreground h-5 w-5" />
                  </div>
                  <Input
                    type="url"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="h-12 pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12"
                  disabled={isLoading}
                >
                  {isLoading ? 'Analyzing...' : 'Start Analysis'}
                  {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </div>
              <p className="text-muted-foreground mt-3 text-xs">
                Free to use while in beta. Powered by Google Gemini &
                ElevenLabs.
              </p>
            </form>
          </div>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="bg-muted/50 border-t py-20">
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Instant Analysis</h3>
              <p className="text-muted-foreground">
                Our AI deep-dives into your codebase, understanding technical
                complexity and business value instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Multi-Language</h3>
              <p className="text-muted-foreground">
                Generate native-quality pitches in 6 major languages to reach a
                global audience of investors.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-card rounded-xl border p-6 shadow-sm">
              <div className="bg-primary/10 text-primary mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                <Mic className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">Professional Voice</h3>
              <p className="text-muted-foreground">
                Bring your pitch to life with studio-quality AI narration in
                executive or presenter styles.
              </p>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
