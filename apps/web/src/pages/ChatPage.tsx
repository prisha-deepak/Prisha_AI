import { ChatPanel } from '../components/ChatPanel';
import { PageShell } from '../components/PageShell';

export function ChatPage() {
  return (
    <PageShell
      title="Chat"
      description="Ask the release assistant about SCM, HCM, risk, spec files, and release comparisons."
    >
      <ChatPanel />
    </PageShell>
  );
}
