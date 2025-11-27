-- Enable RLS on admin_logs
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert logs
DROP POLICY IF EXISTS "Admins can insert logs" ON "admin_logs";
CREATE POLICY "Admins can insert logs" ON "admin_logs"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to view logs
DROP POLICY IF EXISTS "Admins can view logs" ON "admin_logs";
CREATE POLICY "Admins can view logs" ON "admin_logs"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
