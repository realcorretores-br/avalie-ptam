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
