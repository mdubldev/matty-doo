import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all folders for a space, ordered by the `order` field.
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

    // Verify user owns this space
    const space = await ctx.db.get(args.spaceId);
    if (!space || space.userId !== userId) {
      return [];
    }

    const folders = await ctx.db
      .query("folders")
      .withIndex("by_space", (q) => q.eq("spaceId", args.spaceId))
      .collect();

    return folders.sort((a, b) => a.order - b.order);
  },
});

/**
 * Get a single folder by ID.
 */
export const get = query({
  args: {
    id: v.id("folders"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return null;
    }

    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== userId) {
      return null;
    }

    return folder;
  },
});

/**
 * Create a new folder in a space.
 */
export const create = mutation({
  args: {
    spaceId: v.id("spaces"),
    name: v.string(),
    color: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    // Verify user owns this space
    const space = await ctx.db.get(args.spaceId);
    if (!space || space.userId !== userId) {
      throw new Error("Space not found or access denied");
    }

    const existingFolders = await ctx.db
      .query("folders")
      .withIndex("by_space", (q) => q.eq("spaceId", args.spaceId))
      .collect();

    const maxOrder = existingFolders.reduce(
      (max, folder) => Math.max(max, folder.order),
      -1
    );

    const folderId = await ctx.db.insert("folders", {
      spaceId: args.spaceId,
      userId,
      name: args.name,
      color: args.color,
      icon: args.icon,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });

    return folderId;
  },
});

/**
 * Update a folder's details (name, color, icon).
 */
export const update = mutation({
  args: {
    id: v.id("folders"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found or access denied");
    }

    const updates: Partial<{ name: string; color: string; icon: string }> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.color !== undefined) updates.color = args.color;
    if (args.icon !== undefined) updates.icon = args.icon;

    await ctx.db.patch(args.id, updates);
  },
});

/**
 * Delete a folder.
 * If moveTodosToRoot is true, moves todos to root level (no folder).
 * Otherwise, deletes all todos in the folder.
 */
export const remove = mutation({
  args: {
    id: v.id("folders"),
    moveTodosToRoot: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const folder = await ctx.db.get(args.id);
    if (!folder || folder.userId !== userId) {
      throw new Error("Folder not found or access denied");
    }

    // Get all todos in this folder
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_folder", (q) => q.eq("folderId", args.id))
      .collect();

    if (args.moveTodosToRoot) {
      // Move todos to root level (remove folderId)
      for (const todo of todos) {
        await ctx.db.patch(todo._id, { folderId: undefined });
      }
    } else {
      // Delete all todos in this folder
      for (const todo of todos) {
        await ctx.db.delete(todo._id);
      }
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Reorder folders after drag-drop.
 * Accepts an array of folder IDs in the new order.
 */
export const reorder = mutation({
  args: {
    folderIds: v.array(v.id("folders")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    for (let i = 0; i < args.folderIds.length; i++) {
      const folder = await ctx.db.get(args.folderIds[i]);

      if (!folder || folder.userId !== userId) {
        throw new Error("Folder not found or access denied");
      }

      await ctx.db.patch(args.folderIds[i], { order: i });
    }
  },
});
