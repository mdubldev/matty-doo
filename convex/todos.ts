import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List todos for a space, optionally filtered by folder.
 * folderFilter options:
 *   - undefined or "all": all todos in the space
 *   - "root": only todos with no folder (folderId is undefined)
 *   - folderId: only todos in that specific folder
 * Returns pending todos first (by order), then completed todos (by order).
 */
export const list = query({
  args: {
    spaceId: v.id("spaces"),
    folderFilter: v.optional(
      v.union(v.literal("all"), v.literal("root"), v.id("folders"))
    ),
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

    let todos = await ctx.db
      .query("todos")
      .withIndex("by_space", (q) => q.eq("spaceId", args.spaceId))
      .collect();

    // Apply folder filter
    const filter = args.folderFilter;
    if (filter === "root") {
      todos = todos.filter((t) => t.folderId === undefined);
    } else if (filter && filter !== "all") {
      todos = todos.filter((t) => t.folderId === filter);
    }
    // "all" or undefined = no filtering

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
 * If folderId is provided, the todo is created in that folder.
 * Order is calculated within the folder context (or root if no folder).
 */
export const create = mutation({
  args: {
    spaceId: v.id("spaces"),
    folderId: v.optional(v.id("folders")),
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

    // Verify folder belongs to this space if provided
    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.spaceId !== args.spaceId || folder.userId !== userId) {
        throw new Error("Folder not found or access denied");
      }
    }

    // Get todos in the same folder context for ordering
    const existingTodos = await ctx.db
      .query("todos")
      .withIndex("by_space", (q) => q.eq("spaceId", args.spaceId))
      .collect();

    // Filter to same folder context
    const sameFolderTodos = existingTodos.filter((t) =>
      args.folderId ? t.folderId === args.folderId : t.folderId === undefined
    );

    const pendingTodos = sameFolderTodos.filter((t) => t.status === "pending");

    // Shift all pending todos in this folder down by incrementing their order
    for (const todo of pendingTodos) {
      await ctx.db.patch(todo._id, { order: todo.order + 1 });
    }

    const todoId = await ctx.db.insert("todos", {
      spaceId: args.spaceId,
      folderId: args.folderId,
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
 * Ordering is calculated within the todo's folder context.
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

    // Filter to same folder context for ordering
    const sameFolderTodos = allTodos.filter((t) =>
      todo.folderId ? t.folderId === todo.folderId : t.folderId === undefined
    );

    if (todo.status === "pending") {
      // Completing: move to bottom of completed list in same folder
      const completedTodos = sameFolderTodos.filter((t) => t.status === "complete");
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
      // Uncompleting: move to top of pending list in same folder
      const pendingTodos = sameFolderTodos.filter((t) => t.status === "pending");

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

/**
 * Move a todo to a different folder (or to root if folderId is undefined).
 * Recalculates order within the new folder context.
 */
export const moveToFolder = mutation({
  args: {
    id: v.id("todos"),
    folderId: v.optional(v.id("folders")),
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

    // If moving to same folder, do nothing
    if (todo.folderId === args.folderId) {
      return;
    }

    // Verify target folder belongs to the same space
    if (args.folderId) {
      const folder = await ctx.db.get(args.folderId);
      if (!folder || folder.spaceId !== todo.spaceId || folder.userId !== userId) {
        throw new Error("Folder not found or access denied");
      }
    }

    // Get todos in the target folder to calculate new order
    const allTodos = await ctx.db
      .query("todos")
      .withIndex("by_space", (q) => q.eq("spaceId", todo.spaceId))
      .collect();

    const targetFolderTodos = allTodos.filter((t) =>
      args.folderId ? t.folderId === args.folderId : t.folderId === undefined
    );

    // Calculate new order based on status
    let newOrder: number;
    if (todo.status === "pending") {
      // Move to top of pending in new folder
      const pendingTodos = targetFolderTodos.filter((t) => t.status === "pending");
      for (const t of pendingTodos) {
        await ctx.db.patch(t._id, { order: t.order + 1 });
      }
      newOrder = 0;
    } else {
      // Move to bottom of completed in new folder
      const completedTodos = targetFolderTodos.filter((t) => t.status === "complete");
      const maxOrder = completedTodos.reduce((max, t) => Math.max(max, t.order), -1);
      newOrder = maxOrder + 1;
    }

    await ctx.db.patch(args.id, {
      folderId: args.folderId,
      order: newOrder,
    });
  },
});
