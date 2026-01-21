import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all todos for a space.
 * Returns pending todos first (by order), then completed todos (by order).
 */
export const list = query({
  args: {
    spaceId: v.id("spaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const space = await ctx.db.get(args.spaceId);
    if (!space || space.userId !== userId) {
      return [];
    }

    const todos = await ctx.db
      .query("todos")
      .withIndex("by_space", (q) => q.eq("spaceId", args.spaceId))
      .collect();

    const pending = todos
      .filter((t) => t.status === "pending")
      .sort((a, b) => a.order - b.order);

    const completed = todos
      .filter((t) => t.status === "complete")
      .sort((a, b) => a.order - b.order);

    return [...pending, ...completed];
  },
});

/**
 * Create a new todo at the top of the pending list.
 */
export const create = mutation({
  args: {
    spaceId: v.id("spaces"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const space = await ctx.db.get(args.spaceId);
    if (!space || space.userId !== userId) {
      throw new Error("Space not found or access denied");
    }

    const existingTodos = await ctx.db
      .query("todos")
      .withIndex("by_space", (q) => q.eq("spaceId", args.spaceId))
      .collect();

    const pendingTodos = existingTodos.filter((t) => t.status === "pending");

    // Shift all pending todos down by incrementing their order
    for (const todo of pendingTodos) {
      await ctx.db.patch(todo._id, { order: todo.order + 1 });
    }

    const todoId = await ctx.db.insert("todos", {
      spaceId: args.spaceId,
      userId,
      title: args.title,
      status: "pending",
      order: 0,
      createdAt: Date.now(),
    });

    return todoId;
  },
});

/**
 * Update a todo's title or notes.
 */
export const update = mutation({
  args: {
    id: v.id("todos"),
    title: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found or access denied");
    }

    const updates: Partial<{ title: string; notes: string }> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.notes !== undefined) updates.notes = args.notes;

    await ctx.db.patch(args.id, updates);
  },
});

/**
 * Delete a todo.
 */
export const remove = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found or access denied");
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Reorder todos within a space.
 * Accepts an array of todo IDs in the new order.
 */
export const reorder = mutation({
  args: {
    todoIds: v.array(v.id("todos")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    for (let i = 0; i < args.todoIds.length; i++) {
      const todo = await ctx.db.get(args.todoIds[i]);

      if (!todo || todo.userId !== userId) {
        throw new Error("Todo not found or access denied");
      }

      await ctx.db.patch(args.todoIds[i], { order: i });
    }
  },
});

/**
 * Toggle a todo's status between pending and complete.
 * When completing: moves to bottom of completed list, sets completedAt.
 * When uncompleting: moves to top of pending list, clears completedAt.
 */
export const toggleStatus = mutation({
  args: {
    id: v.id("todos"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const todo = await ctx.db.get(args.id);
    if (!todo || todo.userId !== userId) {
      throw new Error("Todo not found or access denied");
    }

    const allTodos = await ctx.db
      .query("todos")
      .withIndex("by_space", (q) => q.eq("spaceId", todo.spaceId))
      .collect();

    if (todo.status === "pending") {
      // Completing: move to bottom of completed list
      const completedTodos = allTodos.filter((t) => t.status === "complete");
      const maxCompletedOrder = completedTodos.reduce(
        (max, t) => Math.max(max, t.order),
        -1
      );

      await ctx.db.patch(args.id, {
        status: "complete",
        order: maxCompletedOrder + 1,
        completedAt: Date.now(),
      });
    } else {
      // Uncompleting: move to top of pending list
      const pendingTodos = allTodos.filter((t) => t.status === "pending");

      // Shift all pending todos down
      for (const t of pendingTodos) {
        await ctx.db.patch(t._id, { order: t.order + 1 });
      }

      await ctx.db.patch(args.id, {
        status: "pending",
        order: 0,
        completedAt: undefined,
      });
    }
  },
});
