-- Create storage bucket for temporary evaluation images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avaliacoes-temp', 'avaliacoes-temp', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own images
CREATE POLICY "Users can upload their own temporary images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avaliacoes-temp' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view temporary images
CREATE POLICY "Temporary images are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avaliacoes-temp');

-- Allow users to delete their own temporary images
CREATE POLICY "Users can delete their own temporary images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avaliacoes-temp' AND
  auth.uid()::text = (storage.foldername(name))[1]
);