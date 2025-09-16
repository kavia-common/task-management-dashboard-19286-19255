# Supabase Integration Guide

This project connects to a Supabase (PostgreSQL) database from the frontend using environment variables:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

These must be provided in the .env file for the frontend container (do not commit secrets). Ask the orchestrator to set these.

## Fix: Missing 'due_date' column in 'tasks' table

Error observed:
"Failed to create task: Could not find the 'due_date' column of 'tasks' in the schema cache"

Root cause:
The 'tasks' table is missing the 'due_date' column, or the column was added but schema cache wasn't refreshed.

### Resolution Steps

1) Apply the SQL migration to add the column if it does not exist.

Run the following SQL in the Supabase SQL Editor (or psql) against your project's database:

------------------------------------------------------------
-- Migration: Add 'due_date' column to 'tasks' table
-- This is safe to run multiple times.
------------------------------------------------------------
DO $$
BEGIN
  -- Ensure the table exists (optional guard, remove if you are certain)
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'tasks'
  ) THEN
    -- Add the column if missing
    IF NOT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'tasks'
        AND column_name = 'due_date'
    ) THEN
      ALTER TABLE public.tasks
      ADD COLUMN due_date timestamp with time zone NULL;
      -- Optionally, you can set a default or backfill values here if needed.
      -- Example default to NULL intentionally so field is optional.
    END IF;
  ELSE
    RAISE NOTICE 'Table public.tasks does not exist. Create it before adding due_date.';
  END IF;
END$$;

-- Optional: add an index if queries frequently filter/sort by due_date
-- CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks (due_date);
------------------------------------------------------------

2) Refresh schema cache (usually automatic).
Supabase typically refreshes schema automatically. If you still see cache related errors, try:
- Disconnect and reconnect the client (restart the dev server)
- Clear local app cache if applicable
- In SQL: call pg_notify('realtime', 'reload'); (admin permission required)
- Or simply wait a minute for cache to refresh

3) Frontend expectations
The UI may send `due_date` as:
- a string in ISO 8601 format (e.g., "2025-09-16T12:00:00Z") OR
- null/undefined for no due date.

Ensure the column type is TIMESTAMPTZ to correctly store timezone-aware timestamps.

### Environment Variables (.env.example)

Create a `.env` file at the frontend root with:

REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_KEY=your_supabase_anon_key

Do not commit `.env`. Ask the orchestrator to set these in the environment.

### Notes

- Do not hardcode Supabase credentials in code.
- If your app writes `due_date` as date-only, consider storing as TIMESTAMPTZ with midnight UTC or change the column to `date` type and align the frontend accordingly.
- If RLS is enabled and policies reference `due_date`, ensure policies still work after adding the column.

