import type { MergeRequestDto } from '../api/types';

interface ReleaseTableProps {
  mergeRequests: MergeRequestDto[];
}

function formatDate(value: string | null): string {
  if (!value) {
    return '—';
  }
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

function riskClass(riskLevel: string | undefined): string {
  if (riskLevel === 'HIGH') {
    return 'risk-pill high';
  }
  if (riskLevel === 'MEDIUM') {
    return 'risk-pill medium';
  }
  return 'risk-pill low';
}

export function ReleaseTable({ mergeRequests }: ReleaseTableProps) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Pillar</th>
            <th>Spec file</th>
            <th>Risk</th>
            <th>Branch</th>
            <th>Merged</th>
          </tr>
        </thead>
        <tbody>
          {mergeRequests.map((mr) => (
            <tr key={mr.id}>
              <td>
                <div className="table-title">{mr.title}</div>
                <div className="muted">{mr.repository.name}</div>
              </td>
              <td>{mr.analysis?.pillar ?? '—'}</td>
              <td>{mr.analysis?.specFile ?? '—'}</td>
              <td>
                <span className={riskClass(mr.analysis?.riskLevel)}>
                  {mr.analysis?.riskLevel ?? '—'}
                </span>
              </td>
              <td>{mr.sourceBranch}</td>
              <td>{formatDate(mr.mergedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
