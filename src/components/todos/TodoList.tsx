import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Separator } from '@/components/ui/separator';
import { useTodos } from '@/hooks/useTodos';
import { TodoQuickAdd } from './TodoQuickAdd';
import { TodoItem } from './TodoItem';
import { TodoDetailModal } from './TodoDetailModal';
import type { Id, Todo } from '@/lib/convex';

interface TodoListProps {
  spaceId: Id<'spaces'>;
}

export function TodoList({ spaceId }: TodoListProps) {
  const {
    todos,
    isLoading,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
    toggleTodoStatus,
  } = useTodos(spaceId);

  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Split todos into pending and completed
  const pendingTodos = (todos ?? []).filter((t) => t.status === 'pending');
  const completedTodos = (todos ?? []).filter((t) => t.status === 'complete');

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pendingTodos.findIndex((t) => t._id === active.id);
      const newIndex = pendingTodos.findIndex((t) => t._id === over.id);
      const newOrder = arrayMove(pendingTodos, oldIndex, newIndex);
      reorderTodos({ todoIds: newOrder.map((t) => t._id) });
    }
  };

  const handleOpenDetail = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTodo(null);
  };

  const handleToggleStatus = async (args: { id: Id<'todos'> }) => {
    await toggleTodoStatus(args);
  };

  const handleDelete = async (args: { id: Id<'todos'> }) => {
    await deleteTodo(args);
    // Close modal if deleted todo was being viewed
    if (selectedTodo?._id === args.id) {
      handleCloseModal();
    }
  };

  const handleUpdate = async (args: {
    id: Id<'todos'>;
    title?: string;
    notes?: string;
  }) => {
    await updateTodo(args);
    // Update selected todo if it's the one being edited
    if (selectedTodo?._id === args.id) {
      setSelectedTodo((prev) =>
        prev
          ? {
              ...prev,
              ...(args.title && { title: args.title }),
              ...(args.notes !== undefined && { notes: args.notes }),
            }
          : null
      );
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground">Loading todos...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Quick add input */}
      <TodoQuickAdd spaceId={spaceId} onCreateTodo={createTodo} />

      {/* Todo list */}
      <div className="flex-1 overflow-auto">
        {/* Empty state */}
        {pendingTodos.length === 0 && completedTodos.length === 0 && (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No todos yet. Add one above!
          </p>
        )}

        {/* Pending todos with drag-drop */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={pendingTodos.map((t) => t._id)}
            strategy={verticalListSortingStrategy}
          >
            {pendingTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onOpenDetail={handleOpenDetail}
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Completed divider */}
        {completedTodos.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2 mt-4">
            <Separator className="flex-1" />
            <span className="text-xs text-muted-foreground font-medium">
              Completed
            </span>
            <Separator className="flex-1" />
          </div>
        )}

        {/* Completed todos (not draggable) */}
        {completedTodos.map((todo) => (
          <TodoItem
            key={todo._id}
            todo={todo}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
            onOpenDetail={handleOpenDetail}
          />
        ))}
      </div>

      {/* Detail modal */}
      <TodoDetailModal
        todo={selectedTodo}
        open={isModalOpen}
        onOpenChange={(open) => {
          if (!open) handleCloseModal();
        }}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}
