import { useState, useRef, useEffect } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColorPicker } from '@/components/spaces/ColorPicker';
import type { Folder } from '@/lib/convex';

interface FolderTabProps {
  folder: Folder;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: { name?: string; color?: string }) => Promise<void | null>;
  onDelete: () => void;
}

export function FolderTab({
  folder,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: FolderTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(folder.name);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(folder.name);
    setIsEditing(true);
  };

  const handleSaveName = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== folder.name) {
      await onUpdate({ name: trimmed });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditValue(folder.name);
    }
  };

  const handleColorSelect = async (color: string) => {
    await onUpdate({ color });
    setColorPickerOpen(false);
  };

  return (
    <div
      className={cn(
        'group flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors shrink-0',
        isSelected ? 'bg-accent' : 'hover:bg-accent/50'
      )}
      onClick={onSelect}
    >
      {/* Color dot with picker */}
      <ColorPicker
        currentColor={folder.color}
        onSelect={handleColorSelect}
        open={colorPickerOpen}
        onOpenChange={setColorPickerOpen}
      >
        <button
          className="w-3 h-3 rounded-full shrink-0 hover:ring-2 hover:ring-offset-1 hover:ring-primary/50 transition-all"
          style={{ backgroundColor: folder.color }}
          onClick={(e) => {
            e.stopPropagation();
            setColorPickerOpen(true);
          }}
        />
      </ColorPicker>

      {/* Name (editable on double-click) */}
      {isEditing ? (
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSaveName}
          onClick={(e) => e.stopPropagation()}
          className="h-6 w-24 text-sm px-1 py-0"
        />
      ) : (
        <span
          className="text-sm truncate max-w-[120px]"
          onDoubleClick={handleDoubleClick}
          title={folder.name}
        >
          {folder.name}
        </span>
      )}

      {/* More menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity -mr-1"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              setEditValue(folder.name);
              setIsEditing(true);
            }}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
