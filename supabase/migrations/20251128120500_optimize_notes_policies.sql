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
