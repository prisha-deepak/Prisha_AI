import { CompareReleases } from '../components/CompareReleases';
import { ChatPanel } from '../components/ChatPanel';

export function ImpactAnalyzerPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Impact Analyzer</h1>
        <p>Compare releases, review risk impact, and ask the release assistant in one place.</p>
      </header>

      <section className="page-section">
        <div className="section-heading">
          <h2>Release comparison</h2>
          <p>Select two releases to compare pillars, modules, and risk.</p>
        </div>
        <CompareReleases />
      </section>

      <section className="page-section">
        <div className="section-heading">
          <h2>Release assistant</h2>
          <p>Ask questions about SCM, HCM, risk, spec files, and release changes.</p>
        </div>
        <ChatPanel />
      </section>
    </div>
  );
}
