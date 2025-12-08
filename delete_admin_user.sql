-- Delete the broken admin user so you can register it again via the UI
DELETE FROM auth.users WHERE email = 'admin@admin.com';
DELETE FROM public.profiles WHERE email = 'admin@admin.com';
