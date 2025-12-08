-- Run this AFTER you have registered 'admin@admin.com' via the website
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@admin.com';

-- Also ensure user metadata has the role (optional but good for consistency)
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{role}', '"admin"')
WHERE email = 'admin@admin.com';
