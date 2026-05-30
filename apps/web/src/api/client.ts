import type { HealthResponse } from '@ai-mr/shared';
import type {
  ChatResponseDto,
  CreateReleaseInput,
  CreateReleaseResponse,
  ReleaseComparisonDto,
  ReleaseDetailDto,
  ReleaseDto,
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

async function parseError(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: string };
    if (body.error) {
      return body.error;
    }
  } catch {
    // ignore parse errors
  }
  return `Request failed: ${response.status} ${response.statusText}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, init);
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  return (await response.json()) as T;
}

function parseFilename(contentDisposition: string | null, fallback: string): string {
  if (!contentDisposition) {
    return fallback;
  }
  const match = /filename="([^"]+)"/i.exec(contentDisposition);
  return match?.[1] ?? fallback;
}

export const apiClient = {
  getHealth: () => request<HealthResponse>('/api/health'),

  getReleases: () => request<ReleaseDto[]>('/api/releases'),

  getReleaseById: (id: string) => request<ReleaseDetailDto>(`/api/releases/${id}`),

  createRelease: (input: CreateReleaseInput) =>
    request<CreateReleaseResponse>('/api/releases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    }),

  downloadReleaseExport: async (id: string): Promise<{ blob: Blob; filename: string }> => {
    const response = await fetch(`${API_BASE}/api/releases/${id}/export`);
    if (!response.ok) {
      throw new Error(await parseError(response));
    }
    const blob = await response.blob();
    const filename = parseFilename(
      response.headers.get('Content-Disposition'),
      'release-notes.xlsx',
    );
    return { blob, filename };
  },

  compareReleases: (releaseAId: string, releaseBId: string) =>
    request<ReleaseComparisonDto>('/api/releases/compare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ releaseAId, releaseBId }),
    }),

  askChat: (question: string) =>
    request<ChatResponseDto>('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    }),
};

export type {
  ChatResponseDto,
  CreateReleaseResponse,
  MergeRequestDto,
  ReleaseComparisonDto,
  ReleaseDetailDto,
  ReleaseDto,
} from './types';
