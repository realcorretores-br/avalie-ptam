<<<<<<< HEAD
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
=======
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
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
