-- Criar tabela de logs de atividades dos administradores
CREATE TABLE public.admin_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para admin_logs
CREATE POLICY "Admins can view all logs"
ON public.admin_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert logs"
ON public.admin_logs
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Criar tabela de conteúdo da landing page
CREATE TABLE public.landing_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  image_url TEXT,
  metadata JSONB,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Habilitar RLS
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para landing_content
CREATE POLICY "Landing content is publicly readable"
ON public.landing_content
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage landing content"
ON public.landing_content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Adicionar políticas RLS para admins gerenciarem vídeos tutoriais
CREATE POLICY "Admins can manage tutorial videos"
ON public.tutorial_videos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Inserir conteúdo padrão da landing page
INSERT INTO public.landing_content (section, title, subtitle, description) VALUES
('hero', 'PTAM - Sistema de Avaliação Imobiliária', 'Profissional e Eficiente', 'Gere laudos técnicos de avaliação de imóveis de forma rápida e profissional'),
('features', 'Por que escolher o PTAM?', null, 'Sistema completo para avaliação de imóveis'),
('pricing', 'Planos e Preços', null, 'Escolha o plano ideal para suas necessidades');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_landing_content_updated_at
BEFORE UPDATE ON public.landing_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();