import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

export function useTodos(spaceId: Id<"spaces"> | undefined) {
  const todos = useQuery(api.todos.list, spaceId ? { spaceId } : "skip");
  const createTodo = useMutation(api.todos.create);
  const updateTodo = useMutation(api.todos.update);
  const deleteTodo = useMutation(api.todos.remove);
  const reorderTodos = useMutation(api.todos.reorder);
  const toggleTodoStatus = useMutation(api.todos.toggleStatus);

  return {
    todos,
    isLoading: todos === undefined,
    createTodo,
    updateTodo,
    deleteTodo,
    reorderTodos,
    toggleTodoStatus,
  };
}
