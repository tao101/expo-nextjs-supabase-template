create type public.app_role as enum ('admin','creator', 'user');

create table public.user_roles (
  id        bigint generated by default as identity primary key,
  user_id   uuid references auth.users on delete cascade not null unique,
  role      app_role not null default 'user',
  is_first_login boolean not null default true,
  unique (user_id, role),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.user_roles is 'Application roles for each user.';


create extension if not exists moddatetime schema extensions;
create trigger handle_updated_at before update on public.user_roles
  for each row execute procedure moddatetime('updated_at');


alter table public.user_roles enable row level security;


create policy "Users can view own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);




-- Enable realtime for user_roles table
alter publication supabase_realtime add table public.user_roles;

-- Create function to set default role for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call function on user insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Create a new storage bucket for user avatars with better defaults
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'user_avatars',
  'user_avatars',
  false,
  26214400, -- 25MB limit
  array['image/jpeg', 'image/png', 'image/webp']
);




-- Enable RLS
alter table storage.objects enable row level security;

-- Create policy to allow users to view their own avatar
create policy "Users can view their own avatar" on storage.objects for select
using (
  bucket_id = 'user_avatars' 
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to upload their own avatar
create policy "Users can upload their own avatar" on storage.objects for insert
with check (
  bucket_id = 'user_avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to update their own avatar
create policy "Users can update their own avatar" on storage.objects for update
using (
  bucket_id = 'user_avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Create policy to allow users to delete their own avatar
create policy "Users can delete their own avatar" on storage.objects for delete
using (
  bucket_id = 'user_avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Improve the delete_old_avatar function with better error handling
create or replace function delete_old_avatar()
returns trigger as $$
declare
  old_avatar_path text;
begin
  -- Validate input
  if NEW.bucket_id != 'user_avatars' then
    return NEW;
  end if;

  -- Find the old avatar for this user
  select name into old_avatar_path 
  from storage.objects
  where bucket_id = 'user_avatars'
  and (storage.foldername(name))[1] = (storage.foldername(NEW.name))[1]  -- Match the folder
  and name != NEW.name  -- Don't delete the new file
  and created_at < NEW.created_at;  -- Only delete older files

  -- If found, delete it
  if old_avatar_path is not null then
    delete from storage.objects 
    where name = old_avatar_path;
  end if;

  return NEW;
exception
  when others then
    -- Log error but don't block the upload
    raise warning 'Error in delete_old_avatar: %', SQLERRM;
    return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists on_avatar_upload on storage.objects;


-- Create trigger to run function on avatar upload
create trigger on_avatar_upload
  after insert or update on storage.objects
  for each row
  when (NEW.bucket_id = 'user_avatars')
  execute function delete_old_avatar();



-- Improve the delete_user_avatars function with better error handling
create or replace function delete_user_avatars()
returns trigger as $$
declare
  deleted_count int;
begin
  -- Delete all files in the user's folder
  with deleted as (
    delete from storage.objects 
    where bucket_id = 'user_avatars'
    and (storage.foldername(name))[1] = OLD.id::text
    returning *
  )
  select count(*) into deleted_count from deleted;

  -- Log the number of files deleted
  raise notice 'Deleted % avatar files for user %', deleted_count, OLD.id;
  
  return OLD;
exception
  when others then
    -- Log error but don't block the user deletion
    raise warning 'Error in delete_user_avatars: %', SQLERRM;
    return OLD;
end;
$$ language plpgsql security definer;

-- Create trigger to run function when user is deleted
create trigger on_user_delete
  after delete on auth.users
  for each row
  execute function delete_user_avatars();

  

-- Create function to refresh user claims when role changes
create or replace function public.handle_role_change()
returns trigger as $$
begin
  -- Update user metadata
  update auth.users
  set raw_user_meta_data = 
    raw_user_meta_data || 
    jsonb_build_object('user_role', NEW.role::text),
    -- Set a very short refresh time to force token refresh
    -- This will make the current token expire almost immediately
    -- causing the client to automatically request a new one
    updated_at = now()
  where id = NEW.user_id;

  -- Update all existing refresh tokens to require a refresh
  update auth.refresh_tokens
  set updated_at = now(),
      created_at = now() - interval '1 year'
  where user_id = NEW.user_id::text;  -- Cast UUID to text

  return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to refresh claims when role changes
create trigger on_role_change
  after insert or update of role, is_first_login on public.user_roles
  for each row
  execute function public.handle_role_change();

-- Add policy for admin to update user_roles
create policy "Allow auth admin to update user roles"
on public.user_roles 
for update to supabase_auth_admin
using (true)
with check (true);

-- Grant update permission to supabase_auth_admin
grant update on public.user_roles to supabase_auth_admin;

-- Grant ALL permissions on user_roles to supabase_auth_admin
grant all
  on table public.user_roles
to supabase_auth_admin;

-- Revoke permissions from other roles to be explicit
revoke all
  on table public.user_roles
  from authenticated, anon, public;

-- Add explicit select policy for auth admin
create policy "Allow auth admin to read user roles" ON public.user_roles
as permissive for select
to supabase_auth_admin
using (true);

-- Create function to check and update is_first_login based on metadata
create or replace function public.check_profile_completion()
returns trigger as $$
declare
  bio text;
  avatar_url text;
begin
  -- Extract bio and avatar_url from metadata
  bio := NEW.raw_user_meta_data->>'bio';
  avatar_url := NEW.raw_user_meta_data->>'avatar_url';

  -- Check if both bio and avatar meet the length requirements
  if bio is not null 
    and length(bio) > 3 
    and avatar_url is not null 
    and length(avatar_url) > 3 
  then
    -- Update is_first_login to false in user_roles
    update public.user_roles
    set is_first_login = false
    where user_id = NEW.id
    and is_first_login = true; -- Only update if it's currently true
  end if;

  return NEW;
exception
  when others then
    -- Log error but don't block the metadata update
    raise warning 'Error in check_profile_completion: %', SQLERRM;
    return NEW;
end;
$$ language plpgsql security definer;

-- Create trigger to run function when user metadata is updated
create trigger on_profile_update
  after update of raw_user_meta_data on auth.users
  for each row
  execute function public.check_profile_completion();

-- Grant necessary permissions
grant update on public.user_roles to postgres;
grant update on public.user_roles to supabase_auth_admin;