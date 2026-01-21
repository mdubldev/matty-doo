import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * List all spaces for the current user, ordered by the `order` field.
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return [];
    }

    const spaces = await ctx.db
      .query("spaces")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    return spaces.sort((a, b) => a.order - b.order);
  },
});

/**
 * Create a new space with default values.
 */
export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const existingSpaces = await ctx.db
      .query("spaces")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const maxOrder = existingSpaces.reduce(
      (max, space) => Math.max(max, space.order),
      -1
    );

    const spaceId = await ctx.db.insert("spaces", {
      userId,
      name: args.name,
      color: args.color,
      icon: args.icon,
      order: maxOrder + 1,
      createdAt: Date.now(),
    });

    return spaceId;
  },
});

/**
 * Update a space's details (name, color, icon).
 */
export const update = mutation({
  args: {
    id: v.id("spaces"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const space = await ctx.db.get(args.id);
    if (!space || space.userId !== userId) {
      throw new Error("Space not found or access denied");
    }

    const updates: Partial<{ name: string; color: string; icon: string }> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.color !== undefined) updates.color = args.color;
    if (args.icon !== undefined) updates.icon = args.icon;

    await ctx.db.patch(args.id, updates);
  },
});

/**
 * Delete a space and ALL its to-dos (cascade delete).
 */
export const remove = mutation({
  args: {
    id: v.id("spaces"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const space = await ctx.db.get(args.id);
    if (!space || space.userId !== userId) {
      throw new Error("Space not found or access denied");
    }

    // Delete all todos in this space (cascade delete)
    const todos = await ctx.db
      .query("todos")
      .withIndex("by_space", (q) => q.eq("spaceId", args.id))
      .collect();

    for (const todo of todos) {
      await ctx.db.delete(todo._id);
    }

    await ctx.db.delete(args.id);
  },
});

/**
 * Reorder spaces after drag-drop.
 * Accepts an array of space IDs in the new order.
 */
export const reorder = mutation({
  args: {
    spaceIds: v.array(v.id("spaces")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    for (let i = 0; i < args.spaceIds.length; i++) {
      const space = await ctx.db.get(args.spaceIds[i]);

      if (!space || space.userId !== userId) {
        throw new Error("Space not found or access denied");
      }

      await ctx.db.patch(args.spaceIds[i], { order: i });
    }
  },
});
