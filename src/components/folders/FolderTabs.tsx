import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useFolders } from '@/hooks/useFolders';
import { FolderTab } from './FolderTab';
import { FolderCreateInline } from './FolderCreateInline';
import type { Id, FolderFilter } from '@/lib/convex';

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
  const { folders, isLoading, createFolder, updateFolder, deleteFolder } =
    useFolders(spaceId);

  const handleFolderCreated = (folderId: Id<'folders'>) => {
    setIsCreating(false);
    onSelectFolder(folderId);
  };

  const handleDeleteFolder = async (folderId: Id<'folders'>) => {
    // For now, just move todos to root and delete
    // Phase 6 will add a confirmation dialog
    await deleteFolder({ id: folderId, moveTodosToRoot: true });
    // If the deleted folder was selected, switch to "all"
    if (selectedFolderId === folderId) {
      onSelectFolder('all');
    }
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
      {/* "All" tab - always first */}
      <div
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md cursor-pointer transition-colors shrink-0 text-sm',
          selectedFolderId === 'all' ? 'bg-accent' : 'hover:bg-accent/50'
        )}
        onClick={() => onSelectFolder('all')}
      >
        All
      </div>

      {/* Folder tabs */}
      {folders?.map((folder) => (
        <FolderTab
          key={folder._id}
          folder={folder}
          isSelected={selectedFolderId === folder._id}
          onSelect={() => onSelectFolder(folder._id)}
          onUpdate={(updates) => updateFolder({ id: folder._id, ...updates })}
          onDelete={() => handleDeleteFolder(folder._id)}
        />
      ))}

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
  );
}
