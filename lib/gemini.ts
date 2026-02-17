import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' }); // Using flash for faster responses

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
}

/**
 * Generate pitch prompt based on type
 */
function buildPrompt(repoContext: RepoContext, pitchType: PitchType): string {
  const targetWordCount = {
    '30s': 70,
    '60s': 130,
    '90s': 200,
  }[pitchType];

  const pitchStyle = {
    '30s': 'elevator pitch',
    '60s': 'investor pitch',
    '90s': 'product demo narration',
  }[pitchType];

  const structure = {
    '30s':
      'Open with a bold problem statement, present the solution in one clear sentence, and end with a memorable hook.',
    '60s':
      'Start with the problem your target users face, explain your solution and unique approach, mention any traction or validation, and close with the vision.',
    '90s':
      'Set the context of the problem space, walk through key features and how they solve real pain points, emphasize technical innovation or unique approach, and end with a clear call-to-action.',
  }[pitchType];

  return `You are an expert startup pitch writer with deep knowledge of developer tools and technical products.

**Repository Context:**
- Project Name: ${repoContext.name}
- Description: ${repoContext.description || 'Not provided'}
- Tech Stack: ${repoContext.techStack.join(', ')}
- GitHub Stars: ${repoContext.stars}
- About: ${repoContext.readmeSummary}

**Your Task:**
Create a compelling ${pitchStyle} that will be delivered as a voice narration.

**Requirements:**
- Target length: ${targetWordCount} words (±10 words)
- Structure: ${structure}
- Tone: Confident, visionary, and technical but accessible
- Focus on BENEFITS not just features (answer "so what?" for every claim)
- Use specific, concrete language over vague terms
- Make it sound natural when spoken aloud
- Avoid marketing clichés like "revolutionary," "game-changing," "cutting-edge"

**Structure Guidelines:**
${structure}

Generate ONLY the pitch text. No preamble, no explanations, just the pitch script.`;
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
