import type { ReleaseDto } from '../api/types';

interface ReleaseListProps {
  releases: ReleaseDto[];
  selectedId: string | null;
  onSelect: (id: string) => void;
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

export function ReleaseList({ releases, selectedId, onSelect }: ReleaseListProps) {
  return (
    <aside className="release-list card">
      <div className="section-heading compact">
        <h2>All releases</h2>
        <p>{releases.length} total</p>
      </div>
      <ul className="release-list-items">
        {releases.map((release) => (
          <li key={release.id}>
            <button
              type="button"
              className={`release-list-item${selectedId === release.id ? ' active' : ''}`}
              onClick={() => onSelect(release.id)}
            >
              <strong>{release.name}</strong>
              <span>{formatDate(release.releaseDate)}</span>
              <span>{release.mergeRequestCount} MRs</span>
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
