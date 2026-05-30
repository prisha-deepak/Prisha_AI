import { useEffect, useState } from 'react';
import type { HealthResponse } from '@ai-mr/shared';
import { apiClient } from '../api/client';
import { PageShell } from '../components/PageShell';

export function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .getHealth()
      .then(setHealth)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Unable to reach API');
      });
  }, []);

  return (
    <PageShell
      title="Dashboard"
      description="Overview of merge request and release intelligence. Business workflows will be added in later iterations."
    >
      {health && (
        <p>
          <span className="status-pill">API {health.status}</span>{' '}
          <small>{health.service}</small>
        </p>
      )}
      {error && <p className="status-pill error">{error}</p>}
    </PageShell>
  );
}
