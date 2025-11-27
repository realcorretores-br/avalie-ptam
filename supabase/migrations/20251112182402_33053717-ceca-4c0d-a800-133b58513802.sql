-- Adicionar campo theme_color na tabela profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT 'blue';

-- Atualizar RLS policies para avaliacoes - permitir admins visualizarem tudo
DROP POLICY IF EXISTS "Users can manage own avaliacoes" ON public.avaliacoes;

CREATE POLICY "Users can view own avaliacoes"
ON public.avaliacoes
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can insert own avaliacoes"
ON public.avaliacoes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own avaliacoes"
ON public.avaliacoes
FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own avaliacoes"
ON public.avaliacoes
FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

-- Atualizar RLS policies para ptam_reports - permitir admins visualizarem tudo
DROP POLICY IF EXISTS "Users can view their own reports" ON public.ptam_reports;
DROP POLICY IF EXISTS "Users can create their own reports" ON public.ptam_reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.ptam_reports;
DROP POLICY IF EXISTS "Users can delete their own reports" ON public.ptam_reports;

CREATE POLICY "Users can view own reports"
ON public.ptam_reports
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create own reports"
ON public.ptam_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reports"
ON public.ptam_reports
FOR UPDATE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own reports"
ON public.ptam_reports
FOR DELETE
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));