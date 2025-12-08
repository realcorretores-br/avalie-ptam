-- Create storage bucket for landing images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('landing_images', 'landing_images', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update" ON storage.objects;

-- Allow public access to landing_images
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'landing_images' );

-- Allow authenticated users to upload to landing_images
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'landing_images' );

-- Allow authenticated users to update their own uploads (or all if admin)
CREATE POLICY "Authenticated Update"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'landing_images' );

-- Ensure landing_content table exists
CREATE TABLE IF NOT EXISTS public.landing_content (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    section text NOT NULL,
    title text,
    subtitle text,
    description text,
    image_url text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create landing_items table for lists (features, testimonials, etc.)
CREATE TABLE IF NOT EXISTS public.landing_items (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    section text NOT NULL,
    title text,
    description text,
    icon text,
    image_url text,
    order_index integer DEFAULT 0,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.landing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.landing_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for tables
DROP POLICY IF EXISTS "Public Read Access Content" ON public.landing_content;
DROP POLICY IF EXISTS "Authenticated Manage Access Content" ON public.landing_content;
DROP POLICY IF EXISTS "Public Read Access Items" ON public.landing_items;
DROP POLICY IF EXISTS "Authenticated Manage Access Items" ON public.landing_items;

-- Policies for landing_content
CREATE POLICY "Public Read Access Content" ON public.landing_content FOR SELECT USING ( true );
CREATE POLICY "Authenticated Manage Access Content" ON public.landing_content FOR ALL TO authenticated USING ( true ) WITH CHECK ( true );

-- Policies for landing_items
CREATE POLICY "Public Read Access Items" ON public.landing_items FOR SELECT USING ( true );
CREATE POLICY "Authenticated Manage Access Items" ON public.landing_items FOR ALL TO authenticated USING ( true ) WITH CHECK ( true );

-- Clear existing data to ensure clean state for initial population
DELETE FROM public.landing_items;
DELETE FROM public.landing_content WHERE section IN ('hero', 'problem_solution', 'features', 'how_it_works', 'testimonials', 'pricing', 'guarantees', 'faq');

-- Insert Sections
INSERT INTO public.landing_content (section, title, subtitle, description, image_url) VALUES
('hero', 
 'Relatórios de Avaliação Imobiliária Profissional — Em Minutos, não em Dias', 
 'Comparativo Direto, CUB ou Capitalização de Renda. Gere laudos prontos em PDF A4 para venda ou locação.', 
 'Para corretores, engenheiros e arquitetos que querem agilizar a emissão de pareceres técnicos com precisão e profissionalismo.', 
 NULL),

('problem_solution', 'Problema & Solução', NULL, 'Problemas comuns vs Solução Avalie Certo', NULL),
('features', 'Recursos Principais', 'Tudo que você precisa para avaliações profissionais', NULL, NULL),
('how_it_works', 'Como Funciona', 'Simples e rápido em 4 passos', NULL, NULL),
('testimonials', 'O que dizem nossos clientes', 'Profissionais que ganharam tempo e fecharam mais negócios', NULL, NULL),
('pricing', 'Planos e Preços', 'Escolha o plano ideal para sua necessidade', NULL, NULL),
('guarantees', 'Garantias e Diferenciais', 'Por que escolher o Avalie Certo?', NULL, NULL),
('faq', 'Perguntas Frequentes', 'Tire suas dúvidas', NULL, NULL);

-- Insert Items

-- Problem & Solution (Using metadata to distinguish type: 'problem' or 'solution')
INSERT INTO public.landing_items (section, title, metadata, order_index) VALUES
('problem_solution', 'Perda de tempo com planilhas manuais complexas', '{"type": "problem"}', 1),
('problem_solution', 'Risco de erro nos cálculos (CUB, depreciação, capitalização)', '{"type": "problem"}', 2),
('problem_solution', 'Fotos e dados dispersos, sem padronização', '{"type": "problem"}', 3),
('problem_solution', 'Falta de padronização e demora para entregar laudos', '{"type": "problem"}', 4),

('problem_solution', 'Plataforma única — preenche tudo com dados e fotos', '{"type": "solution"}', 1),
('problem_solution', 'Cálculos automáticos (homogeneização, CUB, renda)', '{"type": "solution"}', 2),
('problem_solution', 'Upload e organização de fotos + relatórios prontos em PDF', '{"type": "solution"}', 3),
('problem_solution', 'Economia de tempo: de 2 a 4 dias para minutos', '{"type": "solution"}', 4);

-- Features
INSERT INTO public.landing_items (section, title, description, icon, order_index) VALUES
('features', 'Comparativo Direto', 'Monte amostras, importe dados de mercado, calcule preço médio por metro e valor final com um clique.', 'BarChart3', 1),
('features', 'Método Evolutivo (CUB)', 'Baixe CUB atualizado e calcule valor considerando depreciação conforme idade e conservação.', 'Calculator', 2),
('features', 'Capitalização de Renda', 'Insira aluguel e taxa de capitalização, receba estimativa de valor do imóvel para locação.', 'TrendingUp', 3),
('features', 'Relatórios PDF prontos', 'Laudos formatados em A4, prontos para entrega ao cliente, com layout profissional.', 'FileText', 4),
('features', 'Upload de fotos e marcações', 'Envie fotos do imóvel, marque áreas importantes, adicione notas visuais direto no laudo.', 'Image', 5),
('features', 'Interface amigável', 'Campos com máscaras, validações automáticas, preenchimento inteligente para corretores e engenheiros.', 'Layout', 6),
('features', 'Painel de controle', 'Salve, revise, baixe e organize seus laudos com histórico completo de avaliações.', 'History', 7);

-- How It Works
INSERT INTO public.landing_items (section, title, description, icon, order_index) VALUES
('how_it_works', 'Cadastre-se', 'Crie sua conta gratuita e escolha seu plano ou créditos avulsos.', 'UserPlus', 1),
('how_it_works', 'Preencha os dados', 'Insira informações do imóvel, fotos, área e características.', 'FileEdit', 2),
('how_it_works', 'Aplique o método', 'Escolha entre Comparativo, Evolutivo ou Capitalização de Renda.', 'Calculator', 3),
('how_it_works', 'Gere o relatório', 'Receba seu laudo em PDF A4 pronto para enviar ao cliente.', 'FileCheck', 4);

-- Testimonials
INSERT INTO public.landing_items (section, title, description, metadata, order_index) VALUES
('testimonials', 'Carlos Mendes', 'Antes eu levava 3 dias para fazer um laudo completo. Com o Avalie Certo, faço em 20 minutos e a apresentação impressiona meus clientes.', '{"role": "Corretor de Imóveis", "company": "Mendes Imobiliária"}', 1),
('testimonials', 'Eng. Fernanda Lima', 'A precisão dos cálculos do Método Evolutivo é incrível. O sistema já busca o CUB atualizado e aplica a depreciação corretamente. Recomendo!', '{"role": "Engenheira Civil", "company": "FL Engenharia"}', 2),
('testimonials', 'Roberto Almeida', 'A facilidade de organizar as amostras e gerar o comparativo direto mudou minha rotina. A plataforma é muito intuitiva e completa.', '{"role": "Avaliador Judicial", "company": "Autônomo"}', 3);

-- Pricing
INSERT INTO public.landing_items (section, title, description, metadata, order_index) VALUES
('pricing', 'Start', 'Ideal para quem avalia esporadicamente', '{"price": "R$ 49,90", "period": "/mês", "highlight": false, "features": ["1 relatório ativo por vez", "1 relatório salvo", "Template Residencial, Rural ou Comercial", "Exportar PDF", "Acesso ao dashboard", "Auto-save de relatório"]}', 1),
('pricing', 'Go', 'Para quem emite com frequência moderada', '{"price": "R$ 97,00", "period": "/mês", "highlight": true, "features": ["Tudo do Start", "Até 5 relatórios/mês", "Histórico de 5 relatórios salvos", "Upload de logotipo nos laudos", "Anotações/Notas", "Escolha de tema (claro/escuro)", "Acesso a tutoriais em vídeo"]}', 2),
('pricing', 'Pro', 'Para avaliadores ativos', '{"price": "R$ 197,00", "period": "/mês", "highlight": false, "features": ["Tudo do Go", "25 relatórios/mês", "15 relatórios salvos", "Upload de fotos via celular", "Prioridade no suporte", "Métricas de produtividade"]}', 3),
('pricing', 'Expert', 'Para empresas e alto volume', '{"price": "Sob Consulta", "period": "", "highlight": false, "features": ["Relatórios ilimitados", "Salvamento ilimitado", "Exportação PDF com branding completo", "Customização visual da plataforma", "Suporte prioritário", "Funcionalidades avançadas"]}', 4);

-- Guarantees
INSERT INTO public.landing_items (section, title, description, icon, order_index) VALUES
('guarantees', 'Só PDF, sem DOCX', 'Garantimos a padronização e integridade do seu laudo. Menos complicação, mais profissionalismo.', 'FileCheck', 1),
('guarantees', 'Privacidade Total', 'Seus dados e fotos são armazenados com segurança e você tem total controle sobre eles.', 'Lock', 2),
('guarantees', 'Validade dos Dados', 'Dados de corretor e imobiliária são verificados e protegidos para garantir a autenticidade.', 'ShieldCheck', 3),
('guarantees', 'Velocidade e Praticidade', 'Transforme dias de trabalho em minutos. Foco no que importa: sua avaliação técnica.', 'Zap', 4);

-- FAQ
INSERT INTO public.landing_items (section, title, description, order_index) VALUES
('faq', 'Quantos relatórios consigo com cada plano?', 'O plano Start permite 1 relatório ativo. O Go permite até 5 relatórios/mês. O Pro oferece 25 relatórios/mês e o Expert é ilimitado.', 1),
('faq', 'Posso comprar créditos avulsos?', 'Sim! Você pode adquirir créditos avulsos para gerar relatórios sem a necessidade de uma assinatura mensal recorrente.', 2),
('faq', 'Que tipo de imóvel posso avaliar?', 'Você pode avaliar imóveis residenciais, comerciais e rurais. A plataforma oferece templates específicos para cada tipo.', 3),
('faq', 'Posso usar no celular?', 'Sim, a plataforma é totalmente responsiva e funciona perfeitamente em smartphones e tablets, permitindo que você trabalhe de onde estiver.', 4),
('faq', 'As fotos ficam armazenadas?', 'Sim, as fotos ficam armazenadas de forma segura na nuvem, vinculadas aos seus relatórios, facilitando o acesso e a organização.', 5),
('faq', 'O laudo é padrão ABNT?', 'Sim, nossos relatórios são desenvolvidos seguindo as diretrizes da ABNT NBR 14653, garantindo conformidade técnica e profissionalismo.', 6),
('faq', 'Posso editar o laudo depois de gerado?', 'Sim, você pode editar as informações e gerar o PDF novamente quantas vezes precisar enquanto o relatório estiver ativo.', 7),
('faq', 'Quando o plano renova?', 'Os planos mensais renovam automaticamente a cada 30 dias a partir da data da contratação. Você pode cancelar a renovação a qualquer momento.', 8);
