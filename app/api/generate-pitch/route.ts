import { NextRequest, NextResponse } from 'next/server';
import { generatePitch, PitchType } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { repoData, pitchType } = body;

    if (!repoData || !pitchType) {
      return NextResponse.json(
        { error: 'Repository data and pitch type are required' },
        { status: 400 },
      );
    }

    if (!['30s', '60s', '90s'].includes(pitchType)) {
      return NextResponse.json(
        { error: 'Invalid pitch type. Must be 30s, 60s, or 90s' },
        { status: 400 },
      );
    }

    const result = await generatePitch(repoData, pitchType as PitchType);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Pitch generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate pitch' },
      { status: 500 },
    );
  }
}
