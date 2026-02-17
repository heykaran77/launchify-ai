'use client';

import { FiStar, FiGitBranch, FiActivity } from 'react-icons/fi';

interface RepoData {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  techStack: string[];
  readmeSummary: string;
  commitActivity: number;
  confidenceScore: number;
}

interface RepoAnalyzerProps {
  data: RepoData;
}

export default function RepoAnalyzer({ data }: RepoAnalyzerProps) {
  return (
    <div className="bg-card border-border rounded-lg border p-6 shadow-sm">
      <h2 className="mb-4 text-2xl font-semibold">{data.name}</h2>

      {data.description && (
        <p className="text-muted-foreground mb-4">{data.description}</p>
      )}

      {/* Metrics Row */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <FiStar className="text-primary" />
          <span className="text-sm">{data.stars.toLocaleString()} stars</span>
        </div>
        <div className="flex items-center gap-2">
          <FiGitBranch className="text-primary" />
          <span className="text-sm">{data.forks.toLocaleString()} forks</span>
        </div>
        <div className="flex items-center gap-2">
          <FiActivity className="text-primary" />
          <span className="text-sm">{data.commitActivity} recent commits</span>
        </div>
      </div>

      {/* Tech Stack */}
      {data.techStack.length > 0 && (
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-medium">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {data.techStack.map((tech) => (
              <span
                key={tech}
                className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-medium">Investor Confidence Score</h3>
          <span className="text-primary text-lg font-semibold">
            {data.confidenceScore}/100
          </span>
        </div>
        <div className="bg-secondary h-2 w-full rounded-full">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${data.confidenceScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
