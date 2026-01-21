import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';
import { FolderTab } from './FolderTab';
import type { Folder } from '@/lib/convex';

interface DroppableFolderTabProps {
  folder: Folder;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: { name?: string; color?: string }) => Promise<void | null>;
  onDelete: () => void;
}

export function DroppableFolderTab({
  folder,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: DroppableFolderTabProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder._id}`,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-md transition-colors',
        isOver && 'bg-accent/70 ring-2 ring-primary/30'
      )}
    >
      <FolderTab
        folder={folder}
        isSelected={isSelected}
        onSelect={onSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />
    </div>
  );
}
