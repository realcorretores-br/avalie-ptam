<<<<<<< HEAD
-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id integer PRIMARY KEY DEFAULT 1,
    enable_profile boolean DEFAULT true,
    enable_subscription boolean DEFAULT true,
    enable_payment_history boolean DEFAULT true,
    enable_notes boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row if not exists
INSERT INTO public.system_settings (id, enable_profile, enable_subscription, enable_payment_history, enable_notes)
VALUES (1, true, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON public.system_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admin update access" ON public.system_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Grant access
GRANT SELECT ON public.system_settings TO anon, authenticated;
GRANT UPDATE ON public.system_settings TO authenticated;
=======
-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id integer PRIMARY KEY DEFAULT 1,
    enable_profile boolean DEFAULT true,
    enable_subscription boolean DEFAULT true,
    enable_payment_history boolean DEFAULT true,
    enable_notes boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row if not exists
INSERT INTO public.system_settings (id, enable_profile, enable_subscription, enable_payment_history, enable_notes)
VALUES (1, true, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" ON public.system_settings
    FOR SELECT USING (true);

CREATE POLICY "Allow admin update access" ON public.system_settings
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Grant access
GRANT SELECT ON public.system_settings TO anon, authenticated;
GRANT UPDATE ON public.system_settings TO authenticated;
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
