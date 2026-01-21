import { useState } from 'react';
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
  const { folders, isLoading, createFolder, updateFolder, deleteFolder } =
    useFolders(spaceId);

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
    <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b">
      {/* "All" tab - always first (droppable to move to root) */}
      <DroppableAllTab
        isSelected={selectedFolderId === 'all'}
        onSelect={() => onSelectFolder('all')}
      />

      {/* Folder tabs (sortable + droppable) */}
      <SortableContext
        items={folders?.map((f) => `folder-${f._id}`) ?? []}
        strategy={horizontalListSortingStrategy}
      >
        {folders?.map((folder) => (
          <DroppableFolderTab
            key={folder._id}
            folder={folder}
            isSelected={selectedFolderId === folder._id}
            onSelect={() => onSelectFolder(folder._id)}
            onUpdate={(updates) => updateFolder({ id: folder._id, ...updates })}
            onDelete={() => handleDeleteClick(folder)}
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
