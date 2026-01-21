import { useState, useMemo } from 'react';
import { useConvexAuth } from 'convex/react';
import { Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { TodoList } from '@/components/todos';
import { useSpaces } from '@/hooks/useSpaces';
import type { Id } from '@/lib/convex';

export function AppPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [selectedSpaceId, setSelectedSpaceId] = useState<Id<'spaces'> | null>(
    null
  );
  const { spaces } = useSpaces();

  // Find the selected space object
  const selectedSpace = useMemo(() => {
    if (!selectedSpaceId || !spaces) return null;
    return spaces.find((s) => s._id === selectedSpaceId) ?? null;
  }, [selectedSpaceId, spaces]);

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
      {selectedSpace ? (
        <TodoList spaceId={selectedSpaceId!} space={selectedSpace} />
      ) : (
        <div className="h-full flex flex-col items-center justify-center px-4">
          <div className="text-5xl mb-4">👈</div>
          <p className="text-lg font-medium text-foreground mb-2">
            Select a space
          </p>
          <p className="text-sm text-muted-foreground text-center max-w-xs">
            Choose a space from the sidebar to view and manage your todos
          </p>
        </div>
      )}
    </AppLayout>
  );
}
