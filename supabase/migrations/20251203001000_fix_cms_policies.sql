<<<<<<< HEAD
-- Ensure has_role is working and accessible
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;

-- Fix Plans Policies
DROP POLICY IF EXISTS "Authenticated users can update plans" ON public.plans;
DROP POLICY IF EXISTS "Admin update plans" ON public.plans;

CREATE POLICY "Admin update plans"
ON public.plans
FOR UPDATE
TO authenticated
USING ( public.has_role(auth.uid(), 'admin') )
WITH CHECK ( public.has_role(auth.uid(), 'admin') );

-- Fix Landing Content Policies
DROP POLICY IF EXISTS "Authenticated Manage Access Content" ON public.landing_content;
DROP POLICY IF EXISTS "Admin manage content" ON public.landing_content;

CREATE POLICY "Admin manage content"
ON public.landing_content
FOR ALL
TO authenticated
USING ( public.has_role(auth.uid(), 'admin') )
WITH CHECK ( public.has_role(auth.uid(), 'admin') );

-- Ensure user_roles is readable by admins (for has_role to work if not security definer, but it is. Good practice anyway)
DROP POLICY IF EXISTS "Admin read user_roles" ON public.user_roles;
CREATE POLICY "Admin read user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING ( public.has_role(auth.uid(), 'admin') );
=======
-- Ensure has_role is working and accessible
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;

-- Fix Plans Policies
DROP POLICY IF EXISTS "Authenticated users can update plans" ON public.plans;
DROP POLICY IF EXISTS "Admin update plans" ON public.plans;

CREATE POLICY "Admin update plans"
ON public.plans
FOR UPDATE
TO authenticated
USING ( public.has_role(auth.uid(), 'admin') )
WITH CHECK ( public.has_role(auth.uid(), 'admin') );

-- Fix Landing Content Policies
DROP POLICY IF EXISTS "Authenticated Manage Access Content" ON public.landing_content;
DROP POLICY IF EXISTS "Admin manage content" ON public.landing_content;

CREATE POLICY "Admin manage content"
ON public.landing_content
FOR ALL
TO authenticated
USING ( public.has_role(auth.uid(), 'admin') )
WITH CHECK ( public.has_role(auth.uid(), 'admin') );

-- Ensure user_roles is readable by admins (for has_role to work if not security definer, but it is. Good practice anyway)
DROP POLICY IF EXISTS "Admin read user_roles" ON public.user_roles;
CREATE POLICY "Admin read user_roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING ( public.has_role(auth.uid(), 'admin') );
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
