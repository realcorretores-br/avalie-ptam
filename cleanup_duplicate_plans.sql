-- Delete duplicate plans, keeping the oldest one for each type
DELETE FROM public.plans
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY tipo ORDER BY created_at ASC) as rnum
    FROM public.plans
  ) t
  WHERE t.rnum > 1
);

-- Restore unique constraint on tipo
ALTER TABLE public.plans ADD CONSTRAINT plans_tipo_key UNIQUE (tipo);
