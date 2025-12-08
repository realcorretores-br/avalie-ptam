-- Fix RLS performance issues by wrapping auth.uid() in subqueries

-- 1. landing_content
DROP POLICY IF EXISTS "Admins can manage landing content" ON public.landing_content;
CREATE POLICY "Admins can manage landing content"
ON public.landing_content
FOR ALL
USING (has_role((SELECT auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- 2. tutorial_videos
DROP POLICY IF EXISTS "Admins can manage tutorial videos" ON public.tutorial_videos;
CREATE POLICY "Admins can manage tutorial videos"
ON public.tutorial_videos
FOR ALL
USING (has_role((SELECT auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- 3. payment_gateways
DROP POLICY IF EXISTS "Admins can manage payment gateways" ON public.payment_gateways;
CREATE POLICY "Admins can manage payment gateways"
ON public.payment_gateways
FOR ALL
TO authenticated
USING (has_role((SELECT auth.uid()), 'admin'::app_role))
WITH CHECK (has_role((SELECT auth.uid()), 'admin'::app_role));

-- 4. additional_reports_purchases
DROP POLICY IF EXISTS "Users can view own purchases" ON public.additional_reports_purchases;
CREATE POLICY "Users can view own purchases"
ON public.additional_reports_purchases
FOR SELECT
USING ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS "Users can create own purchases" ON public.additional_reports_purchases;
CREATE POLICY "Users can create own purchases"
ON public.additional_reports_purchases
FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);
