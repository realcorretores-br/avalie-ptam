-- Add role column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Update existing profiles to have 'user' role if null
UPDATE public.profiles SET role = 'user' WHERE role IS NULL;
