import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SpaceEditInline } from './SpaceEditInline';
import { ColorPicker } from './ColorPicker';
import { EmojiPicker } from './EmojiPicker';
import { DeleteSpaceDialog } from './DeleteSpaceDialog';
import type { Space } from '@/lib/convex';

interface SpaceItemProps {
  space: Space;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: {
    name?: string;
    color?: string;
    icon?: string;
  }) => Promise<void | null>;
  onDelete: () => Promise<void | null>;
}

export function SpaceItem({
  space,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: SpaceItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: space._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSaveName = async (newName: string) => {
    if (newName && newName !== space.name) {
      await onUpdate({ name: newName });
    }
    setIsEditing(false);
  };

  const handleColorSelect = async (color: string) => {
    await onUpdate({ color });
    setColorPickerOpen(false);
  };

  const handleEmojiSelect = async (emoji: string) => {
    await onUpdate({ icon: emoji });
    setEmojiPickerOpen(false);
  };

  const handleDeleteConfirm = async () => {
    await onDelete();
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          'group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors',
          isSelected ? 'bg-accent' : 'hover:bg-accent/50',
          isDragging && 'opacity-50 shadow-lg'
        )}
        onClick={onSelect}
      >
        {/* Drag handle */}
        <button
          className="p-0.5 -ml-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted cursor-grab active:cursor-grabbing transition-opacity"
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground" />
        </button>

        {/* Color dot */}
        <ColorPicker
          currentColor={space.color}
          onSelect={handleColorSelect}
          open={colorPickerOpen}
          onOpenChange={setColorPickerOpen}
        >
          <button
            className="w-3 h-3 rounded-full shrink-0 hover:ring-2 hover:ring-offset-1 hover:ring-primary/50 transition-all"
            style={{ backgroundColor: space.color }}
            onClick={(e) => {
              e.stopPropagation();
              setColorPickerOpen(true);
            }}
          />
        </ColorPicker>

        {/* Emoji */}
        <EmojiPicker
          currentEmoji={space.icon}
          onSelect={handleEmojiSelect}
          open={emojiPickerOpen}
          onOpenChange={setEmojiPickerOpen}
        >
          <button
            className="text-base shrink-0 hover:scale-110 transition-transform"
            onClick={(e) => {
              e.stopPropagation();
              setEmojiPickerOpen(true);
            }}
          >
            {space.icon}
          </button>
        </EmojiPicker>

        {/* Name */}
        {isEditing ? (
          <SpaceEditInline
            initialValue={space.name}
            onSave={handleSaveName}
            onCancel={() => setIsEditing(false)}
          />
        ) : (
          <span
            className="flex-1 truncate text-sm"
            onDoubleClick={handleDoubleClick}
          >
            {space.name}
          </span>
        )}

        {/* More menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <DeleteSpaceDialog
        spaceName={space.name}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
