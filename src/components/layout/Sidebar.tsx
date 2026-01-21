import { useSpaces } from '@/hooks/useSpaces';
import { SpaceList, SpaceListSkeleton } from '@/components/spaces';
import { cn } from '@/lib/utils';
import type { Id } from '@/lib/convex';

interface SidebarProps {
  selectedSpaceId: Id<'spaces'> | null;
  onSelectSpace: (id: Id<'spaces'>) => void;
  className?: string;
}

export function Sidebar({ selectedSpaceId, onSelectSpace, className }: SidebarProps) {
  const {
    spaces,
    isLoading,
    createSpace,
    updateSpace,
    deleteSpace,
    reorderSpaces,
  } = useSpaces();

  return (
    <aside className={cn("w-64 border-r border-border p-4 flex flex-col shrink-0", className)}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium text-muted-foreground">Spaces</h2>
      </div>

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <SpaceListSkeleton count={3} />
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
