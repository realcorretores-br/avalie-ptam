-- Insert/Update content for new sections

-- 1. Technology Section (Text Left, Image Right)
INSERT INTO public.landing_content (section, title, subtitle, description, image_url)
VALUES (
  'technology',
  'Tecnologia que Trabalha por Você',
  'O sistema utiliza algoritmos avançados para garantir precisão e agilidade.',
  'Tenha em mãos ferramentas poderosas que automatizam cálculos complexos e geram relatórios profissionais em instantes.',
  NULL -- Placeholder for dashboard image
) ON CONFLICT (section) DO NOTHING;

-- Items for Technology Section (List items)
INSERT INTO public.landing_items (section, title, description, icon, order_index)
VALUES 
  ('technology', 'Cálculos Automáticos', 'Foque na análise, deixe a matemática conosco.', 'Calculator', 1),
  ('technology', 'Integração de Dados', 'Dados de mercado atualizados em tempo real.', 'Database', 2),
  ('technology', 'Análises Estatísticas', 'Regressão linear e inferência estatística simplificada.', 'BarChart', 3)
ON CONFLICT DO NOTHING;


-- 2. Benefits Section (Grid of 6)
INSERT INTO public.landing_content (section, title, subtitle, description)
VALUES (
  'benefits',
  'Benefícios e Diferenciais',
  'Por que escolher o PTAM?',
  NULL
) ON CONFLICT (section) DO NOTHING;

-- Items for Benefits Section
INSERT INTO public.landing_items (section, title, description, icon, order_index)
VALUES 
  ('benefits', 'Ganhe Produtividade', 'Reduza o tempo de elaboração de laudos em até 80%.', 'Clock', 1),
  ('benefits', 'Relatórios em PDF', 'Gere documentos profissionais prontos para impressão.', 'FileText', 2),
  ('benefits', '100% Online', 'Acesse de qualquer lugar, sem instalação.', 'Globe', 3),
  ('benefits', 'Cálculos Normatizados', 'Total conformidade com a NBR 14.653.', 'CheckCircle', 4),
  ('benefits', 'Banco de Dados', 'Armazene e reutilize suas amostras de mercado.', 'Server', 5),
  ('benefits', 'Suporte Especializado', 'Equipe pronta para tirar suas dúvidas.', 'Headphones', 6)
ON CONFLICT DO NOTHING;


-- 3. Final CTA Section
INSERT INTO public.landing_content (section, title, subtitle, description)
VALUES (
  'final_cta',
  'Pronto para Simplificar Suas Avaliações?',
  'Junte-se a corretores e avaliadores que já modernizaram seu processo de trabalho.',
  NULL
) ON CONFLICT (section) DO NOTHING;


-- Update existing sections to match new content requirements if needed
-- Hero: Ensure it has video_url field support (we might need to use image_url or metadata for now if schema doesn't have video_url)
-- For now we will use image_url as placeholder or add a metadata field if needed. 
-- The current schema has image_url. We can use that for the video thumbnail or the video URL itself if we handle it in frontend.

-- Features: Update titles to match reference
UPDATE public.landing_items 
SET title = 'Comparativos Diretos', description = 'Compare imóveis com facilidade usando nossa ferramenta intuitiva.' 
WHERE section = 'features' AND order_index = 1;

UPDATE public.landing_items 
SET title = 'Método Evolutivo', description = 'Avalie terrenos e construções com precisão técnica.' 
WHERE section = 'features' AND order_index = 2;

UPDATE public.landing_items 
SET title = 'Capitulação da Renda', description = 'Análise baseada no retorno do investimento.' 
WHERE section = 'features' AND order_index = 3;

-- How It Works: Update steps
DELETE FROM public.landing_items WHERE section = 'how_it_works';
INSERT INTO public.landing_items (section, title, description, icon, order_index)
VALUES 
  ('how_it_works', 'Cadastre-se', 'Crie sua conta em menos de 1 minuto.', 'UserPlus', 1),
  ('how_it_works', 'Escolha o Plano', 'Selecione o pacote ideal para sua demanda.', 'CreditCard', 2),
  ('how_it_works', 'Libere o Acesso', 'Pagamento confirmado, acesso imediato.', 'Unlock', 3),
  ('how_it_works', 'Comece a Avaliar', 'Gere laudos ilimitados com facilidade.', 'FileCheck', 4);
