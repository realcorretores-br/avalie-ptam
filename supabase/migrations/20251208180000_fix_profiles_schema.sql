-- Ensure update_updated_at_column function exists (Fix for "Function does not exist" or search path issues)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add missing columns if they don't exist (Fix for 400 Bad Request on update)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'theme_color') THEN
        ALTER TABLE public.profiles ADD COLUMN theme_color text DEFAULT 'blue';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'logo_url') THEN
        ALTER TABLE public.profiles ADD COLUMN logo_url text;
    END IF;
END $$;

-- Verify permissions for public
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO public;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;
