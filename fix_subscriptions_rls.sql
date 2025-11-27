-- Enable RLS on subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert subscriptions
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON "subscriptions";
CREATE POLICY "Admins can insert subscriptions" ON "subscriptions"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to update subscriptions
DROP POLICY IF EXISTS "Admins can update subscriptions" ON "subscriptions";
CREATE POLICY "Admins can update subscriptions" ON "subscriptions"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow admins to delete subscriptions
DROP POLICY IF EXISTS "Admins can delete subscriptions" ON "subscriptions";
CREATE POLICY "Admins can delete subscriptions" ON "subscriptions"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow users to view their own subscriptions (and admins to view all)
DROP POLICY IF EXISTS "Users can view own subscriptions" ON "subscriptions";
CREATE POLICY "Users can view own subscriptions" ON "subscriptions"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
