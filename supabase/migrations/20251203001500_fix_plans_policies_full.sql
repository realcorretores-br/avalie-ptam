-- Add INSERT and DELETE policies for plans
CREATE POLICY "Admin insert plans"
ON public.plans
FOR INSERT
TO authenticated
WITH CHECK ( public.has_role(auth.uid(), 'admin') );

CREATE POLICY "Admin delete plans"
ON public.plans
FOR DELETE
TO authenticated
USING ( public.has_role(auth.uid(), 'admin') );
