-- Family Compound accounts on Supabase Auth.
-- Apply in the SQL editor, or with the Supabase CLI, on the family-compound-accounts project.
-- The Expo app uses the project URL and publishable key only. Do not put a secret or service-role key in the app.
--
-- Hosted projects require email confirmation by default, and the built-in mailer only delivers to
-- organization members. This migration marks a new email confirmed at insert time so sign-up can
-- continue with signInWithPassword without that mailer. In the dashboard, also turn off
-- Authentication → Providers → Email → Confirm email so Auth does not try to send a message.

create table if not exists public.favorites (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  id text not null,
  kind text not null,
  title text not null,
  subtitle text,
  url text,
  youtube_id text,
  saved_at timestamptz not null default now(),
  primary key (user_id, id),
  constraint favorites_kind_check check (kind in ('news', 'video', 'learn')),
  constraint favorites_id_check check (char_length(id) between 1 and 180),
  constraint favorites_title_check check (char_length(title) between 1 and 200),
  constraint favorites_subtitle_check check (subtitle is null or char_length(subtitle) between 1 and 200),
  constraint favorites_url_check check (
    url is null or (char_length(url) <= 2000 and url ~* '^https?://')
  ),
  constraint favorites_youtube_check check (
    youtube_id is null or youtube_id ~ '^[\w-]{6,20}$'
  ),
  constraint favorites_kind_fields_check check (
    (kind = 'news' and url is not null)
    or (kind = 'video' and youtube_id is not null)
    or kind = 'learn'
  )
);

create index if not exists favorites_user_saved_at_idx
  on public.favorites (user_id, saved_at desc);

alter table public.favorites enable row level security;
alter table public.favorites force row level security;

-- Default privileges grant ALL (including TRUNCATE) to authenticated. TRUNCATE ignores RLS,
-- so revoke everything and grant only row operations.
revoke all on table public.favorites from public;
revoke all on table public.favorites from anon;
revoke all on table public.favorites from authenticated;
grant select, insert, update, delete on table public.favorites to authenticated;
grant select, insert, update, delete on table public.favorites to service_role;

drop policy if exists "Users can read their own favorites" on public.favorites;
create policy "Users can read their own favorites"
  on public.favorites
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own favorites" on public.favorites;
create policy "Users can insert their own favorites"
  on public.favorites
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own favorites" on public.favorites;
create policy "Users can update their own favorites"
  on public.favorites
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own favorites" on public.favorites;
create policy "Users can delete their own favorites"
  on public.favorites
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- The signed-in user can delete only their own Auth user. Favorites cascade.
-- There is no service-role key in the app. Call this with supabase.rpc('delete_own_account').
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in again.';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
revoke all on function public.delete_own_account() from anon;
grant execute on function public.delete_own_account() to authenticated;

create or replace function public.confirm_email_on_signup()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.email is not null and new.email_confirmed_at is null then
    new.email_confirmed_at = now();
  end if;
  return new;
end;
$$;

revoke all on function public.confirm_email_on_signup() from public;
revoke all on function public.confirm_email_on_signup() from anon, authenticated;

drop trigger if exists confirm_email_on_signup on auth.users;
create trigger confirm_email_on_signup
  before insert on auth.users
  for each row
  execute function public.confirm_email_on_signup();
