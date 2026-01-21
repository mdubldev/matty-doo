import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  spaces: defineTable({
    userId: v.string(),
    name: v.string(),
    color: v.string(),
    icon: v.string(),
    order: v.number(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  todos: defineTable({
    spaceId: v.id("spaces"),
    userId: v.string(),
    title: v.string(),
    notes: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("complete")),
    order: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_space", ["spaceId"])
    .index("by_user", ["userId"]),
});
