-- Create the auth hook function
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
volatile
as $$
  declare
    claims jsonb;
    user_role public.app_role;
    is_first_login boolean;
    input_user_id uuid;
  begin
    input_user_id := (event->>'user_id')::uuid;
    
    -- Fetch both role and first_login status
    select ur.role, ur.is_first_login into user_role, is_first_login
    from public.user_roles ur 
    where ur.user_id = input_user_id;

    claims := event->'claims';

    if user_role is not null then
      -- Set both role and first_login claims
      claims := jsonb_set(
        jsonb_set(claims, '{user_role}', to_jsonb(user_role)),
        '{is_first_login}', to_jsonb(is_first_login)
      );
      
      -- Update user metadata with both values
      update auth.users au
      set raw_user_meta_data = 
        au.raw_user_meta_data || 
        jsonb_build_object(
          'user_role', user_role::text,
          'is_first_login', is_first_login
        )
      where au.id = input_user_id;
    else
      claims := jsonb_set(
        jsonb_set(claims, '{user_role}', '"user"'::jsonb),
        '{is_first_login}', 'true'::jsonb
      );
      
      -- Set default values in metadata
      update auth.users au
      set raw_user_meta_data = 
        au.raw_user_meta_data || 
        jsonb_build_object(
          'user_role', 'user',
          'is_first_login', true
        )
      where au.id = input_user_id;
    end if;

    -- Return the modified event with latest claims
    return jsonb_set(event, '{claims}', claims);
  end;
$$;

-- Ensure the hook has necessary permissions
grant execute on function public.custom_access_token_hook to supabase_auth_admin;

grant usage on schema public to supabase_auth_admin;

revoke execute
  on function public.custom_access_token_hook
  from authenticated, anon, public;

grant all
  on table public.user_roles
to supabase_auth_admin;

revoke all
  on table public.user_roles
  from authenticated, anon, public;

-- Update the handle_role_change function to handle is_first_login changes
create or replace function public.handle_role_change()
returns trigger as $$
begin
  -- Update user metadata with both role and is_first_login
  update auth.users
  set raw_user_meta_data = 
    raw_user_meta_data || 
    jsonb_build_object(
      'user_role', NEW.role::text,
      'is_first_login', NEW.is_first_login
    ),
    -- Set a very short refresh time to force token refresh
    updated_at = now()
  where id = NEW.user_id;

  -- Update all existing refresh tokens to require a refresh
  update auth.refresh_tokens
  set updated_at = now(),
      created_at = now() - interval '1 year'
  where user_id = NEW.user_id::text;

  return NEW;
end;
$$ language plpgsql security definer;