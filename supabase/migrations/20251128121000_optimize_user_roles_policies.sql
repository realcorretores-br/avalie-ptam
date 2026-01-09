-- Consolidate redundant RLS policies to improve performance

-- 1. user_roles
-- "Admins can manage roles" covers ALL actions, including SELECT.
-- "Admins can view all roles" is redundant for SELECT if the user is an admin.
-- We will keep "Admins can manage roles" and remove "Admins can view all roles".
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- 2. tutorial_videos
-- "Videos are publicly readable" allows SELECT for everyone (including admins).
-- "Admins can manage tutorial videos" allows ALL actions for admins.
-- For SELECT, both apply. This is redundant but sometimes necessary if "publicly readable" implies anon access and we want explicit admin access.
-- However, the lint suggests it's suboptimal.
-- If "Videos are publicly readable" is true for everyone, admins don't need a separate SELECT policy.
-- But "Admins can manage tutorial videos" is usually FOR ALL.
-- We can modify "Admins can manage tutorial videos" to exclude SELECT if "Videos are publicly readable" covers it, OR
-- we can accept that for SELECT, the public policy is enough.
-- Strategy: If "Videos are publicly readable" exists and covers SELECT for everyone, we don't need another SELECT policy for admins.
-- But "Admins can manage tutorial videos" is likely defined as FOR ALL.
-- We should redefine "Admins can manage tutorial videos" to be FOR INSERT, UPDATE, DELETE only, since SELECT is covered by public policy.

DROP POLICY IF EXISTS "Admins can manage tutorial videos" ON public.tutorial_videos;

CREATE POLICY "Admins can insert tutorial videos"
ON public.tutorial_videos
FOR INSERT
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can update tutorial videos"
ON public.tutorial_videos
FOR UPDATE
USING (has_role((SELECT auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

CREATE POLICY "Admins can delete tutorial videos"
ON public.tutorial_videos
FOR DELETE
USING (has_role((SELECT auth.uid()), 'admin'::app_role));

-- Ensure "Videos are publicly readable" is optimized
DROP POLICY IF EXISTS "Videos are publicly readable" ON public.tutorial_videos;
CREATE POLICY "Videos are publicly readable"
ON public.tutorial_videos
FOR SELECT
USING (true);
