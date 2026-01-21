import { useSpaces } from '@/hooks/useSpaces';
import { SpaceList } from '@/components/spaces/SpaceList';
import type { Id } from '@/lib/convex';

interface SidebarProps {
  selectedSpaceId: Id<'spaces'> | null;
  onSelectSpace: (id: Id<'spaces'>) => void;
}

export function Sidebar({ selectedSpaceId, onSelectSpace }: SidebarProps) {
  const {
    spaces,
    isLoading,
    createSpace,
    updateSpace,
    deleteSpace,
    reorderSpaces,
  } = useSpaces();

  return (
    <aside className="w-64 border-r border-border p-4 flex flex-col shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground">Spaces</h2>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="text-sm text-muted-foreground">Loading...</div>
          </div>
        ) : (
          <SpaceList
            spaces={spaces ?? []}
            selectedSpaceId={selectedSpaceId}
            onSelectSpace={onSelectSpace}
            onCreateSpace={createSpace}
            onUpdateSpace={updateSpace}
            onDeleteSpace={deleteSpace}
            onReorderSpaces={reorderSpaces}
          />
        )}
      </div>
    </aside>
  );
}
