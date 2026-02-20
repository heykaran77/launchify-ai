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
    '30s': 'clear value proposition',
    '60s': 'problem-solution-market narrative',
    '90s': 'complete startup story with product clarity',
  };

  return `You are an experienced startup founder helping turn real GitHub projects into credible startup pitches.

CONTEXT:
Repository: ${repoContext.name}
Description: ${repoContext.description || 'Not provided'}
Tech Stack: ${repoContext.techStack.join(', ')}
GitHub Stars: ${repoContext.stars} | Forks: ${repoContext.forks || 0}
Readme Summary: ${repoContext.readmeSummary}

TASK:
Create a ${pitchType} ${focusMap[pitchType]} startup pitch based on this repository.

IMPORTANT:
This is NOT a technical explanation.
This is a realistic startup pitch grounded in what the product actually does.
Do not exaggerate traction or invent metrics.
Do not over-focus on the tech stack unless it directly strengthens the value proposition.

REQUIREMENTS:
- Length: Exactly ${targetLength} for natural spoken delivery
- Focus: ${focusMap[pitchType]}
- Make the product sound real, usable, and positioned in a believable market
- Emphasize user value, problem clarity, and practical impact
- Mention traction only if implied by stars/forks (without fabricating numbers)
- Keep technical references minimal and outcome-focused

STRUCTURE:
  ${
    pitchType === '30s'
      ? '1. Clear problem\n  2. Practical solution\n  3. Why it matters now'
      : pitchType === '60s'
        ? '1. Problem context (15-20%)\n  2. Product solution (40-50%)\n  3. Market relevance or early validation (15-20%)\n  4. Clear next step or vision (10-15%)'
        : '1. Opening hook (10%)\n  2. Real-world problem (20%)\n  3. Product explanation (40%)\n  4. Differentiation (15%)\n  5. Vision and growth direction (15%)'
  }

TONE:
- Confident but grounded
- Clear and concise
- Investor-ready but not hype-driven
- Conversational and natural when spoken aloud

AVOID:
- Buzzwords (revolutionary, game-changing, cutting-edge, etc.)
- Unrealistic market domination claims
- Deep technical breakdowns
- Generic startup clichés
- Fabricated traction or metrics

OUTPUT FORMAT:
Return ONLY the pitch text.
No headings.
No labels.
No formatting.
Start directly with the first sentence of the pitch.

QUALITY CHECK:
✓ Sounds believable
✓ Specific to this repository
✓ Clearly explains user benefit
✓ Feels like a real early-stage startup
✓ Natural spoken rhythm
✓ Ends with a forward-looking direction or call to action

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
