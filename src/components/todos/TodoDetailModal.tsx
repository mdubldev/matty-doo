import { useState, useEffect, useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { Trash2, Save, Check } from 'lucide-react';
import { TiptapToolbar } from './TiptapToolbar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Todo, Id } from '@/lib/convex';

interface TodoDetailModalProps {
  todo: Todo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (args: { id: Id<'todos'>; title?: string; notes?: string }) => Promise<void>;
  onDelete: (args: { id: Id<'todos'> }) => Promise<void>;
  onToggleStatus: (args: { id: Id<'todos'> }) => Promise<void>;
}

export function TodoDetailModal({
  todo,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  onToggleStatus,
}: TodoDetailModalProps) {
  const [title, setTitle] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Add notes...',
      }),
      Link.configure({
        openOnClick: true,
      }),
    ],
    content: '',
    onUpdate: () => {
      setHasChanges(true);
    },
  });

  // Sync state when todo changes
  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      editor?.commands.setContent(todo.notes ?? '');
      setHasChanges(false);
    }
  }, [todo, editor]);

  const saveChanges = useCallback(async () => {
    if (!todo || !hasChanges) return;

    const updates: { id: Id<'todos'>; title?: string; notes?: string } = {
      id: todo._id,
    };

    if (title !== todo.title) {
      updates.title = title;
    }

    const editorContent = editor?.getHTML() ?? '';
    const notesChanged = editorContent !== (todo.notes ?? '');
    // Only save notes if they've actually changed and aren't just empty paragraph
    if (notesChanged && editorContent !== '<p></p>') {
      updates.notes = editorContent;
    } else if (notesChanged && editorContent === '<p></p>' && todo.notes) {
      // Clear notes if editor is empty but todo had notes
      updates.notes = '';
    }

    if (updates.title || updates.notes !== undefined) {
      await onUpdate(updates);
    }
    setHasChanges(false);
  }, [todo, title, editor, hasChanges, onUpdate]);

  const handleClose = async () => {
    await saveChanges();
    onOpenChange(false);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
  };

  const handleTitleBlur = async () => {
    if (todo && title !== todo.title && title.trim()) {
      await onUpdate({ id: todo._id, title: title.trim() });
      setHasChanges(false);
    }
  };

  const handleToggleStatus = async () => {
    if (todo) {
      await onToggleStatus({ id: todo._id });
    }
  };

  const handleDelete = async () => {
    if (todo) {
      await onDelete({ id: todo._id });
    }
  };

  if (!todo) return null;

  const isCompleted = todo.status === 'complete';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-lg"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          // Focus the notes editor instead
          setTimeout(() => editor?.commands.focus('end'), 0);
        }}
      >
        <DialogHeader>
          <Input
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            className={cn(
              'border-0 shadow-none focus-visible:ring-0 px-0 text-lg font-medium',
              isCompleted && 'line-through text-muted-foreground'
            )}
          />
        </DialogHeader>

        <div className="rounded-md border border-input bg-transparent overflow-hidden">
          <div className="min-h-[150px] px-3 py-2">
            <EditorContent editor={editor} className="tiptap" />
          </div>
          <TiptapToolbar editor={editor} />
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
            >
              <Check className="h-4 w-4 mr-2" />
              {isCompleted ? 'Mark incomplete' : 'Mark complete'}
            </Button>
            <Button
              size="sm"
              onClick={saveChanges}
              disabled={!hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
