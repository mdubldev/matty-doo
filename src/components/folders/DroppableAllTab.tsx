import { forwardRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface DroppableAllTabProps {
  isSelected: boolean;
  onSelect: () => void;
  tabIndex?: number;
}

export const DroppableAllTab = forwardRef<HTMLButtonElement, DroppableAllTabProps>(
  function DroppableAllTab({ isSelected, onSelect, tabIndex = 0 }, ref) {
    const { setNodeRef, isOver } = useDroppable({
      id: 'folder-root',
    });

    return (
      <button
        ref={(node) => {
          // Combine the droppable ref with the forwarded ref
          setNodeRef(node);
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        type="button"
        role="tab"
        aria-selected={isSelected}
        tabIndex={tabIndex}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors shrink-0 text-sm',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          isSelected ? 'bg-accent' : 'hover:bg-accent/50',
          isOver && 'bg-accent/70 ring-2 ring-primary/30'
        )}
        onClick={onSelect}
      >
        All
      </button>
    );
  }
);
