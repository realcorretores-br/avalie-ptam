-- Atualizar plano Avulso para PTAM Start
UPDATE plans 
SET nome = 'PTAM Start',
    descricao = 'Ideal para quem realiza avaliações esporádicas. 1 relatório ativo, template de avaliação, salvamento automático, exportação PDF e acesso ao dashboard.',
    preco = 34.95,
    relatorios_incluidos = 1
WHERE tipo = 'avulso';

-- Atualizar Mensal Básico para PTAM Go
UPDATE plans 
SET nome = 'PTAM Go',
    descricao = 'Para profissionais com frequência moderada. 5 relatórios mensais, anotações, logotipo, personalização de cor, métricas básicas, tutoriais em vídeo e exportação A4.',
    preco = 69.95,
    relatorios_incluidos = 5
WHERE tipo = 'mensal_basico';

-- Atualizar Mensal Avançado para PTAM Pro
UPDATE plans 
SET nome = 'PTAM Pro',
    descricao = 'Para avaliadores ativos. 25 relatórios mensais, 15 salvos, upload de fotos mobile, edição avançada, personalização visual completa, suporte prioritário e métricas detalhadas.',
    preco = 289.95,
    relatorios_incluidos = 25
WHERE tipo = 'mensal_pro';

-- Adicionar PTAM Expert
INSERT INTO plans (nome, tipo, descricao, preco, relatorios_incluidos, ativo) 
VALUES (
  'PTAM Expert',
  'personalizado',
  'Solução definitiva para empresas. Relatórios ilimitados, salvamento ilimitado, branding completo, personalização total, tutoriais exclusivos, suporte dedicado e exportação PDF/DOC.',
  799.95,
  NULL,
  true
);