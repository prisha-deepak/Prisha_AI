import { useCallback, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { apiClient } from '../api/client';
import type { CreateReleaseResponse, ReleaseDetailDto, ReleaseDto } from '../api/types';
import { CreateReleaseForm } from '../components/CreateReleaseForm';
import { ReleaseList } from '../components/ReleaseList';
import { ReleaseTable } from '../components/ReleaseTable';

interface LayoutContext {
  isAdmin: boolean;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ReleasesPage() {
  const { isAdmin } = useOutletContext<LayoutContext>();
  const [releases, setReleases] = useState<ReleaseDto[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<ReleaseDetailDto | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReleases = useCallback(async (preferredId?: string | null) => {
    setLoadingList(true);
    setError(null);
    try {
      const data = await apiClient.getReleases();
      setReleases(data);

      const nextId =
        preferredId && data.some((release) => release.id === preferredId)
          ? preferredId
          : (data[0]?.id ?? null);
      setSelectedId(nextId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load releases');
      setReleases([]);
      setSelectedId(null);
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    void loadReleases();
  }, [loadReleases]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedRelease(null);
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      setLoadingDetail(true);
      setError(null);
      try {
        const detail = await apiClient.getReleaseById(selectedId!);
        if (!cancelled) {
          setSelectedRelease(detail);
        }
      } catch (err) {
        if (!cancelled) {
          setSelectedRelease(null);
          setError(err instanceof Error ? err.message : 'Failed to load release details');
        }
      } finally {
        if (!cancelled) {
          setLoadingDetail(false);
        }
      }
    }

    void loadDetail();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  async function handleCreateRelease(input: {
    name: string;
    releaseDate: string;
    description?: string;
  }): Promise<CreateReleaseResponse> {
    const created = await apiClient.createRelease(input);
    await loadReleases(created.id);
    return created;
  }

  async function handleDownload() {
    if (!selectedId || !selectedRelease) {
      return;
    }

    setDownloading(true);
    setError(null);
    try {
      const { blob, filename } = await apiClient.downloadReleaseExport(selectedId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download Excel export');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Releases</h1>
        <p>Review release contents, export release notes, and manage release packaging.</p>
      </header>

      {error && <div className="alert error">{error}</div>}

      {isAdmin && (
        <section className="page-section">
          <CreateReleaseForm onCreated={handleCreateRelease} />
        </section>
      )}

      {loadingList ? (
        <p className="muted">Loading releases…</p>
      ) : releases.length === 0 ? (
        <div className="empty-state">
          <h3>No releases yet</h3>
          <p>
            {isAdmin
              ? 'Create a release to assign processed merge requests and generate release notes.'
              : 'No releases are available yet. Ask an admin to create one after merge requests are processed.'}
          </p>
        </div>
      ) : (
        <div className="releases-layout">
          <ReleaseList
            releases={releases}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />

          <section className="release-detail card">
            {loadingDetail || !selectedRelease ? (
              <p className="muted">Loading release details…</p>
            ) : (
              <>
                <div className="release-detail-header">
                  <div>
                    <h2>{selectedRelease.name}</h2>
                    <p className="muted">
                      {formatDate(selectedRelease.releaseDate)}
                      {selectedRelease.description ? ` · ${selectedRelease.description}` : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => void handleDownload()}
                    disabled={downloading}
                  >
                    {downloading ? 'Preparing…' : 'Download Excel'}
                  </button>
                </div>

                <div className="release-meta">
                  <span>
                    <strong>{selectedRelease.mergeRequestCount}</strong> merge requests
                  </span>
                  <span>Updated {formatDate(selectedRelease.updatedAt)}</span>
                </div>

                {selectedRelease.mergeRequests.length === 0 ? (
                  <div className="empty-state compact">
                    <h3>This release is empty</h3>
                    <p>No merge requests are assigned yet. Process MRs and create or update releases to populate it.</p>
                  </div>
                ) : (
                  <ReleaseTable mergeRequests={selectedRelease.mergeRequests} />
                )}
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
