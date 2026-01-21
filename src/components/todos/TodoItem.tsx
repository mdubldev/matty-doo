import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import type { Todo, Id } from '@/lib/convex';

interface TodoItemProps {
  todo: Todo;
  onToggleStatus: (args: { id: Id<'todos'> }) => Promise<void>;
  onDelete: (args: { id: Id<'todos'> }) => Promise<void>;
  onOpenDetail: (todo: Todo) => void;
}

export function TodoItem({
  todo,
  onToggleStatus,
  onDelete,
  onOpenDetail,
}: TodoItemProps) {
  const isCompleted = todo.status === 'complete';
  const hasNotes = !!todo.notes;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo._id,
    disabled: isCompleted,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking checkbox, drag handle, or delete button
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-slot="checkbox"]') ||
      target.closest('[data-action="drag"]') ||
      target.closest('[data-action="delete"]')
    ) {
      return;
    }
    onOpenDetail(todo);
  };

  const handleCheckboxChange = () => {
    onToggleStatus({ id: todo._id });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete({ id: todo._id });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors',
        'hover:bg-accent/50',
        isDragging && 'opacity-50 shadow-lg bg-accent'
      )}
      onClick={handleClick}
    >
      {/* Drag handle - only for pending todos */}
      {!isCompleted ? (
        <button
          data-action="drag"
          className="p-0.5 -ml-1 rounded opacity-0 group-hover:opacity-100 hover:bg-muted cursor-grab active:cursor-grabbing transition-opacity"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>
      ) : (
        <div className="w-5 -ml-1" /> // Spacer for alignment
      )}

      {/* Checkbox */}
      <Checkbox
        data-slot="checkbox"
        checked={isCompleted}
        onCheckedChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      />

      {/* Title */}
      <span
        className={cn(
          'flex-1 text-sm truncate',
          isCompleted && 'line-through text-muted-foreground'
        )}
      >
        {todo.title}
      </span>

      {/* Notes indicator */}
      {hasNotes && (
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
      )}

      {/* Delete button - visible for completed todos */}
      {isCompleted && (
        <Button
          data-action="delete"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
