import { forwardRef } from 'react';
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
  tabIndex?: number;
}

export const DroppableFolderTab = forwardRef<HTMLDivElement, DroppableFolderTabProps>(
  function DroppableFolderTab(
    { folder, isSelected, onSelect, onUpdate, onDelete, tabIndex = 0 },
    ref
  ) {
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

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Enter or Space triggers selection
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect();
      }
    };

    // Destructure attributes to exclude role and tabIndex (we provide our own)
    const { role: _role, tabIndex: _tabIndex, ...restAttributes } = attributes;

    return (
      <div
        ref={(node) => {
          // Combine the sortable ref with the forwarded ref
          setNodeRef(node);
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        style={style}
        role="tab"
        aria-selected={isSelected}
        tabIndex={tabIndex}
        onKeyDown={handleKeyDown}
        className={cn(
          'rounded-md transition-colors',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
          isOver && 'bg-accent/70 ring-2 ring-primary/30',
          isDragging && 'opacity-50'
        )}
        {...restAttributes}
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
);
