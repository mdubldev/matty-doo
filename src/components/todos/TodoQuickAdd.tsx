import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Id, Folder, FolderFilter } from '@/lib/convex';

interface TodoQuickAddProps {
  spaceId: Id<'spaces'>;
  onCreateTodo: (args: { spaceId: Id<'spaces'>; folderId?: Id<'folders'>; title: string }) => Promise<Id<'todos'>>;
  selectedFolderId: FolderFilter;
  folders?: Folder[];
}

export function TodoQuickAdd({ spaceId, onCreateTodo, selectedFolderId, folders }: TodoQuickAddProps) {
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<Id<'folders'> | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show folder selector only when in "All" view and folders exist
  const showFolderSelector = selectedFolderId === 'all' && folders && folders.length > 0;

  // Find the target folder object for display
  const targetFolder = useMemo(() => {
    if (!targetFolderId || !folders) return undefined;
    return folders.find((f) => f._id === targetFolderId);
  }, [targetFolderId, folders]);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle || isSubmitting) return;

    // Determine the folder for the new todo
    // - In "All" view: use targetFolderId (from dropdown), or undefined for root
    // - In specific folder view: use that folder's ID
    // - In "root" view: undefined (root level)
    const folderId =
      selectedFolderId === 'all'
        ? targetFolderId
        : selectedFolderId === 'root'
          ? undefined
          : selectedFolderId;

    setIsSubmitting(true);
    try {
      await onCreateTodo({ spaceId, folderId, title: trimmedTitle });
      setTitle('');
      // Keep focus in input for batch entry
      inputRef.current?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-b border-border">
      {/* Folder selector - only in "All" view when folders exist */}
      {showFolderSelector && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground shrink-0"
              type="button"
            >
              {targetFolder ? (
                <>
                  <span
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: targetFolder.color }}
                  />
                  <span className="max-w-[80px] truncate">{targetFolder.name}</span>
                </>
              ) : (
                'No folder'
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={() => setTargetFolderId(undefined)}>
              No folder
            </DropdownMenuItem>
            {folders?.map((f) => (
              <DropdownMenuItem key={f._id} onClick={() => setTargetFolderId(f._id)}>
                <span
                  className="w-2 h-2 rounded-full mr-2 shrink-0"
                  style={{ backgroundColor: f.color }}
                />
                <span className="truncate">{f.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Plus className="h-5 w-5 text-muted-foreground shrink-0" />
      <Input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a todo..."
        disabled={isSubmitting}
        className="border-0 shadow-none focus-visible:ring-0 px-0 text-sm placeholder:text-muted-foreground"
      />
    </form>
  );
}
