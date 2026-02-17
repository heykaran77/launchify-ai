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
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h2 className="text-2xl font-semibold mb-4">{data.name}</h2>

      {data.description && (
        <p className="text-muted-foreground mb-4">{data.description}</p>
      )}

      {/* Metrics Row */}
      <div className="flex flex-wrap gap-4 mb-6">
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
          <h3 className="text-sm font-medium mb-2">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {data.techStack.map((tech) => (
              <span
                key={tech}
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Confidence Score */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Investor Confidence Score</h3>
          <span className="text-lg font-semibold text-primary">
            {data.confidenceScore}/100
          </span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${data.confidenceScore}%` }}
          />
        </div>
      </div>
    </div>
  );
}
