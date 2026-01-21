import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import type { Id } from '@/lib/convex';

interface AppLayoutProps {
  children: ReactNode;
  selectedSpaceId: Id<'spaces'> | null;
  onSelectSpace: (id: Id<'spaces'>) => void;
}

export function AppLayout({
  children,
  selectedSpaceId,
  onSelectSpace,
}: AppLayoutProps) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          selectedSpaceId={selectedSpaceId}
          onSelectSpace={onSelectSpace}
        />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
