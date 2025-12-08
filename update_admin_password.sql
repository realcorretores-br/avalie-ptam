-- Update admin password to 'Admin@123'
UPDATE auth.users
SET encrypted_password = crypt('Admin@123', gen_salt('bf')),
    updated_at = now()
WHERE email = 'admin@admin.com';

-- Ensure the user is confirmed
UPDATE auth.users
SET email_confirmed_at = now()
WHERE email = 'admin@admin.com' AND email_confirmed_at IS NULL;

-- Ensure profile has admin role
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@admin.com';
