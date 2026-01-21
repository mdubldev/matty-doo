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
      <Header
        selectedSpaceId={selectedSpaceId}
        onSelectSpace={onSelectSpace}
      />
      <div className="flex-1 flex overflow-hidden">
        {/* Hide sidebar on mobile, show on md and up */}
        <Sidebar
          selectedSpaceId={selectedSpaceId}
          onSelectSpace={onSelectSpace}
          className="hidden md:flex"
        />
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
