import { useState, useRef, useEffect, useCallback } from 'react';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFolders } from '@/hooks/useFolders';
import { DroppableFolderTab } from './DroppableFolderTab';
import { DroppableAllTab } from './DroppableAllTab';
import { FolderCreateInline } from './FolderCreateInline';
import { DeleteFolderDialog } from './DeleteFolderDialog';
import type { Id, Folder, FolderFilter } from '@/lib/convex';

interface FolderTabsProps {
  spaceId: Id<'spaces'>;
  selectedFolderId: FolderFilter;
  onSelectFolder: (folderId: FolderFilter) => void;
}

export function FolderTabs({
  spaceId,
  selectedFolderId,
  onSelectFolder,
}: FolderTabsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState<Folder | null>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);
  const { folders, isLoading, createFolder, updateFolder, deleteFolder } =
    useFolders(spaceId);

  // Total number of tabs (All + folders)
  const totalTabs = 1 + (folders?.length ?? 0);

  // Get the index of the currently selected tab
  const getSelectedIndex = useCallback(() => {
    if (selectedFolderId === 'all') return 0;
    const folderIndex = folders?.findIndex((f) => f._id === selectedFolderId) ?? -1;
    return folderIndex >= 0 ? folderIndex + 1 : 0;
  }, [selectedFolderId, folders]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = getSelectedIndex();

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          nextIndex = Math.min(currentIndex + 1, totalTabs - 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          nextIndex = Math.max(currentIndex - 1, 0);
          break;
        case 'Home':
          e.preventDefault();
          nextIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          nextIndex = totalTabs - 1;
          break;
        default:
          return;
      }

      // Focus and select the new tab
      tabRefs.current[nextIndex]?.focus();
      if (nextIndex === 0) {
        onSelectFolder('all');
      } else if (folders && folders[nextIndex - 1]) {
        onSelectFolder(folders[nextIndex - 1]._id);
      }
    },
    [getSelectedIndex, totalTabs, folders, onSelectFolder]
  );

  // Ref callback to store tab refs
  const setTabRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      tabRefs.current[index] = el;
    },
    []
  );

  // Track scroll position to show/hide fade indicators
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkScroll = () => {
      setShowLeftFade(el.scrollLeft > 0);
      setShowRightFade(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
    };

    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [folders]);

  const handleFolderCreated = (folderId: Id<'folders'>) => {
    setIsCreating(false);
    onSelectFolder(folderId);
  };

  const handleDeleteClick = (folder: Folder) => {
    setFolderToDelete(folder);
  };

  const handleDeleteConfirm = async (moveTodosToRoot: boolean) => {
    if (!folderToDelete) return;

    await deleteFolder({ id: folderToDelete._id, moveTodosToRoot });

    // If the deleted folder was selected, switch to "all"
    if (selectedFolderId === folderToDelete._id) {
      onSelectFolder('all');
    }

    setFolderToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 pb-2 border-b">
        <Skeleton className="h-8 w-12 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    );
  }

  return (
    <div className="relative border-b">
      {/* Left fade indicator */}
      {showLeftFade && (
        <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none z-10" />
      )}

      {/* Scrollable tabs container */}
      <div
        ref={scrollRef}
        role="tablist"
        aria-label="Folder tabs"
        onKeyDown={handleKeyDown}
        className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-hide"
      >
        {/* "All" tab - always first (droppable to move to root) */}
        <DroppableAllTab
          ref={setTabRef(0)}
          isSelected={selectedFolderId === 'all'}
          onSelect={() => onSelectFolder('all')}
          tabIndex={selectedFolderId === 'all' ? 0 : -1}
        />

        {/* Folder tabs (sortable + droppable) */}
        <SortableContext
          items={folders?.map((f) => `folder-${f._id}`) ?? []}
          strategy={horizontalListSortingStrategy}
        >
          {folders?.map((folder, index) => (
            <DroppableFolderTab
              key={folder._id}
              ref={setTabRef(index + 1)}
              folder={folder}
              isSelected={selectedFolderId === folder._id}
              onSelect={() => onSelectFolder(folder._id)}
              onUpdate={(updates) => updateFolder({ id: folder._id, ...updates })}
              onDelete={() => handleDeleteClick(folder)}
              tabIndex={selectedFolderId === folder._id ? 0 : -1}
            />
          ))}
        </SortableContext>

        {/* Create inline or add button */}
        {isCreating ? (
          <FolderCreateInline
            spaceId={spaceId}
            onCancel={() => setIsCreating(false)}
            onCreated={handleFolderCreated}
            onCreateFolder={createFolder}
          />
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-muted-foreground hover:text-foreground shrink-0"
            onClick={() => setIsCreating(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Folder
          </Button>
        )}
      </div>

      {/* Right fade indicator */}
      {showRightFade && (
        <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none z-10" />
      )}

      {/* Delete confirmation dialog */}
      <DeleteFolderDialog
        folderName={folderToDelete?.name ?? ''}
        open={!!folderToDelete}
        onOpenChange={(open) => !open && setFolderToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
