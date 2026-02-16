-- =====================================================
-- BULLETPROOF FIX: Signup trigger that NEVER fails auth
-- =====================================================

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer 
set search_path = public
as $$
begin
  -- Опитваме вмъкване (safe insert)
  begin
    insert into public.profiles (id, email, full_name, role)
    values (
      new.id,
      new.email,
      -- Ако няма мета данни, ползваме част от имейла
      coalesce(
        new.raw_user_meta_data->>'full_name', 
        split_part(new.email, '@', 1)
      ),
      'user'::public.user_role
    );
  exception when others then
    -- ВАЖНО: При грешка само логваме, но НЕ спираме създаването на auth user!
    raise warning 'Profile creation failed for user %: %', new.id, SQLERRM;
  end;

  return new;
end;
$$;
