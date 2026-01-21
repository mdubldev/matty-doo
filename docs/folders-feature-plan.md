# Folders Feature - Development Plan

## Feature Overview

Add optional folders within spaces to enable hierarchical organization of todos.

**Example use case:** A "Goals" space with "Personal" and "Professional" folders, each containing their own todos.

---

## UX Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Folder requirement | Optional | Spaces can have loose todos AND/OR folders - more flexible |
| Folder display | Horizontal tabs | Clean, familiar pattern (like browser tabs), minimal UI change |
| Cross-folder movement | Drag-drop | Drag todos onto folder tabs to move them - more powerful UX |

---

## UI Design

### Layout

```
┌─────────────────────────────────────────────────────────┐
│ 🎯 Goals                                   (space header)│
├─────────────────────────────────────────────────────────┤
│ [All] [● Personal] [● Professional] [+ Add Folder]      │  ← Folder tabs
├─────────────────────────────────────────────────────────┤
│ + Add a todo...                             (quick add) │
├─────────────────────────────────────────────────────────┤
│   Todo 1                                                │
│   Todo 2                                                │
│   ─────────── Completed ───────────                     │
│   ✓ Done todo                                           │
└─────────────────────────────────────────────────────────┘
```

### Tab Behaviors

- **Click tab** → Filter to that folder's todos
- **"All" tab** → Shows all todos (root + all folders)
- **Drag todo onto tab** → Moves todo to that folder
- **Drag onto "All"** → Moves to root (no folder)
- **Double-click tab** → Inline rename
- **Right-click / menu** → Edit color, Delete folder

---

## Database Schema

### New `folders` Table

```typescript
folders: defineTable({
  spaceId: v.id("spaces"),
  userId: v.string(),
  name: v.string(),
  color: v.string(),
  icon: v.optional(v.string()),
  order: v.number(),
  createdAt: v.number(),
})
  .index("by_space", ["spaceId"])
  .index("by_user", ["userId"]),
```

### Modified `todos` Table

```typescript
todos: defineTable({
  spaceId: v.id("spaces"),
  folderId: v.optional(v.id("folders")),  // NEW - null = root level
  userId: v.string(),
  title: v.string(),
  notes: v.optional(v.string()),
  status: v.union(v.literal("pending"), v.literal("complete")),
  order: v.number(),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
})
  .index("by_space", ["spaceId"])
  .index("by_folder", ["folderId"])  // NEW INDEX
  .index("by_user", ["userId"]),
```

---

## File Changes

### New Files

| File | Purpose |
|------|---------|
| `convex/folders.ts` | Folder queries/mutations (list, create, update, delete, reorder) |
| `src/hooks/useFolders.ts` | React hook wrapping folder operations |
| `src/components/folders/FolderTabs.tsx` | Horizontal tab bar with "All" + folder tabs |
| `src/components/folders/FolderTab.tsx` | Individual tab (clickable, droppable, editable) |
| `src/components/folders/FolderCreateInline.tsx` | Inline folder creation |
| `src/components/folders/DeleteFolderDialog.tsx` | Confirm delete with options |

### Modified Files

| File | Changes |
|------|---------|
| `convex/schema.ts` | Add folders table, folderId to todos |
| `convex/todos.ts` | Add folderId to create, filter by folder in list, add moveToFolder mutation |
| `convex/spaces.ts` | Cascade delete folders when space deleted |
| `src/lib/convex.ts` | Add Folder type, FolderFilter type |
| `src/hooks/useTodos.ts` | Add folder filter param, moveTodoToFolder mutation |
| `src/pages/AppPage.tsx` | Add selectedFolderId state, reset on space change |
| `src/components/todos/TodoList.tsx` | Insert FolderTabs, filter todos by folder, handle cross-folder drops |
| `src/components/todos/TodoQuickAdd.tsx` | Accept folderId prop, pass to createTodo |

---

## Implementation Phases

### Phase 1: Database Layer
- [x] Update `convex/schema.ts` - add folders table, folderId to todos
- [x] Create `convex/folders.ts` with queries/mutations
- [x] Update `convex/todos.ts` - folderId in create, list filter, moveToFolder
- [x] Update `convex/spaces.ts` - cascade delete folders

### Phase 2: Type Definitions & Hooks
- [x] Update `src/lib/convex.ts` with Folder type, FolderFilter type
- [x] Create `src/hooks/useFolders.ts`
- [x] Update `src/hooks/useTodos.ts` - add folder filter, move mutation

### Phase 3: Basic Folder Components
- [x] Create `FolderTab.tsx` - individual tab display
- [x] Create `FolderTabs.tsx` - tab bar container
- [x] Create `FolderCreateInline.tsx` - inline creation

### Phase 4: Integration
- [x] Update `AppPage.tsx` - add selectedFolderId state
- [x] Update `TodoList.tsx` - insert FolderTabs, filter todos
- [x] Update `TodoQuickAdd.tsx` - pass folderId to create (+ folder selector dropdown in "All" view)

### Phase 5: Cross-Folder Drag-Drop
- [x] Make FolderTab a droppable target
- [x] Update TodoList DndContext to detect folder-tab drops
- [x] Call moveTodoToFolder on cross-folder drop

### Phase 6: Folder Management
- [ ] Create `DeleteFolderDialog.tsx` - confirm with move-to-root option
- [ ] Add edit/delete actions to FolderTab
- [ ] Add folder tab reordering (drag tabs)

### Phase 7: Polish
- [ ] Loading states, empty states per folder
- [ ] Mobile responsiveness (horizontal scroll for tabs)
- [ ] Keyboard navigation for tabs

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| Delete folder with todos | Show dialog: "Move todos to root" or "Delete todos" |
| Quick-add in "All" view | Creates at root level (no folder) |
| "All" tab ordering | Show todos grouped by folder with subtle headers |
| Drag in "All" view | Disabled - only reorder in specific folder view |
| Empty folder | Show "No todos yet" message |
| Long folder name | Truncate with ellipsis, tooltip on hover |

---

## Convex Functions Reference

### folders.ts

```typescript
// Queries
folders.list({ spaceId })        // Get all folders for a space, ordered
folders.get({ id })              // Get single folder by ID

// Mutations
folders.create({ spaceId, name, color, icon? })  // Create folder
folders.update({ id, name?, color?, icon? })     // Update folder
folders.delete({ id, moveTodosToRoot })          // Delete folder
folders.reorder({ folderIds })                   // Reorder folders
```

### todos.ts (updated)

```typescript
// Updated
todos.create({ spaceId, folderId?, title })      // Now accepts optional folderId
todos.list({ spaceId, folderId? })               // Filter: "all" | "root" | folderId

// New
todos.moveToFolder({ id, folderId? })            // Move todo to folder (null = root)
```

---

## Verification Checklist

- [ ] Create a new folder in a space
- [ ] Add todos directly to the folder via quick-add
- [ ] Switch between "All" and specific folder tabs
- [ ] Drag a todo from one folder tab to another
- [ ] Rename a folder (double-click or menu)
- [ ] Change folder color
- [ ] Delete a folder - verify todos moved to root
- [ ] Delete a folder - verify todos deleted (when chosen)
- [ ] Delete a space - verify folders cascade deleted
- [ ] Mobile: verify tabs scroll horizontally
- [ ] Verify existing spaces without folders still work
- [ ] Verify "All" tab shows all todos correctly
