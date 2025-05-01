-- Migration: Create notes and profiles tables with RLS policies for VibeTravels MVP
-- Generated: 2025-04-30 20:07:07 UTC
-- Purpose: Implements secure, scalable schema for user notes and profiles, including RLS and triggers

-- 1. Create the 'profiles' table for storing additional user information
create table public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 2. Create the 'notes' table for storing user notes and AI suggestions
create table public.notes (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    content varchar(5000) not null check (length(content) <= 5000),
    is_ai_generated boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- 3. Indexes for performance
create index idx_notes_user_id on public.notes (user_id);
create index idx_notes_created_at on public.notes (created_at desc);

-- 4. Function and triggers to update 'updated_at' on row modification
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
   new.updated_at = now();
   return new;
end;
$$ language 'plpgsql';

create trigger handle_updated_at before update on public.notes
  for each row execute procedure public.update_updated_at_column();

create trigger handle_profile_updated_at before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

-- 5. Enable Row Level Security (RLS) on both tables
alter table public.notes enable row level security;
alter table public.profiles enable row level security;

-- 6. RLS Policies for 'notes' table
-- Policy: Allow authenticated users to select their own notes
create policy "select_own_notes_authenticated" on public.notes
  as permissive for select to authenticated
  using (auth.uid() = user_id);
-- Policy: Allow anon users to select their own notes (should never match, but required for completeness)
create policy "select_own_notes_anon" on public.notes
  as permissive for select to anon
  using (false);

-- Policy: Allow authenticated users to insert their own non-AI notes
create policy "insert_own_notes_authenticated" on public.notes
  as permissive for insert to authenticated
  with check (auth.uid() = user_id and is_ai_generated = false);
-- Policy: Deny anon users insert
create policy "insert_own_notes_anon" on public.notes
  as permissive for insert to anon
  with check (false);

-- Policy: Allow authenticated users to update their own non-AI notes
create policy "update_own_notes_authenticated" on public.notes
  as permissive for update to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and is_ai_generated = false);
-- Policy: Deny anon users update
create policy "update_own_notes_anon" on public.notes
  as permissive for update to anon
  using (false)
  with check (false);

-- Policy: Allow authenticated users to delete their own notes (including AI)
create policy "delete_own_notes_authenticated" on public.notes
  as permissive for delete to authenticated
  using (auth.uid() = user_id);
-- Policy: Deny anon users delete
create policy "delete_own_notes_anon" on public.notes
  as permissive for delete to anon
  using (false);

-- 7. RLS Policies for 'profiles' table
-- Policy: Allow authenticated users to select their own profile
create policy "select_own_profile_authenticated" on public.profiles
  as permissive for select to authenticated
  using (auth.uid() = id);
-- Policy: Deny anon users select
create policy "select_own_profile_anon" on public.profiles
  as permissive for select to anon
  using (false);

-- Note: For MVP, insert/update/delete on profiles is managed by Supabase or backend logic, so explicit policies are omitted.
-- If profile editing is required in the future, add granular insert/update/delete policies.
