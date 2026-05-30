import { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import type { ReleaseComparisonDto, ReleaseDto } from '../api/types';

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

function TagList({ items, emptyLabel }: { items: string[]; emptyLabel?: string }) {
  if (items.length === 0) {
    return <p className="muted">{emptyLabel ?? 'None'}</p>;
  }

  return (
    <ul className="tag-list">
      {items.map((item) => (
        <li key={item} className="tag">
          {item}
        </li>
      ))}
    </ul>
  );
}

function ChangedSection({
  title,
  data,
}: {
  title: string;
  data: { common: string[]; onlyInReleaseA: string[]; onlyInReleaseB: string[]; all: string[] };
}) {
  return (
    <section className="result-section card">
      <h3>{title}</h3>
      <div className="grid-3">
        <div>
          <h4>Common</h4>
          <TagList items={data.common} emptyLabel="No overlap" />
        </div>
        <div>
          <h4>Only in Release A</h4>
          <TagList items={data.onlyInReleaseA} emptyLabel="None" />
        </div>
        <div>
          <h4>Only in Release B</h4>
          <TagList items={data.onlyInReleaseB} emptyLabel="None" />
        </div>
      </div>
    </section>
  );
}

export function CompareReleases() {
  const [releases, setReleases] = useState<ReleaseDto[]>([]);
  const [releaseAId, setReleaseAId] = useState('');
  const [releaseBId, setReleaseBId] = useState('');
  const [comparison, setComparison] = useState<ReleaseComparisonDto | null>(null);
  const [loadingReleases, setLoadingReleases] = useState(true);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadReleases() {
      setLoadingReleases(true);
      setError(null);
      try {
        const data = await apiClient.getReleases();
        if (!cancelled) {
          setReleases(data);
          if (data.length >= 2) {
            setReleaseAId(data[1].id);
            setReleaseBId(data[0].id);
          } else if (data.length === 1) {
            setReleaseAId(data[0].id);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load releases');
        }
      } finally {
        if (!cancelled) {
          setLoadingReleases(false);
        }
      }
    }

    void loadReleases();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleCompare() {
    if (!releaseAId || !releaseBId) {
      setError('Select both Release A and Release B.');
      return;
    }
    if (releaseAId === releaseBId) {
      setError('Choose two different releases to compare.');
      return;
    }

    setComparing(true);
    setError(null);
    try {
      const result = await apiClient.compareReleases(releaseAId, releaseBId);
      setComparison(result);
    } catch (err) {
      setComparison(null);
      setError(err instanceof Error ? err.message : 'Comparison failed');
    } finally {
      setComparing(false);
    }
  }

  if (loadingReleases) {
    return <p className="muted">Loading releases…</p>;
  }

  if (releases.length === 0) {
    return (
      <div className="empty-state">
        <h3>No releases yet</h3>
        <p>Create a release from the Releases page or import demo merge requests first.</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="compare-controls card">
        <div className="form-row">
          <label>
            Release A
            <select value={releaseAId} onChange={(e) => setReleaseAId(e.target.value)}>
              <option value="">Select release…</option>
              {releases.map((release) => (
                <option key={release.id} value={release.id}>
                  {release.name} ({release.mergeRequestCount} MRs)
                </option>
              ))}
            </select>
          </label>
          <label>
            Release B
            <select value={releaseBId} onChange={(e) => setReleaseBId(e.target.value)}>
              <option value="">Select release…</option>
              {releases.map((release) => (
                <option key={release.id} value={release.id}>
                  {release.name} ({release.mergeRequestCount} MRs)
                </option>
              ))}
            </select>
          </label>
        </div>
        <button
          type="button"
          className="btn primary"
          onClick={() => void handleCompare()}
          disabled={comparing}
        >
          {comparing ? 'Comparing…' : 'Compare'}
        </button>
      </div>

      {error && <div className="alert error">{error}</div>}

      {comparison && (
        <div className="stack">
          <section className="card highlight">
            <h3>Summary</h3>
            <p>{comparison.summaryText}</p>
            <p className="muted">{comparison.riskSummary}</p>
          </section>

          <div className="grid-2">
            <section className="card">
              <h3>{comparison.releaseA.name}</h3>
              <p className="muted">{formatDate(comparison.releaseA.releaseDate)}</p>
              <ul className="stat-list">
                <li>
                  <strong>{comparison.totalMergeRequestsA}</strong> merge requests
                </li>
                <li>
                  <strong>{comparison.releaseA.highRiskCount}</strong> high-risk
                </li>
                <li>
                  <strong>{comparison.releaseA.breakingCount}</strong> breaking
                </li>
              </ul>
              <TagList items={comparison.releaseA.pillars} emptyLabel="No pillars" />
            </section>
            <section className="card">
              <h3>{comparison.releaseB.name}</h3>
              <p className="muted">{formatDate(comparison.releaseB.releaseDate)}</p>
              <ul className="stat-list">
                <li>
                  <strong>{comparison.totalMergeRequestsB}</strong> merge requests
                </li>
                <li>
                  <strong>{comparison.releaseB.highRiskCount}</strong> high-risk
                </li>
                <li>
                  <strong>{comparison.releaseB.breakingCount}</strong> breaking
                </li>
              </ul>
              <TagList items={comparison.releaseB.pillars} emptyLabel="No pillars" />
            </section>
          </div>

          <ChangedSection title="Pillars changed" data={comparison.pillarsChanged} />
          <ChangedSection title="Spec files changed" data={comparison.specFilesChanged} />

          <section className="result-section card">
            <h3>Module impact</h3>
            <div className="grid-3">
              <div>
                <h4>New in Release B</h4>
                <TagList items={comparison.newModules} emptyLabel="None" />
              </div>
              <div>
                <h4>Modified in both</h4>
                <TagList items={comparison.modifiedModules} emptyLabel="None" />
              </div>
              <div>
                <h4>Removed from A</h4>
                <TagList items={comparison.removedModules} emptyLabel="None" />
              </div>
            </div>
          </section>

          <section className="result-section card">
            <h3>High-risk changes</h3>
            {comparison.highRiskChanges.length === 0 ? (
              <p className="muted">No high-risk merge requests in this comparison.</p>
            ) : (
              <ul className="item-list">
                {comparison.highRiskChanges.map((item) => (
                  <li key={`${item.releaseId}-${item.mergeRequestId}`}>
                    <strong>{item.title}</strong>
                    <span className="muted">
                      {item.releaseName} · {item.pillar} · {item.riskLevel}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="result-section card">
            <h3>Breaking changes</h3>
            {comparison.breakingChanges.length === 0 ? (
              <p className="muted">No breaking changes detected.</p>
            ) : (
              <ul className="item-list">
                {comparison.breakingChanges.map((item) => (
                  <li key={`${item.releaseId}-${item.mergeRequestId}`}>
                    <strong>{item.title}</strong>
                    <span className="muted">
                      {item.releaseName} · {item.specFile}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
