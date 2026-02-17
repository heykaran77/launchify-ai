import { NextRequest, NextResponse } from 'next/server';
import { analyzeRepository } from '@/lib/github';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'GitHub URL is required' },
        { status: 400 },
      );
    }

    const repoData = await analyzeRepository(url);

    return NextResponse.json(repoData);
  } catch (error: any) {
    console.error('Repo analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze repository' },
      { status: 500 },
    );
  }
}
