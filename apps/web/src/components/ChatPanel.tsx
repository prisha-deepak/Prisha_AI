import { useState } from 'react';
import { apiClient } from '../api/client';
import type { ChatResponseDto } from '../api/types';

const SUGGESTED_QUESTIONS = [
  'What changed in SCM?',
  'What changed in HCM?',
  'Show high-risk changes.',
  'Which release contains payment updates?',
  'Compare the latest releases.',
  'Which spec files changed?',
  'Was Requisition Receipt to Payment changed recently?',
];

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

function renderAnswer(answer: string) {
  return answer.split('\n').map((line, index) => {
    if (line.startsWith('### ')) {
      return (
        <h3 key={index} className="answer-heading">
          {line.replace('### ', '')}
        </h3>
      );
    }
    if (line.startsWith('- ')) {
      return (
        <p key={index} className="answer-bullet">
          {line.slice(2)}
        </p>
      );
    }
    if (line.trim() === '') {
      return <br key={index} />;
    }
    return (
      <p key={index} className="answer-line">
        {line}
      </p>
    );
  });
}

export function ChatPanel() {
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState<ChatResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAsk(nextQuestion?: string) {
    const value = (nextQuestion ?? question).trim();
    if (!value) {
      setError('Enter a question to ask the release assistant.');
      return;
    }

    setQuestion(value);
    setLoading(true);
    setError(null);

    try {
      const result = await apiClient.askChat(value);
      setResponse(result);
    } catch (err) {
      setResponse(null);
      setError(err instanceof Error ? err.message : 'Chat request failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stack chat-panel">
      <section className="card">
        <label className="chat-label" htmlFor="chat-question">
          Ask about releases, merge requests, pillars, or risk
        </label>
        <textarea
          id="chat-question"
          className="chat-input"
          rows={4}
          value={question}
          placeholder='Try "What changed in SCM?"'
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              void handleAsk();
            }
          }}
        />
        <div className="chat-actions">
          <button type="button" className="btn primary" onClick={() => void handleAsk()} disabled={loading}>
            {loading ? 'Thinking…' : 'Ask'}
          </button>
          <span className="muted">Ctrl+Enter to send</span>
        </div>
      </section>

      <section className="card">
        <h3>Suggested questions</h3>
        <div className="suggestion-list">
          {SUGGESTED_QUESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              className="suggestion-chip"
              onClick={() => void handleAsk(item)}
              disabled={loading}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {error && <div className="alert error">{error}</div>}

      {response && (
        <div className="stack">
          <section className="card answer-card">
            <h3>Answer</h3>
            <div className="answer-body">{renderAnswer(response.answer)}</div>
          </section>

          <div className="grid-2">
            <section className="card">
              <h3>Referenced releases</h3>
              {response.referencedReleases.length === 0 ? (
                <p className="muted">No releases referenced.</p>
              ) : (
                <ul className="ref-list">
                  {response.referencedReleases.map((release) => (
                    <li key={release.id}>
                      <strong>{release.name}</strong>
                      <span className="muted">
                        {formatDate(release.releaseDate)} · {release.mergeRequestCount} MRs
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="card">
              <h3>Referenced merge requests</h3>
              {response.referencedMergeRequests.length === 0 ? (
                <p className="muted">No merge requests referenced.</p>
              ) : (
                <ul className="ref-list">
                  {response.referencedMergeRequests.map((mr) => (
                    <li key={mr.id}>
                      <strong>{mr.title}</strong>
                      <span className="muted">
                        {mr.pillar ?? 'Unknown'} · {mr.specFile ?? 'Unknown spec'}
                        {mr.riskLevel ? ` · ${mr.riskLevel}` : ''}
                      </span>
                      {mr.releaseName && <span className="muted">Release: {mr.releaseName}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
