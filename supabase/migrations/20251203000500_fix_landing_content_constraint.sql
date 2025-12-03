-- Remove duplicates from landing_content, keeping the most recently updated one
DELETE FROM public.landing_content a USING (
      SELECT section, MAX(updated_at) as max_updated
      FROM public.landing_content
      GROUP BY section
      HAVING COUNT(*) > 1
    ) b
WHERE a.section = b.section AND a.updated_at < b.max_updated;

-- Add unique constraint to section column
ALTER TABLE public.landing_content ADD CONSTRAINT landing_content_section_key UNIQUE (section);
