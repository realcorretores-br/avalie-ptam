-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

-- Re-create policies with optimization (SELECT wrapping)

-- Users can view own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING ((SELECT auth.uid()) = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING ((SELECT auth.uid()) = id)
  WITH CHECK (
    (SELECT auth.uid()) = id 
    AND (bloqueado_ate IS NULL OR bloqueado_ate < now())
  );

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Admins can update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role((SELECT auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;

-- Add index on user_id if it doesn't exist
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON public.notes(user_id);

-- Re-create policies with optimization (SELECT wrapping)

-- Users can view their own notes
CREATE POLICY "Users can view their own notes" 
ON public.notes 
FOR SELECT 
USING ((SELECT auth.uid()) = user_id);

-- Users can create their own notes
CREATE POLICY "Users can create their own notes" 
ON public.notes 
FOR INSERT 
WITH CHECK ((SELECT auth.uid()) = user_id);

-- Users can update their own notes
CREATE POLICY "Users can update their own notes" 
ON public.notes 
FOR UPDATE 
USING ((SELECT auth.uid()) = user_id);

-- Users can delete their own notes
CREATE POLICY "Users can delete their own notes" 
ON public.notes 
FOR DELETE 
USING ((SELECT auth.uid()) = user_id);
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
-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all logs" ON public.admin_logs;
DROP POLICY IF EXISTS "Admins can insert logs" ON public.admin_logs;

-- Re-create policies with optimization (SELECT wrapping)

-- Admins can view all logs
CREATE POLICY "Admins can view all logs"
ON public.admin_logs
FOR SELECT
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Admins can insert logs
CREATE POLICY "Admins can insert logs"
ON public.admin_logs
FOR INSERT
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Add index on user_id if it doesn't exist (good practice for foreign keys)
CREATE INDEX IF NOT EXISTS admin_logs_user_id_idx ON public.admin_logs(user_id);
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications" ON public.notifications;

-- Re-create policies with optimization (SELECT wrapping)

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (user_id = (SELECT auth.uid()) OR user_id IS NULL);

-- Users can mark their notifications as read
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

-- Admins can create notifications
CREATE POLICY "Admins can create notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Admins can view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Admins can delete notifications
CREATE POLICY "Admins can delete notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Ensure indexes exist (already present in original migration, but good to ensure)
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can delete subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins can view all subscriptions" ON public.subscriptions;

-- Re-create policies with optimization (SELECT wrapping)

-- Users can view own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING ((SELECT auth.uid()) = user_id);

-- Admins can insert subscriptions
CREATE POLICY "Admins can insert subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Admins can update subscriptions
CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (has_role((SELECT auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Admins can delete subscriptions
CREATE POLICY "Admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Admins can view all subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Ensure index exists (foreign key usually indexed, but good to ensure)
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON public.subscriptions(user_id);
-- Fix function search path mutable lint
ALTER FUNCTION public.handle_new_user() SET search_path = public;
-- Fix function search path mutable lint
ALTER FUNCTION public.check_low_credits() SET search_path = public;
-- Fix function search path mutable lint for send_notification
-- Using dynamic SQL to handle unknown signature
DO $$
DECLARE
    func_record RECORD;
BEGIN
    FOR func_record IN 
        SELECT pg_get_function_identity_arguments(p.oid) as signature
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'send_notification'
    LOOP
        EXECUTE format('ALTER FUNCTION public.send_notification(%s) SET search_path = public', func_record.signature);
    END LOOP;
END $$;
