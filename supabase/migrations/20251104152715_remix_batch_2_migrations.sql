
-- Migration: 20251028100914
-- Create storage bucket for PTAM images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ptam-images',
  'ptam-images',
  true,
  1048576,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
);

-- Create RLS policies for the storage bucket
CREATE POLICY "Anyone can view PTAM images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ptam-images');

CREATE POLICY "Authenticated users can upload PTAM images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'ptam-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own PTAM images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'ptam-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own PTAM images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'ptam-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Create PTAM reports table
CREATE TABLE public.ptam_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  form_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.ptam_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for ptam_reports
CREATE POLICY "Users can view their own reports"
ON public.ptam_reports FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
ON public.ptam_reports FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
ON public.ptam_reports FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
ON public.ptam_reports FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ptam_reports_updated_at
BEFORE UPDATE ON public.ptam_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migration: 20251028100935
-- Fix the update_updated_at_column function to have a stable search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

-- Recreate the trigger
CREATE TRIGGER update_ptam_reports_updated_at
BEFORE UPDATE ON public.ptam_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
