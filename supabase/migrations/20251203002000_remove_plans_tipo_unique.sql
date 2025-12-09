-- Remove unique constraint on tipo column in plans table
ALTER TABLE public.plans DROP CONSTRAINT IF EXISTS plans_tipo_key;
