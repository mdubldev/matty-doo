import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableAllTabProps {
  isSelected: boolean;
  onSelect: () => void;
}

export function DroppableAllTab({ isSelected, onSelect }: DroppableAllTabProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'folder-root',
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors shrink-0 text-sm',
        isSelected ? 'bg-accent' : 'hover:bg-accent/50',
        isOver && 'bg-accent/70 ring-2 ring-primary/30'
      )}
      onClick={onSelect}
    >
      All
    </div>
  );
}
