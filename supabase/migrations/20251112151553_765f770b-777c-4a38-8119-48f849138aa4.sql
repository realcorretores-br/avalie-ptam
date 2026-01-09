-- Criar tabela de templates de avaliação
CREATE TABLE public.avaliacao_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo_imovel TEXT NOT NULL,
  descricao TEXT,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT false,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.avaliacao_templates ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Templates são visíveis para todos autenticados"
ON public.avaliacao_templates
FOR SELECT
USING (ativo = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins podem gerenciar templates"
ON public.avaliacao_templates
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Inserir templates padrão
INSERT INTO public.avaliacao_templates (nome, tipo_imovel, descricao, template_data, is_default) VALUES
(
  'Residencial Padrão',
  'Residencial',
  'Template básico para avaliação de imóveis residenciais (casas, apartamentos)',
  '{
    "tipoImovel": "Residencial",
    "finalidade": "Compra e Venda",
    "metodologiaDescricao": "Método Comparativo Direto de Dados de Mercado conforme NBR 14.653-2",
    "situacaoImovel": "Ocupado",
    "fatoresValorizacao": ["Localização privilegiada", "Infraestrutura completa", "Proximidade a comércios e serviços"],
    "fatoresDesvalorizacao": [],
    "consideracoesFinais": "Avaliação realizada conforme normas técnicas vigentes da ABNT NBR 14.653."
  }',
  true
),
(
  'Comercial Padrão',
  'Comercial',
  'Template para avaliação de imóveis comerciais (lojas, salas, galpões)',
  '{
    "tipoImovel": "Comercial",
    "finalidade": "Compra e Venda",
    "metodologiaDescricao": "Método Comparativo Direto de Dados de Mercado conforme NBR 14.653-2, considerando características comerciais",
    "situacaoImovel": "Ocupado",
    "fatoresValorizacao": ["Localização comercial estratégica", "Alto fluxo de pessoas", "Facilidade de acesso", "Estacionamento disponível"],
    "fatoresDesvalorizacao": [],
    "consideracoesFinais": "Avaliação considerando potencial comercial e características específicas do mercado local conforme ABNT NBR 14.653."
  }',
  true
),
(
  'Rural Padrão',
  'Rural',
  'Template para avaliação de propriedades rurais (fazendas, chácaras, sítios)',
  '{
    "tipoImovel": "Rural",
    "finalidade": "Compra e Venda",
    "metodologiaDescricao": "Método Comparativo Direto de Dados de Mercado conforme NBR 14.653-3 (Imóveis Rurais)",
    "situacaoImovel": "Ocupado",
    "fatoresValorizacao": ["Qualidade do solo", "Disponibilidade de água", "Acesso adequado", "Infraestrutura rural"],
    "fatoresDesvalorizacao": [],
    "consideracoesFinais": "Avaliação de imóvel rural realizada conforme ABNT NBR 14.653-3, considerando características agrícolas e ambientais."
  }',
  true
);