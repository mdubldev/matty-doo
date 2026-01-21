import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DeleteFolderDialogProps {
  folderName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (moveTodosToRoot: boolean) => void;
}

export function DeleteFolderDialog({
  folderName,
  open,
  onOpenChange,
  onConfirm,
}: DeleteFolderDialogProps) {
  const [moveTodosToRoot, setMoveTodosToRoot] = useState(true);

  const handleConfirm = () => {
    onConfirm(moveTodosToRoot);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Delete folder</DialogTitle>
          <DialogDescription>
            What should happen to the todos in "{folderName}"?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="deleteOption"
              checked={moveTodosToRoot}
              onChange={() => setMoveTodosToRoot(true)}
              className="w-4 h-4 text-primary border-border focus:ring-primary"
            />
            <div>
              <div className="text-sm font-medium">Move todos to root</div>
              <div className="text-xs text-muted-foreground">
                Todos will be moved out of the folder but kept in the space
              </div>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="radio"
              name="deleteOption"
              checked={!moveTodosToRoot}
              onChange={() => setMoveTodosToRoot(false)}
              className="w-4 h-4 text-primary border-border focus:ring-primary"
            />
            <div>
              <div className="text-sm font-medium">Delete all todos</div>
              <div className="text-xs text-muted-foreground">
                All todos in this folder will be permanently deleted
              </div>
            </div>
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Delete folder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
