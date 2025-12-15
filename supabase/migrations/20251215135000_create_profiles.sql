-- Create profiles table to store secure user details
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role text not null default 'user' check (role in ('user','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists profiles_email_idx on public.profiles (email);

-- Trigger: auto-set updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Seed profile on new auth user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Enable RLS and add policies: users may access only their own profile
alter table public.profiles enable row level security;

create policy if not exists "profiles_select_own" on public.profiles
for select using (auth.uid() = id);

create policy if not exists "profiles_update_own" on public.profiles
for update using (auth.uid() = id);

create policy if not exists "profiles_insert_own" on public.profiles
for insert with check (auth.uid() = id);