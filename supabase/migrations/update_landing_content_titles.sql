-- Update Landing Page Content Titles to match reference site

-- Hero
UPDATE public.landing_content
SET title = 'Avaliações Imobiliárias com Precisão e Simplicidade'
WHERE section = 'hero';

-- Features
UPDATE public.landing_content
SET title = 'Funcionalidades'
WHERE section = 'features';

-- Technology
UPDATE public.landing_content
SET title = 'Tecnologia que Trabalha por Você'
WHERE section = 'technology';

-- How It Works
UPDATE public.landing_content
SET title = 'Como Funciona'
WHERE section = 'how_it_works';

-- Pricing
UPDATE public.landing_content
SET title = 'Planos e Preços'
WHERE section = 'pricing';

-- Testimonials
UPDATE public.landing_content
SET title = 'Nossos Clientes Recomendam'
WHERE section = 'testimonials';

-- Benefits
UPDATE public.landing_content
SET title = 'Benefícios e Diferenciais'
WHERE section = 'benefits';

-- FAQ
UPDATE public.landing_content
SET title = 'Perguntas Frequentes'
WHERE section = 'faq';

-- Final CTA
UPDATE public.landing_content
SET title = 'Pronto para Simplificar Suas Avaliações?'
WHERE section = 'final_cta';
