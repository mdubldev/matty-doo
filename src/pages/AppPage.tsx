import { useState } from 'react';
import { useConvexAuth } from 'convex/react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import type { Id } from '@/lib/convex';

export function AppPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [selectedSpaceId, setSelectedSpaceId] = useState<Id<'spaces'> | null>(
    null
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <AppLayout
      selectedSpaceId={selectedSpaceId}
      onSelectSpace={setSelectedSpaceId}
    >
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          {selectedSpaceId ? (
            <p className="text-muted-foreground">
              Todos will be shown here (Phase 4)
            </p>
          ) : (
            <p className="text-muted-foreground">
              Select or create a space to get started
            </p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
