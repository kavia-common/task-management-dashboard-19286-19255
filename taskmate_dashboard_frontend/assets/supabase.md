# Supabase Integration Guide (Frontend)

This React app connects to Supabase using environment variables:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

These must be set by the orchestrator in the `.env` of the frontend container. Do not commit secrets.

## Table schema expected

The app works with the table `public.tasks` with the schema:

- id: UUID (default gen_random_uuid())
- title: text
- description: text (nullable)
- status: text enum-like values: 'todo' | 'in_progress' | 'completed'
- created_at: timestamp or timestamptz (default now())

Note: A previous migration note referenced a due_date column. The current app does not require `due_date`. If present, it's ignored.

## Where Supabase is initialized

- `src/supabaseClient.js` reads env vars and exports a `supabase` client instance.
- Helper functions `fetchTasks`, `createTask`, `updateTask`, `deleteTask` are provided.
- UI components call these functions (via App state handlers).

## Environment variables (.env.example)

REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_KEY=your_supabase_anon_key

## RLS and policies

If Row Level Security is enabled on `public.tasks`, ensure your anon key and policies allow:
- select: read all rows for display
- insert: create new tasks
- update: edit tasks
- delete: remove tasks

## Local development

- Install dependencies: npm install
- Start dev server: npm start
- Build: npm run build

If you change table names or columns, update `src/supabaseClient.js` accordingly.

