-- Fix critical RLS issue: Allow users to update their own subscription usage
-- This enables the credit deduction system to work for regular users

CREATE POLICY "Users can update own subscription usage"
ON public.subscriptions
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);