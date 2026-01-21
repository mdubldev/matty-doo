import { useRef } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, FileText } from 'lucide-react';
import confetti from 'canvas-confetti';
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
  const checkboxRef = useRef<HTMLButtonElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo._id,
    // All todos are draggable (for cross-folder movement)
    // Reordering is controlled in onDragEnd handler
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking checkbox or delete button
    const target = e.target as HTMLElement;
    if (
      target.closest('[data-slot="checkbox"]') ||
      target.closest('[data-action="delete"]')
    ) {
      return;
    }
    onOpenDetail(todo);
  };

  const handleCheckboxChange = () => {
    // Trigger confetti when marking as complete (not when unchecking)
    if (!isCompleted && checkboxRef.current) {
      const rect = checkboxRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      confetti({
        particleCount: 30,
        spread: 40,
        origin: { x, y },
        colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
        ticks: 50,
        gravity: 2,
        scalar: 0.6,
        startVelocity: 15,
        disableForReducedMotion: true,
      });
    }
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
        'group flex items-center gap-3 px-4 py-3 rounded-md cursor-grab transition-colors',
        'hover:bg-accent/50 active:cursor-grabbing',
        isDragging && 'opacity-50 shadow-lg bg-accent cursor-grabbing'
      )}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      {/* Drag indicator - visual hint that item is draggable */}
      <div className="p-0.5 -ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

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

      {/* Delete button */}
      <Button
        data-action="delete"
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0 transition-opacity"
        onClick={handleDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {/* Checkbox */}
      <Checkbox
        ref={checkboxRef}
        data-slot="checkbox"
        checked={isCompleted}
        onCheckedChange={handleCheckboxChange}
        onClick={(e) => e.stopPropagation()}
        className="shrink-0"
      />
    </div>
  );
}
