// Re-export Convex types for use in frontend components
// This file exists because Vite cannot import directly from .d.ts files

import type { GenericId } from "convex/values";

// Table names in our schema
export type TableNames = "spaces" | "todos";

// Type-safe document ID
export type Id<T extends TableNames> = GenericId<T>;

// Re-export api (this works because api.js exists)
export { api } from "../../convex/_generated/api";

// Document interfaces (matching the Convex schema)
export interface Space {
  _id: Id<"spaces">;
  _creationTime: number;
  userId: string;
  name: string;
  color: string;
  icon: string;
  order: number;
  createdAt: number;
}

export interface Todo {
  _id: Id<"todos">;
  _creationTime: number;
  spaceId: Id<"spaces">;
  userId: string;
  title: string;
  notes?: string;
  status: "pending" | "complete";
  order: number;
  createdAt: number;
  completedAt?: number;
}
