-- Adiciona a coluna data_ultimo_relatorio na tabela profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS data_ultimo_relatorio TIMESTAMP WITH TIME ZONE;

-- Opcional: Atualizar com alguma data padrão para usuários existentes (ex: data de criação)
-- UPDATE profiles SET data_ultimo_relatorio = created_at WHERE data_ultimo_relatorio IS NULL;
