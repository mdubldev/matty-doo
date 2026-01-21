import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  pointerWithin,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type CollisionDetection,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useTodos } from '@/hooks/useTodos';
import { useFolders } from '@/hooks/useFolders';
import { TodoQuickAdd } from './TodoQuickAdd';
import { TodoItem } from './TodoItem';
import { TodoDetailModal } from './TodoDetailModal';
import { TodoListSkeleton } from './TodoSkeleton';
import { FolderTabs } from '@/components/folders/FolderTabs';
import type { Id, Todo, Space, FolderFilter } from '@/lib/convex';

// Custom collision detection: prioritize folder droppables, then sortable items
const customCollisionDetection: CollisionDetection = (args) => {
  // First, check if pointer is within any droppable (folder tabs)
  const pointerCollisions = pointerWithin(args);

  // If we're over a folder tab, use that
  const folderCollision = pointerCollisions.find(
    (collision) => String(collision.id).startsWith('folder-')
  );
  if (folderCollision) {
    return [folderCollision];
  }

  // Otherwise, use closestCenter for sortable todo reordering
  return closestCenter(args);
};

interface TodoListProps {
  spaceId: Id<'spaces'>;
  space: Space;
  selectedFolderId: FolderFilter;
  onSelectFolder: (folderId: FolderFilter) => void;
}

export function TodoList({ spaceId, space, selectedFolderId, onSelectFolder }: TodoListProps) {
  const {
    todos,
    isLoading,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
    toggleTodoStatus,
    moveTodoToFolder,
  } = useTodos(spaceId, selectedFolderId);

  const { folders, reorderFolders } = useFolders(spaceId);

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
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // Folder tab reordering (both active and over are folders)
    if (activeId.startsWith('folder-') && overId.startsWith('folder-')) {
      // Skip if dragging to "All" tab (folder-root) or same position
      if (overId === 'folder-root' || activeId === overId) return;

      const activeFolderId = activeId.replace('folder-', '') as Id<'folders'>;
      const overFolderId = overId.replace('folder-', '') as Id<'folders'>;

      if (folders) {
        const oldIndex = folders.findIndex((f) => f._id === activeFolderId);
        const newIndex = folders.findIndex((f) => f._id === overFolderId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(folders, oldIndex, newIndex);
          reorderFolders({ folderIds: newOrder.map((f) => f._id) });
        }
      }
      return;
    }

    // Cross-folder drop: todo onto folder tab (works for any todo, any view)
    if (overId.startsWith('folder-')) {
      const todoId = active.id as Id<'todos'>;
      if (overId === 'folder-root') {
        moveTodoToFolder({ id: todoId, folderId: undefined });
      } else {
        const folderId = overId.replace('folder-', '') as Id<'folders'>;
        moveTodoToFolder({ id: todoId, folderId });
      }
      return;
    }

    // Todo reorder logic (only pending→pending, only in specific folder view)
    if (selectedFolderId !== 'all' && active.id !== over.id) {
      const draggedTodo = todos?.find((t) => t._id === active.id);
      const targetTodo = todos?.find((t) => t._id === over.id);

      // Only reorder if both are pending
      if (draggedTodo?.status === 'pending' && targetTodo?.status === 'pending') {
        const oldIndex = pendingTodos.findIndex((t) => t._id === active.id);
        const newIndex = pendingTodos.findIndex((t) => t._id === over.id);
        const newOrder = arrayMove(pendingTodos, oldIndex, newIndex);
        reorderTodos({ todoIds: newOrder.map((t) => t._id) });
      }
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
      <div className="h-full flex flex-col">
        {/* Space header skeleton */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Skeleton className="w-3 h-3 rounded-full shrink-0" />
          <Skeleton className="w-6 h-6 rounded shrink-0" />
          <Skeleton className="h-5 w-32" />
        </div>
        {/* Quick add skeleton */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Skeleton className="h-5 w-5 rounded shrink-0" />
          <Skeleton className="h-5 flex-1" />
        </div>
        {/* Todo list skeleton */}
        <TodoListSkeleton count={5} />
      </div>
    );
  }

  // All todo IDs for SortableContext (enables dragging for all todos)
  const allTodoIds = [...pendingTodos, ...completedTodos].map((t) => t._id);

  return (
    <div className="h-full flex flex-col">
      {/* Space header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
        <div
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: space.color }}
        />
        {space.icon && <span className="text-lg">{space.icon}</span>}
        <h1 className="text-lg font-semibold truncate">{space.name}</h1>
      </div>

      {/* DndContext wraps folder tabs and todos for cross-folder drag-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragEnd={handleDragEnd}
      >
        {/* Folder tabs (droppable targets) */}
        <div className="px-4 pt-3">
          <FolderTabs
            spaceId={spaceId}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
          />
        </div>

        {/* Quick add input */}
        <TodoQuickAdd
          spaceId={spaceId}
          onCreateTodo={createTodo}
          selectedFolderId={selectedFolderId}
          folders={folders}
        />

        {/* Todo list */}
        <div className="flex-1 overflow-auto">
          {/* Empty state */}
          {pendingTodos.length === 0 && completedTodos.length === 0 && (
            <div className="py-16 px-4 text-center">
              <div className="text-4xl mb-4">✨</div>
              <p className="text-sm font-medium text-foreground mb-1">
                All clear!
              </p>
              <p className="text-xs text-muted-foreground">
                Add your first todo using the input above
              </p>
            </div>
          )}

          {/* All todos in SortableContext (enables dragging for folder drops) */}
          <SortableContext
            items={allTodoIds}
            strategy={verticalListSortingStrategy}
          >
            {/* Pending todos */}
            {pendingTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onOpenDetail={handleOpenDetail}
              />
            ))}

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

            {/* Completed todos (draggable to folders, but not reorderable) */}
            {completedTodos.map((todo) => (
              <TodoItem
                key={todo._id}
                todo={todo}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onOpenDetail={handleOpenDetail}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

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
