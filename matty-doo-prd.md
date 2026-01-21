# Matty Doo - Product Requirements Document

> A super lightweight, personal to-do app

---

## Overview

**Matty Doo** is a minimal, responsive web app for managing personal to-dos. It prioritizes simplicity and speed over feature bloat—just spaces, to-dos, and the ability to add notes when needed.

**Target user:** Single user (personal use)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+ |
| Styling | Tailwind CSS + shadcn/ui |
| Backend/Database | Convex |
| Authentication | Convex Auth (email/password) |
| Rich Text Editor | Tiptap |
| Drag & Drop | dnd-kit |
| Hosting | Vercel |

---

## Design Principles

1. **Keep it lightweight** — Resist feature creep. Every addition should earn its place.
2. **Frictionless creation** — Adding a to-do or space should be near-instantaneous. No unnecessary modals, confirmations, or steps. Capture the thought before it escapes.
3. **Fast interactions** — Drag-drop, status toggles, and edits should feel instant.
4. **Not generic AI aesthetic** — Avoid the typical blue/purple gradients, excessive rounded corners, and generic illustrations. Aim for a clean, slightly opinionated design with personality.

---

## Data Models

### Space

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Convex document ID |
| `userId` | string | Owner of the space |
| `name` | string | Space name |
| `color` | string | Hex color for visual identification |
| `icon` | string | Icon identifier (emoji or icon library key) |
| `order` | number | Position in the spaces list |
| `createdAt` | number | Timestamp |

### To-Do

| Field | Type | Description |
|-------|------|-------------|
| `_id` | string | Convex document ID |
| `spaceId` | string | Reference to parent space |
| `userId` | string | Owner of the to-do |
| `title` | string | To-do title |
| `notes` | string | Rich text content (Tiptap JSON or HTML) |
| `status` | string | `"pending"` or `"complete"` |
| `order` | number | Position in the to-do list |
| `createdAt` | number | Timestamp |
| `completedAt` | number \| null | Timestamp when marked complete |

---

## Features

### Phase 1: Foundation

#### 1.1 Landing Page
- Minimal hero section
- Short description: "A super lightweight to-dos app"
- Two CTAs: "Log in" and "Sign up"
- Clean, simple design

#### 1.2 Authentication
- Email/password signup
- Email/password login
- Logout functionality
- Protected routes (redirect to login if unauthenticated)
- No email verification required
- No password reset (for now)

#### 1.3 Spaces (CRUD)
- **Create:** Modal or inline form to add a new space with name, color, and icon
- **Read:** Display all spaces in a sidebar or main view
- **Update:** Edit space name, color, icon via modal or inline
- **Delete:** Delete space (with confirmation). Deleting a space deletes all its to-dos
- **Reorder:** Drag-and-drop to reorder spaces

#### 1.4 To-Dos (CRUD)
- **Create:** Inline input at top/bottom of list to quickly add a to-do
- **Read:** Display to-dos within selected space
- **Update:** 
  - Inline title editing (click to edit)
  - Open detail modal for notes/rich text editing
- **Delete:** Delete button appears when to-do is marked complete
- **Reorder:** Drag-and-drop to reorder within a space

#### 1.5 To-Do Status
- Toggle between `pending` and `complete`
- Completed to-dos automatically move to bottom of list
- Visual differentiation for completed items (strikethrough, muted color)

#### 1.6 To-Do Detail Modal
- Opens when clicking on a to-do
- Displays title (editable)
- Rich text editor (Tiptap) for notes
  - Basic formatting: bold, italic, links, bullet lists
- Save/close functionality

---

## Frictionless Creation UX

> The goal: Capture a thought in under 2 seconds. No friction, no interruption to flow.

### To-Do Creation

| Requirement | Implementation |
|-------------|----------------|
| **Single input, always visible** | Quick-add input is permanently visible at the top of the to-do list—no button click to reveal it |
| **Keyboard-first** | Type and press `Enter` to create. Cursor stays in input for rapid sequential entry |
| **Minimal required fields** | Only title required. Notes, status, order are auto-handled |
| **Instant feedback** | To-do appears in list immediately (optimistic UI) |
| **Smart defaults** | Status = `pending`, Order = top of list, Notes = empty |
| **No confirmation** | To-do is created on Enter. No "Add" button required (though one can exist as alternative) |
| **Batch entry mode** | After creating a to-do, input clears and remains focused. User can rapid-fire add multiple to-dos |

**Keyboard shortcut (nice-to-have):** Global `n` key focuses the quick-add input when not already in a text field.

### Space Creation

| Requirement | Implementation |
|-------------|----------------|
| **One-click initiation** | Single "+ Add Space" button, always visible in sidebar |
| **Inline or minimal modal** | Prefer inline creation in sidebar. If modal, keep it single-screen with no steps |
| **Smart defaults** | Pre-select a random color and default icon so user can just type name and hit Enter |
| **Name-first** | Only the name field is required to create. Color/icon can use defaults |
| **Enter to create** | Pressing `Enter` in the name field creates the space immediately |
| **Instant appearance** | New space appears in list immediately with optimistic UI |
| **Auto-select** | After creation, new space is automatically selected so user can start adding to-dos right away |

**Flow example:**
1. User clicks "+ Add Space"
2. Inline input appears (or minimal modal opens) with name field focused
3. Default color (e.g., blue) and icon (e.g., 📋) are pre-selected
4. User types "Groceries" → presses Enter
5. Space is created, selected, and to-do list area is ready for input
6. Total time: ~2 seconds

### Empty States That Encourage Creation

- **No spaces yet:** Friendly message + prominent "Create your first space" CTA. Consider auto-focusing the creation input.
- **No to-dos in space:** Friendly message + the quick-add input is already visible and can be auto-focused.
- **Avoid overwhelming onboarding:** No multi-step tutorials. A single subtle hint or placeholder text is enough.

---

## User Flows

### First-time User
1. Land on homepage → See hero + description
2. Click "Sign up" → Create account with email/password
3. Redirected to main app (empty state)
4. Prompted or guided to create first space

### Returning User
1. Land on homepage → Click "Log in"
2. Enter credentials → Redirected to main app
3. See existing spaces and to-dos

### Creating a To-Do
1. Select a space from sidebar/list
2. Quick-add input is already visible and ready
3. Type to-do title → Press `Enter`
4. To-do appears instantly at top of list
5. Input clears, cursor remains—ready for next to-do
6. *(Total time: ~1-2 seconds per to-do)*

### Creating a Space
1. Click "+ Add Space" in sidebar
2. Inline input appears (name field auto-focused, default color/icon pre-selected)
3. Type space name → Press `Enter`
4. Space appears in sidebar, auto-selected
5. Main area shows empty to-do list, quick-add input ready
6. *(Total time: ~2-3 seconds)*

### Adding Notes to a To-Do
1. Click on a to-do item
2. Modal opens with title + Tiptap editor
3. Add notes, links, formatting
4. Close modal (auto-saves or explicit save)

### Completing a To-Do
1. Click checkbox/toggle on a to-do
2. To-do marked complete → Moves to bottom of list
3. Delete button becomes visible
4. Optionally delete, or leave for tracking

### Reordering
1. Drag a to-do or space
2. Drop in new position
3. Order persists immediately (Convex real-time)

---

## UI Structure

```
┌─────────────────────────────────────────────────────┐
│  Header: Logo / App Name          [User] [Logout]   │
├─────────────────┬───────────────────────────────────┤
│                 │                                   │
│   Spaces List   │         To-Do List                │
│   (sidebar)     │                                   │
│                 │   [ + Add to-do input ]           │
│   • Space 1     │                                   │
│   • Space 2     │   ☐ To-do item 1                  │
│   • Space 3     │   ☐ To-do item 2                  │
│                 │   ☐ To-do item 3                  │
│   [+ Add Space] │   ─────────────────               │
│                 │   ☑ Completed item (muted)        │
│                 │                                   │
└─────────────────┴───────────────────────────────────┘
```

**Responsive behavior:**
- On mobile, spaces list becomes a dropdown or collapsible menu
- To-do list takes full width
- Modal remains centered overlay

---

## Component Breakdown

### Layout
- `LandingPage` — Public homepage
- `AuthPage` — Login/Signup forms
- `AppLayout` — Authenticated shell (header + sidebar + main)

### Spaces
- `SpaceList` — Renders all spaces, handles drag-drop
- `SpaceItem` — Single space with color/icon, edit/delete actions
- `SpaceForm` — Create/edit space modal

### To-Dos
- `TodoList` — Renders to-dos for selected space, handles drag-drop
- `TodoItem` — Single to-do with checkbox, title, drag handle
- `TodoQuickAdd` — Inline input for fast to-do creation
- `TodoDetailModal` — Full detail view with Tiptap editor

### Shared
- `Modal` — Reusable modal wrapper (shadcn/ui Dialog)
- `ConfirmDialog` — Delete confirmations
- `ColorPicker` — For space customization
- `IconPicker` — For space customization

---

## Convex Schema

```typescript
// convex/schema.ts

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
```

---

## Convex Functions (Overview)

### Spaces
- `spaces.list` — Get all spaces for current user, ordered
- `spaces.create` — Create new space
- `spaces.update` — Update space details
- `spaces.delete` — Delete space and all its to-dos
- `spaces.reorder` — Update order values after drag-drop

### To-Dos
- `todos.list` — Get all to-dos for a space, ordered (pending first, then complete)
- `todos.create` — Create new to-do
- `todos.update` — Update title, notes, or status
- `todos.delete` — Delete a to-do
- `todos.reorder` — Update order values after drag-drop
- `todos.toggleStatus` — Toggle between pending/complete, update order

---

## Out of Scope (For Now)

- Dark mode
- Due dates / reminders
- Priority levels
- Tags / labels
- Password reset
- Email verification
- Multiple users / sharing
- Search functionality
- Archiving spaces
- Undo/redo

---

## Success Criteria

1. User can sign up, log in, and log out
2. User can create, edit, delete, and reorder spaces
3. User can create, edit, delete, and reorder to-dos within a space
4. User can add rich-text notes to a to-do
5. Completed to-dos move to the bottom automatically
6. **Creating a to-do takes ≤2 seconds (type + Enter, done)**
7. **Creating a space takes ≤3 seconds (click, type, Enter, done)**
8. All interactions feel fast (< 100ms perceived latency)
9. App is fully responsive (mobile-friendly)
10. Deployed and accessible via Vercel

---

## Development Phases

### Phase 1: Setup (Day 1)
- [x] Initialize React app (Vite)
- [x] Configure Tailwind + shadcn/ui
- [x] Set up Convex project
- [x] Configure Convex Auth
- [x] Deploy to Vercel (empty shell)

### Phase 2: Auth + Landing (Day 1-2)
- [x] Build landing page
- [x] Implement signup/login forms
- [x] Set up protected routes
- [x] Basic app layout shell

### Phase 3: Spaces (Day 2-3)
- [x] Convex schema + functions for spaces
- [x] Space list UI
- [x] Create/edit space (inline with color + icon picker)
- [x] Delete space with confirmation
- [x] Drag-and-drop reordering

### Phase 4: To-Dos (Day 3-4)
- [ ] Convex schema + functions for to-dos
- [ ] To-do list UI
- [ ] Quick-add input
- [ ] Status toggle + auto-sort
- [ ] Delete (when complete)
- [ ] Drag-and-drop reordering

### Phase 5: To-Do Details (Day 4-5)
- [ ] Detail modal
- [ ] Tiptap integration
- [ ] Save/auto-save notes

### Phase 6: Polish (Day 5-6)
- [ ] Responsive refinements
- [ ] Loading states
- [ ] Empty states
- [ ] Error handling
- [ ] Final design tweaks

---

## Notes for Development

- **Convex real-time:** Leverage Convex's reactive queries. No need for manual refetching—UI updates automatically.
- **Optimistic UI:** For frictionless creation, show new items immediately before server confirmation. Convex supports optimistic updates—use them for create, reorder, and status toggle operations.
- **dnd-kit:** Use `@dnd-kit/core` and `@dnd-kit/sortable` for drag-drop. It's more flexible than react-beautiful-dnd (which is deprecated).
- **Tiptap:** Start with a minimal config (StarterKit + Link extension). Don't over-engineer the editor.
- **shadcn/ui:** Install only components you need. Don't import the whole library.
- **Design:** Pick one or two accent colors. Use plenty of whitespace. Avoid gradients.
- **Input UX:** Use `autoFocus` strategically. The quick-add input should grab focus when a space is selected. After creating a to-do, keep focus in the input.

---

*Last updated: January 2025*
