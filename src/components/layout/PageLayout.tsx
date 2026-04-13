import type { ReactNode } from 'react';

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <main className="min-h-screen min-h-dvh overflow-x-hidden bg-stone-50">
      {children}
    </main>
  );
}
