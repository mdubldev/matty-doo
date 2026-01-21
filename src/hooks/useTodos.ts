import { useQuery, useMutation } from "convex/react";
import { toast } from "sonner";
import { api, type Id, type FolderFilter } from "@/lib/convex";

export function useTodos(
  spaceId: Id<"spaces"> | undefined,
  folderFilter?: FolderFilter
) {
  const todos = useQuery(
    api.todos.list,
    spaceId ? { spaceId, folderFilter } : "skip"
  );
  const createTodoMutation = useMutation(api.todos.create);
  const updateTodoMutation = useMutation(api.todos.update);
  const deleteTodoMutation = useMutation(api.todos.remove);
  const reorderTodosMutation = useMutation(api.todos.reorder);
  const toggleTodoStatusMutation = useMutation(api.todos.toggleStatus);
  const moveToFolderMutation = useMutation(api.todos.moveToFolder);

  const createTodo = async (args: {
    spaceId: Id<"spaces">;
    folderId?: Id<"folders">;
    title: string;
  }) => {
    try {
      return await createTodoMutation(args);
    } catch (error) {
      toast.error("Failed to create todo");
      throw error;
    }
  };

  const updateTodo = async (args: { id: Id<"todos">; title?: string; notes?: string }) => {
    try {
      return await updateTodoMutation(args);
    } catch (error) {
      toast.error("Failed to update todo");
      throw error;
    }
  };

  const deleteTodo = async (args: { id: Id<"todos"> }) => {
    try {
      return await deleteTodoMutation(args);
    } catch (error) {
      toast.error("Failed to delete todo");
      throw error;
    }
  };

  const reorderTodos = async (args: { todoIds: Id<"todos">[] }) => {
    try {
      return await reorderTodosMutation(args);
    } catch (error) {
      toast.error("Failed to reorder todos");
      throw error;
    }
  };

  const toggleTodoStatus = async (args: { id: Id<"todos"> }) => {
    try {
      return await toggleTodoStatusMutation(args);
    } catch (error) {
      toast.error("Failed to update todo status");
      throw error;
    }
  };

  const moveTodoToFolder = async (args: { id: Id<"todos">; folderId?: Id<"folders"> }) => {
    try {
      return await moveToFolderMutation(args);
    } catch (error) {
      toast.error("Failed to move todo");
      throw error;
    }
  };

  return {
    todos,
    isLoading: todos === undefined,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
    toggleTodoStatus,
    moveTodoToFolder,
  };
}
