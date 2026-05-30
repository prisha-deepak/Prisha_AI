import type { ReactNode } from 'react';

interface PageShellProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <section className="page-card">
      <h1>{title}</h1>
      <p>{description}</p>
      {children}
    </section>
  );
}
