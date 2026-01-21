import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: `folder-${folder._id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-md transition-colors',
        isOver && 'bg-accent/70 ring-2 ring-primary/30',
        isDragging && 'opacity-50'
      )}
      {...attributes}
      {...listeners}
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
