-- Bootstrap the first club admin.
-- Run after creating the user in Supabase Auth (or update the id to match the auth.users row).
-- Replace the id with the actual UUID from auth.users for bri.hoang@gmail.com.

insert into public.seasons (state) values ('registration_open');

-- Example: update role for the first admin after they register via the UI
-- update public.profiles set role = 'club_admin' where email = 'bri.hoang@gmail.com';
