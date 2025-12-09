-- Create a robust v2 function to ensure availability
CREATE OR REPLACE FUNCTION public.update_updated_at_column_v2()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Verify permissions
GRANT EXECUTE ON FUNCTION public.update_updated_at_column_v2() TO public;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column_v2() TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column_v2() TO service_role;

-- Drop existings trigger to avoid conflicts or doubling
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;

-- Create new trigger using v2 function
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column_v2();

-- Ensure columns exist (Redundant check but safe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'theme_color') THEN
        ALTER TABLE public.profiles ADD COLUMN theme_color text DEFAULT 'blue';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'logo_url') THEN
        ALTER TABLE public.profiles ADD COLUMN logo_url text;
    END IF;
END $$;
