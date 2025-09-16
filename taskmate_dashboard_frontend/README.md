# TaskMate Dashboard Frontend

TaskMate is a modern React.js dashboard for managing tasks with Supabase as the backend. It provides CRUD operations, filtering and search, real-time updates (when available), and a metrics dashboard. The UI follows the Ocean Professional theme using TailwindCSS.

## Quickstart

### Prerequisites
- Node.js 18+ and npm
- A Supabase project with a `tasks` table (schema assumptions below)
- Supabase Project URL and anon public API key

### 1. Install dependencies
From the project root of this container:
- cd taskmate_dashboard_frontend
- npm install

### 2. Configure environment variables
Create a .env file in taskmate_dashboard_frontend with the following values:
- REACT_APP_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
- REACT_APP_SUPABASE_KEY=YOUR_SUPABASE_ANON_PUBLIC_KEY

Notes:
- These variables are required by the Supabase client. Without them, data calls will fail and real-time will be disabled. The app logs helpful warnings if they are missing (see src/lib/supabaseClient.js).
- For production, ensure these values are set in your hosting provider’s environment configuration. Keys prefixed with REACT_APP_ are embedded in the client bundle.

### 3. Run locally
- npm start
The app will open at http://localhost:3000.

### 4. Run tests
- CI=true npm test

### 5. Build for production
- npm run build

## Environment Variables

TaskMate reads exactly the following environment variables:

- REACT_APP_SUPABASE_URL: The Supabase project URL, e.g., https://YOUR-PROJECT-REF.supabase.co
- REACT_APP_SUPABASE_KEY: The Supabase anon public key from your project’s API settings

How they are used:
- src/lib/supabaseClient.js creates a singleton Supabase client using these values. It warns if any are missing.
- src/services/tasksService.js uses that client for all database interactions, including real-time subscriptions when available.

## Architecture and Feature Overview

TaskMate is a single-page React application using functional components and hooks. It integrates with Supabase for data storage, querying, and optional real-time notifications.

Core features:
- Task CRUD: Create, read, update, delete tasks stored in the public.tasks table.
- Filters and search: Filter by status and search by case-insensitive title matches.
- Sorting: Order by created_at, updated_at, due_date, title, or status with ascending/descending toggles.
- Dashboard metrics: Display counts by status, due today, and overdue.
- Real-time updates: Subscribe to Postgres changes on tasks (INSERT/UPDATE/DELETE) when environment variables are configured.
- Accessibility: Includes live regions for status and error announcements, keyboard-friendly forms, labeled inputs, and ARIA attributes on interactive elements and dialogs.
- Responsive design: Grid-based layout with a Kanban-style board; stacks on mobile.

High-level file map:
- src/index.js: App bootstrap
- src/App.js: Application shell and composition of header, metrics, filters, board, and form. Handles global theme toggle and live regions for announcements.
- src/hooks/useTasks.js: Encapsulates task state, filters, metrics retrieval, CRUD operations, refresh, and real-time subscription management.
- src/services/tasksService.js: Supabase data layer for tasks and metrics; exposes list, get, create, update, delete, getMetrics, subscribeToTasks, and isRealtimeAvailable.
- src/lib/supabaseClient.js: Creates and exports a singleton Supabase client configured from environment variables.
- src/components/: Presentational components organized by domain (layout, dashboard, tasks), and common utilities.

## Ocean Professional Theme and TailwindCSS

The UI follows the Ocean Professional theme with blue and amber accents, minimalist cards, subtle gradients, and rounded corners.

Where to customize:
- Tailwind configuration: tailwind.config.js extends the theme with semantic colors (primary, secondary, success, error, background, surface, text), a soft shadow set, and an ocean gradient.
- Global styles and utilities: src/index.css defines app-wide layers:
  - @tailwind base, components, utilities
  - Component classes like .card, .btn, .btn-primary, badges
  - Base application background/text
- Component styling: All components use Tailwind utility classes directly. There is no component library dependency.
- Gradient and backgrounds: Container (src/components/layout/Container.jsx) applies bg-background and bg-ocean-gradient for depth.

Theme toggling:
- A simple light/dark toggle exists in App.js via data-theme on <html> to demonstrate theming hooks. Current Tailwind palette is static; extend if you want full dark mode tokens.

## Component Map

This is a brief map to understand how the UI pieces fit together.

- Layout
  - Header (src/components/layout/Header.jsx): App title, palette preview chips, and theme toggle action.
  - Container (src/components/layout/Container.jsx): Page layout wrapper with gradient background and width constraints.
- Dashboard
  - MetricsCards (src/components/dashboard/MetricsCards.jsx): Displays To Do, In Progress, Done, and Overdue counts.
- Tasks
  - TaskFilters (src/components/tasks/TaskFilters.jsx): Search input, status dropdown, sort column and direction, and Add Task action.
  - TaskBoard (src/components/tasks/TaskBoard.jsx): Responsive Kanban grid; renders columns via TaskColumn.
  - TaskColumn (src/components/tasks/TaskColumn.jsx): Column header with count and a vertical list of TaskCard items.
  - TaskCard (src/components/tasks/TaskCard.jsx): Single task item with title, optional description, due date chip, status change select, and Edit/Delete actions.
  - TaskForm (src/components/tasks/TaskForm.jsx): Create/edit form with client-side validation and keyboard escape-to-cancel support.
  - EmptyState (src/components/tasks/EmptyState.jsx): Friendly empty results state with optional action button.
- Common
  - IconButton (src/components/common/IconButton.jsx): Accessible icon button with variants and sizes.
  - Spinner (src/components/common/Spinner.jsx): Accessible loading indicator with ARIA status and screen-reader text.

## Data and Services

Hook and service responsibilities:
- useTasks (src/hooks/useTasks.js): Provides a unified interface to the UI for loading state, error state, filtered tasks, metrics, and CRUD helpers. It exposes an optional refresh() method. It subscribes to real-time events when Supabase env variables are set, and falls back to refresh-based updates otherwise.
- tasksService (src/services/tasksService.js): Defines buildListQuery, listTasks, getTask, createTask, updateTask, deleteTask, and getMetrics. It also implements subscribeToTasks for Postgres real-time changes on the public.tasks table and a simple isRealtimeAvailable check based on environment variables.

## Assumed Supabase Schema for public.tasks

The app expects a tasks table with at least the following columns. Types shown are typical choices; adjust to your needs but keep names consistent for the current implementation.

- id: uuid (or integer/serial). Primary key.
- title: text. Required.
- description: text. Optional, nullable.
- status: text. One of "todo", "inprogress", "done" (application uses these exact strings).
- due_date: date. Optional, nullable; displayed as YYYY-MM-DD.
- created_at: timestamp with time zone. Default now() on insert.
- updated_at: timestamp with time zone. Automatically updated on row change (via trigger) or set by the app if you add code to do so.

Suggested minimal SQL (example):
- create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    status text not null default 'todo',
    due_date date,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
  );
- For updated_at automation, add a trigger or handle in update calls server-side.

Real-time setup:
- Ensure your Supabase project has Realtime enabled for the public schema or specifically for the tasks table. The app subscribes to INSERT, UPDATE, DELETE events.

## Development Guide

Local development:
- Use npm start for local hot reload.
- Ensure .env is set with valid Supabase values for full functionality and real-time updates.
- If you do not configure Supabase, the UI will render but will not load data. Warnings will appear in the console to help diagnose missing configuration.

Code style:
- Tailwind utility classes are used throughout; keep styling co-located in components for speed. You can factor out recurring patterns into small components or @apply into src/index.css component classes.
- ESLint is configured via eslint.config.mjs. React 18 and function components are expected.

Adding features:
- For new data features, create service functions in src/services and surface them via a hook (similar to useTasks) to keep view logic clean.
- Extend MetricsCards if you add metrics. Keep metrics computation server-side when possible and fetch via a dedicated service function.
- For additional filters, modify useTasks and TaskFilters to propagate new query options.

## Testing

- Unit tests can be added using React Testing Library and Jest. A starter test exists at src/App.test.js.
- For CI environments, run tests with: CI=true npm test
- Consider mocking Supabase calls for unit tests. Abstract service calls behind interfaces or jest.mock('../services/tasksService') to simulate API behavior.

## Accessibility Highlights

TaskMate includes several accessibility enhancements:
- Live regions: App.js includes polite and assertive aria-live regions to announce success and error messages (e.g., task updated, network errors).
- Keyboard navigation: TaskForm supports Escape to cancel; focus is programmatically managed to move from Add Task into the form and back on close.
- Labels and roles: Inputs are labeled; dialog semantics are used for the form container; Spinner provides role="status" and screen-reader text.
- Contrast and focus: Buttons and interactive elements include visible focus states via Tailwind focus utilities. Colors are chosen for readability on the light theme.

Recommended next steps:
- Expand dark mode tokens for full accessible contrast in dark theme.
- Add end-to-end a11y checks (e.g., axe-core) and test with keyboard-only navigation and screen readers.

## Troubleshooting

- Missing data or errors:
  - Verify REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY are set correctly in .env.
  - Ensure your Supabase table is named tasks in the public schema and that Row Level Security (RLS) policies allow the operations you need for anon users (or authenticate accordingly).
  - Confirm Realtime is enabled if you expect live updates. Otherwise, use the Refresh button in the Dashboard section.

- Styling not applied:
  - Ensure Tailwind is processing your files. tailwind.config.js content paths include ./public/index.html and ./src/**/*.{js,jsx,ts,tsx}. If you add files elsewhere, update the config.

## Scripts

- npm start: Start development server at http://localhost:3000
- npm test: Run tests in watch mode (use CI=true in CI)
- npm run build: Build production bundle
- npm run eject: Eject Create React App configuration (irreversible)

## License

This project is intended as a demo/boilerplate within the Kavia environment. Adapt and extend as needed for your use case.
