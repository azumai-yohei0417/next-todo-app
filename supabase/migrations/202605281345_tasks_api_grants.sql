-- Ensure `public.tasks` remains accessible via Data API (supabase-js/PostgREST)
-- after Supabase schema exposure default changes.

-- 1) Allow API roles to use the public schema.
grant usage on schema public to anon, authenticated;

-- 2) Explicitly grant table privileges required by this app's CRUD.
grant select, insert, update, delete on table public.tasks to anon, authenticated;

-- 3) RLS: keep behavior explicit and compatible with client-side anon key usage.
alter table public.tasks enable row level security;

drop policy if exists "anon_select_tasks" on public.tasks;
create policy "anon_select_tasks"
  on public.tasks
  for select
  to anon
  using (true);

drop policy if exists "anon_insert_tasks" on public.tasks;
create policy "anon_insert_tasks"
  on public.tasks
  for insert
  to anon
  with check (true);

drop policy if exists "anon_update_tasks" on public.tasks;
create policy "anon_update_tasks"
  on public.tasks
  for update
  to anon
  using (true)
  with check (true);

drop policy if exists "anon_delete_tasks" on public.tasks;
create policy "anon_delete_tasks"
  on public.tasks
  for delete
  to anon
  using (true);

-- If your app also relies on authenticated users, mirror policies as needed.
