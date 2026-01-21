import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SpaceItem } from './SpaceItem';
import { SpaceCreateInline } from './SpaceCreateInline';
import type { Space, Id } from '@/lib/convex';

interface SpaceListProps {
  spaces: Space[];
  selectedSpaceId: Id<'spaces'> | null;
  onSelectSpace: (id: Id<'spaces'>) => void;
  onCreateSpace: (args: {
    name: string;
    color: string;
    icon: string;
  }) => Promise<Id<'spaces'>>;
  onUpdateSpace: (args: {
    id: Id<'spaces'>;
    name?: string;
    color?: string;
    icon?: string;
  }) => Promise<void | null>;
  onDeleteSpace: (args: { id: Id<'spaces'> }) => Promise<void | null>;
  onReorderSpaces: (args: { spaceIds: Id<'spaces'>[] }) => Promise<void | null>;
}

export function SpaceList({
  spaces,
  selectedSpaceId,
  onSelectSpace,
  onCreateSpace,
  onUpdateSpace,
  onDeleteSpace,
  onReorderSpaces,
}: SpaceListProps) {
  const [isCreating, setIsCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Prevent accidental drags when clicking
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = spaces.findIndex((s) => s._id === active.id);
      const newIndex = spaces.findIndex((s) => s._id === over.id);
      const newOrder = arrayMove(spaces, oldIndex, newIndex);
      onReorderSpaces({ spaceIds: newOrder.map((s) => s._id) });
    }
  };

  const handleCreated = (newSpaceId: Id<'spaces'>) => {
    setIsCreating(false);
    onSelectSpace(newSpaceId);
  };

  const handleCancel = () => {
    setIsCreating(false);
  };

  const handleDelete = async (spaceId: Id<'spaces'>) => {
    await onDeleteSpace({ id: spaceId });
    // If deleted space was selected, select first remaining space
    if (selectedSpaceId === spaceId) {
      const remaining = spaces.filter((s) => s._id !== spaceId);
      if (remaining.length > 0) {
        onSelectSpace(remaining[0]._id);
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto space-y-1">
        {spaces.length === 0 && !isCreating && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No spaces yet
          </p>
        )}

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={spaces.map((s) => s._id)}
            strategy={verticalListSortingStrategy}
          >
            {spaces.map((space) => (
              <SpaceItem
                key={space._id}
                space={space}
                isSelected={space._id === selectedSpaceId}
                onSelect={() => onSelectSpace(space._id)}
                onUpdate={(updates) =>
                  onUpdateSpace({ id: space._id, ...updates })
                }
                onDelete={() => handleDelete(space._id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {isCreating && (
          <SpaceCreateInline
            onCreated={handleCreated}
            onCancel={handleCancel}
            onCreateSpace={onCreateSpace}
          />
        )}
      </div>

      <Button
        variant="outline"
        className="w-full gap-2 mt-2"
        onClick={() => setIsCreating(true)}
        disabled={isCreating}
      >
        <Plus className="h-4 w-4" />
        Add Space
      </Button>
    </div>
  );
}
