-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Re-create policies with optimization (SELECT wrapping)

-- Users can view own roles
CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- Admins can view all roles
CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Admins can manage roles
CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.has_role((SELECT auth.uid()), 'admin'));

-- Ensure index exists (UNIQUE constraint already creates index on user_id, role)
-- Adding explicit index on role for completeness if querying by role alone becomes necessary, 
-- though for these policies the composite key is sufficient as user_id is the leading column.
CREATE INDEX IF NOT EXISTS user_roles_role_idx ON public.user_roles(role);
