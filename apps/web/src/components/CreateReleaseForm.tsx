import { useState, type FormEvent } from 'react';
import type { CreateReleaseResponse } from '../api/types';

interface CreateReleaseFormProps {
  onCreated: (input: {
    name: string;
    releaseDate: string;
    description?: string;
  }) => Promise<CreateReleaseResponse>;
}

export function CreateReleaseForm({ onCreated }: CreateReleaseFormProps) {
  const [name, setName] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      const created = await onCreated({
        name: name.trim(),
        releaseDate,
        description: description.trim() || undefined,
      });
      setMessage(
        `Created ${created.name} and assigned ${created.assignedCount} merge request(s).`,
      );
      setName('');
      setReleaseDate('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create release');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card admin-card">
      <div className="section-heading">
        <h2>Create release</h2>
        <p>Admin only. New releases automatically assign all unassigned processed merge requests.</p>
      </div>

      <form className="create-release-form" onSubmit={(event) => void handleSubmit(event)}>
        <div className="form-row">
          <label>
            Release name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Release_2026_01"
              required
            />
          </label>
          <label>
            Release date
            <input
              type="date"
              value={releaseDate}
              onChange={(e) => setReleaseDate(e.target.value)}
              required
            />
          </label>
        </div>
        <label>
          Description
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional release description"
          />
        </label>

        <div className="form-actions">
          <button type="submit" className="btn primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create release'}
          </button>
        </div>
      </form>

      {message && <div className="alert success">{message}</div>}
      {error && <div className="alert error">{error}</div>}
    </section>
  );
}
