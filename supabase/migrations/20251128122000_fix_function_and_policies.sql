-- Fix function search path mutable
CREATE OR REPLACE FUNCTION public.toggle_admin_role(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  -- Check if the executor is an admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can toggle roles';
  END IF;

  -- Check if target user has admin role
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = target_user_id
    AND role = 'admin'
  ) INTO is_admin;

  IF is_admin THEN
    -- Remove admin role
    DELETE FROM public.user_roles
    WHERE user_id = target_user_id
    AND role = 'admin';
    RETURN false;
  ELSE
    -- Add admin role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (target_user_id, 'admin');
    RETURN true;
  END IF;
END;
$$;

-- Remove redundant policies on landing_content
-- We keep "Admins can manage landing content" and "Landing content is publicly readable"
-- We drop the others mentioned in the lint report

DROP POLICY IF EXISTS "Authenticated Manage Access" ON public.landing_content;
DROP POLICY IF EXISTS "Authenticated Manage Access Content" ON public.landing_content;
DROP POLICY IF EXISTS "Public Read Access" ON public.landing_content;
DROP POLICY IF EXISTS "Public Read Access Content" ON public.landing_content;
