-- Add site_favicon to system_settings
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS site_favicon text;
