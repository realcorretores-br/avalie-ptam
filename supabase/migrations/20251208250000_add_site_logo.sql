<<<<<<< HEAD
-- Add site_logo to system_settings
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS site_logo text;

-- Create storage bucket for site assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read of site-assets (Unique Name)
CREATE POLICY "Public Read site-assets" ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

-- Policy to allow admin insert/update/delete (Unique Name)
CREATE POLICY "Admin Access site-assets" ON storage.objects FOR ALL
USING ( bucket_id = 'site-assets' AND auth.role() = 'authenticated' ) 
WITH CHECK ( bucket_id = 'site-assets' AND auth.role() = 'authenticated' );

=======
-- Add site_logo to system_settings
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS site_logo text;

-- Create storage bucket for site assets if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('site-assets', 'site-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read of site-assets (Unique Name)
CREATE POLICY "Public Read site-assets" ON storage.objects FOR SELECT
USING ( bucket_id = 'site-assets' );

-- Policy to allow admin insert/update/delete (Unique Name)
CREATE POLICY "Admin Access site-assets" ON storage.objects FOR ALL
USING ( bucket_id = 'site-assets' AND auth.role() = 'authenticated' ) 
WITH CHECK ( bucket_id = 'site-assets' AND auth.role() = 'authenticated' );

>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
