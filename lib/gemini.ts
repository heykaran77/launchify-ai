import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' }); // User requested Gemini 2 Flash Lite

export type PitchType = '30s' | '60s' | '90s';

export interface PitchResult {
  pitchText: string;
  wordCount: number;
  estimatedTime: number; // in seconds
}

interface RepoContext {
  name: string;
  description: string | null;
  techStack: string[];
  readmeSummary: string;
  stars: number;
  forks: number;
}

/**
 * Generate pitch prompt based on type
 */
/**
 * Generate pitch prompt based on type
 */
function buildPrompt(repoContext: RepoContext, pitchType: PitchType): string {
  const targetLength =
    pitchType === '30s'
      ? '75-90 words'
      : pitchType === '60s'
        ? '150-180 words'
        : '225-270 words';

  const focusMap = {
    '30s': 'core value proposition',
    '60s': 'problem-solution-differentiation',
    '90s': 'comprehensive story with technical depth',
  };

  return `You are an expert startup pitch consultant and technical storyteller.

CONTEXT:
Repository: ${repoContext.name}
Description: ${repoContext.description || 'Not provided'}
Tech Stack: ${repoContext.techStack.join(', ')}
GitHub Stars: ${repoContext.stars} | Forks: ${repoContext.forks || 0}
Readme Summary: ${repoContext.readmeSummary}

TASK:
Create a ${pitchType} ${focusMap[pitchType]} startup pitch for this repository.

REQUIREMENTS:
- Length: Exactly ${targetLength} for natural speech delivery
- Focus: ${focusMap[pitchType]}
- Structure:
  ${
    pitchType === '30s'
      ? '1. Hook (problem/opportunity)\n  2. Solution (what this does)\n  3. Impact (why it matters)'
      : pitchType === '60s'
        ? '1. Problem (15-20%)\n  2. Solution (40-50%)\n  3. Market/Traction (15-20%)\n  4. Call-to-action (10-15%)'
        : '1. Opening hook (10%)\n  2. Problem context (20%)\n  3. Technical solution (40%)\n  4. Differentiation (15%)\n  5. Growth/Vision (15%)'
  }
- Tone: Professional yet conversational, enthusiastic but credible
- Language: Simple, jargon-free explanations (except when tech stack is relevant)
- Avoid: Generic buzzwords, hyperbolic claims, over-technical details

OUTPUT FORMAT:
Return ONLY the pitch text. No preamble, no labels, no metadata. 
Start immediately with the first sentence of the pitch.

QUALITY CHECKLIST:
✓ Speaks naturally when read aloud
✓ Clear problem-solution narrative
✓ Specific to this repository (not generic)
✓ Highlights unique technical approach
✓ Creates emotional connection
✓ Actionable next step/vision

Generate the pitch now:`;
}

/**
 * Generate a startup pitch using Gemini
 */
export async function generatePitch(
  repoContext: RepoContext,
  pitchType: PitchType,
): Promise<PitchResult> {
  try {
    const prompt = buildPrompt(repoContext, pitchType);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const pitchText = response.text().trim();

    // Calculate word count and estimated speaking time
    const wordCount = pitchText.split(/\s+/).length;
    const estimatedTime = Math.round(wordCount * 0.4); // ~150 words/minute = 0.4 seconds/word

    return {
      pitchText,
      wordCount,
      estimatedTime,
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      statusText: error.statusText,
    });
    throw new Error(`Failed to generate pitch: ${error.message}`);
  }
}

/**
 * Regenerate pitch with feedback (for alternative versions)
 */
export async function refinePitch(
  originalPitch: string,
  repoContext: RepoContext,
  pitchType: PitchType,
  feedback?: string,
): Promise<PitchResult> {
  const refinementPrompt = `You previously generated this pitch:
"${originalPitch}"

${feedback ? `Feedback: ${feedback}` : 'Generate an alternative version with a different angle or emphasis.'}

Create a new ${pitchType} pitch following the same guidelines but with fresh phrasing and structure.`;

  try {
    const result = await model.generateContent(refinementPrompt);
    const response = await result.response;
    const pitchText = response.text().trim();

    const wordCount = pitchText.split(/\s+/).length;
    const estimatedTime = Math.round(wordCount * 0.4);

    return {
      pitchText,
      wordCount,
      estimatedTime,
    };
  } catch (error: any) {
    throw new Error(`Failed to refine pitch: ${error.message}`);
  }
}
