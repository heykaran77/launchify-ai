import { Octokit } from '@octokit/rest';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || undefined,
});

export interface RepoData {
  owner: string;
  repo: string;
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  techStack: string[];
  readmeSummary: string;
  commitActivity: number;
  confidenceScore: number;
}

/**
 * Parse GitHub URL to extract owner and repo name
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } {
  const patterns = [/github\.com\/([^\/]+)\/([^\/]+)/, /^([^\/]+)\/([^\/]+)$/];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
  }

  throw new Error('Invalid GitHub URL format');
}

/**
 * Fetch repository metadata from GitHub API
 */
export async function fetchRepoData(owner: string, repo: string): Promise<any> {
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    return data;
  } catch (error: any) {
    throw new Error(`Failed to fetch repo: ${error.message}`);
  }
}

/**
 * Fetch README content from repository
 */
export async function fetchReadme(
  owner: string,
  repo: string,
): Promise<string> {
  try {
    const { data } = await octokit.repos.getReadme({ owner, repo });
    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return content;
  } catch (error) {
    return '';
  }
}

/**
 * Detect tech stack from package files
 */
export async function detectTechStack(
  owner: string,
  repo: string,
): Promise<string[]> {
  const techStack: Set<string> = new Set();

  // Check package.json for Node.js technologies
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'package.json',
    });

    if ('content' in data) {
      const packageJson = JSON.parse(
        Buffer.from(data.content, 'base64').toString('utf-8'),
      );

      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies,
      };

      // Detect frameworks and libraries
      if (allDeps['next']) techStack.add('Next.js');
      if (allDeps['react']) techStack.add('React');
      if (allDeps['vue']) techStack.add('Vue');
      if (allDeps['@angular/core']) techStack.add('Angular');
      if (allDeps['express']) techStack.add('Express');
      if (allDeps['typescript']) techStack.add('TypeScript');
      if (allDeps['tailwindcss']) techStack.add('Tailwind CSS');
      if (allDeps['@supabase/supabase-js']) techStack.add('Supabase');
      if (allDeps['prisma']) techStack.add('Prisma');
      if (allDeps['mongodb']) techStack.add('MongoDB');
      if (allDeps['postgres']) techStack.add('PostgreSQL');
    }
  } catch (error) {
    // File doesn't exist, skip
  }

  // Check requirements.txt for Python
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path: 'requirements.txt',
    });

    if ('content' in data) {
      const requirements = Buffer.from(data.content, 'base64').toString(
        'utf-8',
      );
      techStack.add('Python');

      if (requirements.includes('django')) techStack.add('Django');
      if (requirements.includes('flask')) techStack.add('Flask');
      if (requirements.includes('fastapi')) techStack.add('FastAPI');
    }
  } catch (error) {
    // File doesn't exist, skip
  }

  // Check Gemfile for Ruby
  try {
    await octokit.repos.getContent({ owner, repo, path: 'Gemfile' });
    techStack.add('Ruby');
    techStack.add('Rails'); // Assume Rails if Gemfile exists
  } catch (error) {
    // File doesn't exist, skip
  }

  // Check go.mod for Go
  try {
    await octokit.repos.getContent({ owner, repo, path: 'go.mod' });
    techStack.add('Go');
  } catch (error) {
    // File doesn't exist, skip
  }

  // Check Cargo.toml for Rust
  try {
    await octokit.repos.getContent({ owner, repo, path: 'Cargo.toml' });
    techStack.add('Rust');
  } catch (error) {
    // File doesn't exist, skip
  }

  return Array.from(techStack);
}

/**
 * Analyze recent commit activity
 */
export async function getCommitActivity(
  owner: string,
  repo: string,
): Promise<number> {
  try {
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 20,
    });

    return data.length;
  } catch (error) {
    return 0;
  }
}

/**
 * Calculate investor confidence score (0-100)
 */
export function calculateConfidenceScore(data: {
  stars: number;
  forks: number;
  readmeLength: number;
  commitActivity: number;
  techStackSize: number;
}): number {
  let score = 0;

  // Stars (max 30 points)
  score += Math.min((data.stars / 100) * 30, 30);

  // README quality (max 25 points)
  score += Math.min((data.readmeLength / 1000) * 25, 25);

  // Commit activity (max 20 points)
  score += Math.min((data.commitActivity / 20) * 20, 20);

  // Tech stack diversity (max 15 points)
  score += Math.min((data.techStackSize / 5) * 15, 15);

  // Forks (max 10 points)
  score += Math.min((data.forks / 50) * 10, 10);

  return Math.round(score);
}

/**
 * Complete repository analysis
 */
export async function analyzeRepository(url: string): Promise<RepoData> {
  const { owner, repo } = parseGitHubUrl(url);

  const [repoData, readme, techStack, commitActivity] = await Promise.all([
    fetchRepoData(owner, repo),
    fetchReadme(owner, repo),
    detectTechStack(owner, repo),
    getCommitActivity(owner, repo),
  ]);

  const readmeSummary = readme
    ? readme.split('\n').slice(0, 5).join('\n').substring(0, 300)
    : 'No README available';

  const confidenceScore = calculateConfidenceScore({
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    readmeLength: readme.length,
    commitActivity,
    techStackSize: techStack.length,
  });

  return {
    owner,
    repo,
    name: repoData.name,
    description: repoData.description,
    stars: repoData.stargazers_count || 0,
    forks: repoData.forks_count || 0,
    techStack,
    readmeSummary,
    commitActivity,
    confidenceScore,
  };
}
