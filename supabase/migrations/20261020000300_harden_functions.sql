-- Security advisor fixes: pin search_path and limit who can call helper functions.
alter function public.touch_updated_at() set search_path = public;
alter function public.guard_profile_update() set search_path = public;
alter function public.generate_invite_code() set search_path = public;

-- Trigger-only function: nobody should call it over the API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Used by RLS policies for signed-in users only.
revoke execute on function public.is_session_member(uuid) from public, anon;
revoke execute on function public.shares_session_with(uuid) from public, anon;
grant execute on function public.is_session_member(uuid) to authenticated;
grant execute on function public.shares_session_with(uuid) to authenticated;
