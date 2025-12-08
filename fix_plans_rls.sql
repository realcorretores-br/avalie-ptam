-- Enable RLS on plans table (ensure it's on)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts (and ensure we start fresh)
DROP POLICY IF EXISTS "Enable read access for all users" ON "plans";
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON "plans";
DROP POLICY IF EXISTS "Enable update for authenticated users" ON "plans";
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON "plans";
DROP POLICY IF EXISTS "Allow public read access" ON "plans";
DROP POLICY IF EXISTS "Allow authenticated insert" ON "plans";
DROP POLICY IF EXISTS "Allow authenticated update" ON "plans";
DROP POLICY IF EXISTS "Allow authenticated delete" ON "plans";

-- Create comprehensive policies

-- 1. READ: Allow everyone to view plans (public)
CREATE POLICY "Enable read access for all users" ON "plans"
AS PERMISSIVE FOR SELECT
TO public
USING (true);

-- 2. INSERT: Allow authenticated users to create plans
CREATE POLICY "Enable insert for authenticated users" ON "plans"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. UPDATE: Allow authenticated users to update plans
CREATE POLICY "Enable update for authenticated users" ON "plans"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. DELETE: Allow authenticated users to delete plans
CREATE POLICY "Enable delete for authenticated users" ON "plans"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);

-- Verify policies
SELECT * FROM pg_policies WHERE tablename = 'plans';
