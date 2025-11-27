-- Allow admins to update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to manage subscriptions
CREATE POLICY "Admins can insert subscriptions"
ON public.subscriptions
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update subscriptions"
ON public.subscriptions
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete subscriptions"
ON public.subscriptions
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all subscriptions"
ON public.subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));