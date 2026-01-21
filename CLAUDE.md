# Matty Doo - Claude Code Context

## Project Overview

**Matty Doo** is a minimal, responsive personal to-do app. It prioritizes simplicity and speed over feature bloat—just spaces, to-dos, and the ability to add notes when needed.

**Target user:** Single user (personal use)

**Design principles:**
- Keep it lightweight — resist feature creep
- Frictionless creation — adding a to-do should take <2 seconds
- Fast interactions — drag-drop, toggles, edits feel instant
- Clean & minimal aesthetic — Linear/Notion inspired, not generic AI look

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18+ with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend/Database | Convex |
| Authentication | Convex Auth (email/password) |
| Rich Text Editor | Tiptap |
| Drag & Drop | dnd-kit |
| Routing | React Router |
| Hosting | Vercel |

---

## Project Structure

```
src/
├── main.tsx                 # Entry point, providers
├── App.tsx                  # Router setup
├── index.css                # Tailwind imports + globals
│
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── layout/
│   │   ├── AppLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── spaces/
│   │   ├── SpaceList.tsx
│   │   ├── SpaceItem.tsx
│   │   ├── SpaceCreateInline.tsx
│   │   ├── ColorPicker.tsx
│   │   └── EmojiPicker.tsx
│   ├── todos/
│   │   ├── TodoList.tsx
│   │   ├── TodoItem.tsx
│   │   ├── TodoQuickAdd.tsx
│   │   └── TodoDetailModal.tsx
│   └── auth/
│       └── AuthForm.tsx
│
├── pages/
│   ├── LandingPage.tsx
│   ├── AuthPage.tsx
│   └── AppPage.tsx
│
├── hooks/
│   ├── useSpaces.ts
│   ├── useTodos.ts
│   └── useAuth.ts
│
├── lib/
│   ├── utils.ts             # cn() helper, etc.
│   └── constants.ts         # Colors, default emojis
│
convex/
├── schema.ts                # Database schema
├── auth.ts                  # Auth configuration
├── spaces.ts                # Space queries/mutations
├── todos.ts                 # Todo queries/mutations
└── _generated/              # Auto-generated types
```

---

## Data Models

### Space
| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Convex document ID |
| `userId` | string | Owner of the space |
| `name` | string | Space name |
| `color` | string | Hex color for visual identification |
| `icon` | string | Emoji icon |
| `order` | number | Position in the spaces list |
| `createdAt` | number | Timestamp |

### To-Do
| Field | Type | Description |
|-------|------|-------------|
| `_id` | Id | Convex document ID |
| `spaceId` | Id | Reference to parent space |
| `userId` | string | Owner of the to-do |
| `title` | string | To-do title |
| `notes` | string? | Rich text content (Tiptap HTML) |
| `status` | "pending" \| "complete" | Current status |
| `order` | number | Position in the to-do list |
| `createdAt` | number | Timestamp |
| `completedAt` | number? | When marked complete |

---

## Convex Functions

### Spaces
- `spaces.list` — Get all spaces for current user, ordered
- `spaces.create` — Create new space with defaults
- `spaces.update` — Update space details
- `spaces.delete` — Delete space and all its to-dos
- `spaces.reorder` — Update order values after drag-drop

### To-Dos
- `todos.list` — Get all to-dos for a space (pending first, then complete)
- `todos.create` — Create new to-do at top of list
- `todos.update` — Update title, notes, or status
- `todos.delete` — Delete a to-do
- `todos.reorder` — Update order values after drag-drop
- `todos.toggleStatus` — Toggle pending/complete, auto-reorder

---

## Routes

| Path | Component | Auth Required |
|------|-----------|---------------|
| `/` | LandingPage | No |
| `/login` | AuthPage | No |
| `/signup` | AuthPage | No |
| `/app` | AppPage | Yes |

---

## Development Commands

```bash
# Start development server (runs both Vite and Convex)
npm run dev

# Run Vite only
npm run dev:frontend

# Run Convex only
npx convex dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

---

## Environment Variables

```bash
# .env.local
CONVEX_DEPLOYMENT=       # Convex deployment URL (set by `npx convex dev`)
VITE_CONVEX_URL=         # Convex URL for client
```

---

## Coding Conventions

### TypeScript
- Strict mode enabled
- Explicit return types for functions
- Use interfaces for component props

### React
- Functional components with hooks
- Co-locate component styles (Tailwind classes)
- Extract reusable logic into custom hooks

### Styling
- Tailwind CSS for all styling
- Use `cn()` utility for conditional classes
- Follow shadcn/ui patterns for components
- Predefined color palette for spaces (see `lib/constants.ts`)

### Convex
- Queries for read operations
- Mutations for write operations
- Use optimistic updates for instant UI feedback
- All functions validate user authentication

---

## Key UX Requirements

### Frictionless To-Do Creation
- Quick-add input always visible at top of list
- Type + Enter = create immediately
- Optimistic UI (appears before server confirms)
- Input stays focused for rapid entry
- Target: <2 seconds from thought to visible todo

### Space Creation
- Click "+ Add Space" → inline input appears
- Random color + default emoji pre-selected
- Enter to create, Escape to cancel
- New space auto-selected after creation

### Responsive Design
- Desktop: sidebar + main content
- Mobile (<768px): dropdown selector for spaces, full-width todos
- Touch-friendly tap targets (44px minimum)

---

## Out of Scope (MVP)

- Dark mode
- Due dates / reminders
- Priority levels
- Tags / labels
- Password reset
- Email verification
- Multiple users / sharing
- Search functionality
- Undo/redo

---

## Resources

- [Convex Docs](https://docs.convex.dev/)
- [Convex Auth](https://labs.convex.dev/auth)
- [shadcn/ui](https://ui.shadcn.com/)
- [dnd-kit](https://dndkit.com/)
- [Tiptap](https://tiptap.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
