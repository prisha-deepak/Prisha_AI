export type MergeRequestStatus = 'open' | 'merged' | 'closed';

export interface MergeRequestSummary {
  id: string;
  title: string;
  sourceBranch: string;
  targetBranch: string;
  status: MergeRequestStatus;
}

export interface ReleaseSummary {
  id: string;
  name: string;
  version: string;
  targetDate?: string;
}

export interface HealthResponse {
  status: 'ok';
  service: string;
  timestamp: string;
}
