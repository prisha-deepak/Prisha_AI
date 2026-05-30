export interface ReleaseDto {
  id: string;
  name: string;
  releaseDate: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  mergeRequestCount: number;
}

export interface MergeRequestAnalysisDto {
  branch: string;
  pillar: string;
  specFile: string;
  codeChanges: string[];
  impactedModules: string[];
  breakingChange: boolean;
  riskLevel: string;
  aiDescription: string;
}

export interface MergeRequestDto {
  id: string;
  provider: string;
  externalId: string;
  iid: number | null;
  title: string;
  description: string | null;
  author: string | null;
  sourceBranch: string;
  targetBranch: string;
  mergedAt: string | null;
  status: string;
  repository: {
    id: string;
    provider: string;
    name: string;
    url: string | null;
  };
  analysis: MergeRequestAnalysisDto | null;
  release: {
    id: string;
    name: string;
    releaseDate: string;
    description: string | null;
  } | null;
  fileChanges?: Array<{
    id: string;
    filePath: string;
    changeType: string;
    diff: string | null;
    additions: number | null;
    deletions: number | null;
    createdAt: string;
  }>;
}

export interface ReleaseDetailDto {
  id: string;
  name: string;
  releaseDate: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  mergeRequestCount: number;
  mergeRequests: MergeRequestDto[];
}

export interface CreateReleaseInput {
  name: string;
  releaseDate: string;
  description?: string;
}

export interface CreateReleaseResponse extends ReleaseDetailDto {
  assignedCount: number;
}

export interface ReleaseSummaryDto {
  id: string;
  name: string;
  releaseDate: string;
  description: string | null;
  mergeRequestCount: number;
  pillars: string[];
  specFiles: string[];
  modules: string[];
  highRiskCount: number;
  breakingCount: number;
}

export interface ChangedSetDto {
  common: string[];
  onlyInReleaseA: string[];
  onlyInReleaseB: string[];
  all: string[];
}

export interface RiskChangeDto {
  releaseId: string;
  releaseName: string;
  mergeRequestId: string;
  externalId: string;
  title: string;
  pillar: string;
  specFile: string;
  riskLevel: string;
}

export interface BreakingChangeDto {
  releaseId: string;
  releaseName: string;
  mergeRequestId: string;
  externalId: string;
  title: string;
  pillar: string;
  specFile: string;
}

export interface ReleaseComparisonDto {
  releaseA: ReleaseSummaryDto;
  releaseB: ReleaseSummaryDto;
  totalMergeRequestsA: number;
  totalMergeRequestsB: number;
  pillarsChanged: ChangedSetDto;
  specFilesChanged: ChangedSetDto;
  newModules: string[];
  modifiedModules: string[];
  removedModules: string[];
  overlap: {
    pillars: string[];
    specFiles: string[];
    modules: string[];
  };
  highRiskChanges: RiskChangeDto[];
  breakingChanges: BreakingChangeDto[];
  riskSummary: string;
  summaryText: string;
}

export interface ChatReleaseRefDto {
  id: string;
  name: string;
  releaseDate: string;
  mergeRequestCount: number;
}

export interface ChatMergeRequestRefDto {
  id: string;
  externalId: string;
  title: string;
  pillar: string | null;
  specFile: string | null;
  riskLevel: string | null;
  releaseId: string | null;
  releaseName: string | null;
}

export interface ChatResponseDto {
  answer: string;
  referencedReleases: ChatReleaseRefDto[];
  referencedMergeRequests: ChatMergeRequestRefDto[];
}
