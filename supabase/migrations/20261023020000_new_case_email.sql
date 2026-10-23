-- Where to send "a new case is available" emails. Null means the sign-in email.
-- Whether to send them at all is the existing notify_new_assignments (default yes).
alter table public.user_settings add column if not exists new_case_email text
  check (new_case_email is null or (char_length(new_case_email) <= 254 and new_case_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'));
notify pgrst, 'reload schema';
