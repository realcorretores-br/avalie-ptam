-- 1. Add role column to profiles if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- 2. Promote user to admin (Using ID found in logs)
UPDATE profiles SET role = 'admin' WHERE id = '5b86ad38-728e-4824-9491-24ad0a837374';

-- 3. Create a secure function to get the user's role (Bypasses RLS issues)
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;

-- 4. Clean up old policies
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "plans";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON "plans";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "plans";
DROP POLICY IF EXISTS "Allow authenticated insert" ON "plans";
DROP POLICY IF EXISTS "Allow authenticated update" ON "plans";
DROP POLICY IF EXISTS "Allow authenticated delete" ON "plans";

-- Drop admin policies if they already exist
DROP POLICY IF EXISTS "Enable insert for admins" ON "plans";
DROP POLICY IF EXISTS "Enable update for admins" ON "plans";
DROP POLICY IF EXISTS "Enable delete for admins" ON "plans";

-- 5. Create Role-Based Policies for PLANS

-- Allow ADMINS to insert
CREATE POLICY "Enable insert for admins" ON "plans"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Allow ADMINS to update
CREATE POLICY "Enable update for admins" ON "plans"
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

-- Allow ADMINS to delete
CREATE POLICY "Enable delete for admins" ON "plans"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Verify
SELECT id, email, role FROM profiles WHERE id = '5b86ad38-728e-4824-9491-24ad0a837374';
