<<<<<<< HEAD
-- Criar tipos enumerados
CREATE TYPE public.plan_type AS ENUM ('avulso', 'mensal_basico', 'mensal_pro', 'personalizado');
CREATE TYPE public.subscription_status AS ENUM ('pending', 'active', 'cancelled', 'expired');

-- Tabela de perfis de usuários (Avaliadores)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  nome_completo text NOT NULL,
  cpf text,
  rg text,
  telefone text NOT NULL,
  email text NOT NULL,
  
  -- Dados Estrangeiros (opcional)
  estrangeiro boolean DEFAULT false,
  passaporte text,
  pais_origem text,
  
  -- Endereço
  endereco text NOT NULL,
  numero text,
  complemento text,
  bairro text,
  cidade text NOT NULL,
  estado text NOT NULL,
  cep text NOT NULL,
  
  -- Credenciais Profissionais
  tipo_avaliador text CHECK (tipo_avaliador IN ('corretor', 'arquiteto', 'engenheiro')),
  creci text,
  cau text,
  crea text,
  cnae text,
  cnpj text,
  
  -- Controle de Bloqueio
  data_cadastro timestamp with time zone DEFAULT now(),
  bloqueado_ate timestamp with time zone,
  
  -- Metadados
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (bloqueado_ate IS NULL OR bloqueado_ate < now())
  );

-- Tabela de planos
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo plan_type UNIQUE NOT NULL,
  nome text NOT NULL,
  descricao text,
  preco decimal(10,2) NOT NULL,
  relatorios_incluidos int,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Inserir planos padrão
-- Inserir planos padrão apenas se não existirem
INSERT INTO public.plans (tipo, nome, preco, relatorios_incluidos, descricao)
SELECT 'avulso', 'Plano Avulso', 104.95, 3, '3 relatórios com acesso completo sem vínculo'
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE tipo = 'avulso');

INSERT INTO public.plans (tipo, nome, preco, relatorios_incluidos, descricao)
SELECT 'mensal_basico', 'Mensal Básico', 69.95, 3, '3 relatórios mensais com suporte básico'
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE tipo = 'mensal_basico');

INSERT INTO public.plans (tipo, nome, preco, relatorios_incluidos, descricao)
SELECT 'mensal_pro', 'Mensal Pró', 289.95, 25, '25 relatórios mensais com suporte prioritário'
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE tipo = 'mensal_pro');

INSERT INTO public.plans (tipo, nome, preco, relatorios_incluidos, descricao)
SELECT 'personalizado', 'Personalizado', 0.00, NULL, 'Plano sob medida para empresas e grupos'
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE tipo = 'personalizado');

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are publicly readable"
  ON public.plans FOR SELECT
  USING (ativo = true);

-- Tabela de assinaturas
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES public.plans(id) NOT NULL,
  
  status subscription_status DEFAULT 'pending',
  
  -- Mercado Pago
  payment_id text,
  payment_status text,
  
  -- Controle de uso
  relatorios_usados int DEFAULT 0,
  relatorios_disponiveis int,
  
  -- Datas
  data_inicio timestamp with time zone,
  data_expiracao timestamp with time zone,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Tabela de avaliações (histórico de laudos)
CREATE TABLE public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados do Formulário PTAM (JSON completo)
  form_data jsonb NOT NULL,
  
  -- Metadados para busca e filtros
  endereco_imovel text,
  tipo_imovel text,
  finalidade text,
  valor_final decimal(15,2),
  
  -- Status
  status text DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizado')),
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own avaliacoes"
  ON public.avaliacoes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabela de vídeos tutoriais
CREATE TABLE public.tutorial_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  url_video text NOT NULL,
  thumbnail text,
  ordem int,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tutorial_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos are publicly readable"
  ON public.tutorial_videos FOR SELECT
  USING (ativo = true);

-- Função para criar profile automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    nome_completo, 
    telefone, 
    endereco, 
    cidade, 
    estado, 
    cep
  )
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome_completo', ''),
    COALESCE(new.raw_user_meta_data->>'telefone', ''),
    COALESCE(new.raw_user_meta_data->>'endereco', ''),
    COALESCE(new.raw_user_meta_data->>'cidade', ''),
    COALESCE(new.raw_user_meta_data->>'estado', ''),
    COALESCE(new.raw_user_meta_data->>'cep', '')
  );
  RETURN new;
END;
$$;

-- Trigger para criar profile ao criar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON public.avaliacoes
=======
-- Criar tipos enumerados
CREATE TYPE public.plan_type AS ENUM ('avulso', 'mensal_basico', 'mensal_pro', 'personalizado');
CREATE TYPE public.subscription_status AS ENUM ('pending', 'active', 'cancelled', 'expired');

-- Tabela de perfis de usuários (Avaliadores)
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Dados Pessoais
  nome_completo text NOT NULL,
  cpf text,
  rg text,
  telefone text NOT NULL,
  email text NOT NULL,
  
  -- Dados Estrangeiros (opcional)
  estrangeiro boolean DEFAULT false,
  passaporte text,
  pais_origem text,
  
  -- Endereço
  endereco text NOT NULL,
  numero text,
  complemento text,
  bairro text,
  cidade text NOT NULL,
  estado text NOT NULL,
  cep text NOT NULL,
  
  -- Credenciais Profissionais
  tipo_avaliador text CHECK (tipo_avaliador IN ('corretor', 'arquiteto', 'engenheiro')),
  creci text,
  cau text,
  crea text,
  cnae text,
  cnpj text,
  
  -- Controle de Bloqueio
  data_cadastro timestamp with time zone DEFAULT now(),
  bloqueado_ate timestamp with time zone,
  
  -- Metadados
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id 
    AND (bloqueado_ate IS NULL OR bloqueado_ate < now())
  );

-- Tabela de planos
CREATE TABLE public.plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo plan_type UNIQUE NOT NULL,
  nome text NOT NULL,
  descricao text,
  preco decimal(10,2) NOT NULL,
  relatorios_incluidos int,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Inserir planos padrão
-- Inserir planos padrão apenas se não existirem
INSERT INTO public.plans (tipo, nome, preco, relatorios_incluidos, descricao)
SELECT 'avulso', 'Plano Avulso', 104.95, 3, '3 relatórios com acesso completo sem vínculo'
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE tipo = 'avulso');

INSERT INTO public.plans (tipo, nome, preco, relatorios_incluidos, descricao)
SELECT 'mensal_basico', 'Mensal Básico', 69.95, 3, '3 relatórios mensais com suporte básico'
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE tipo = 'mensal_basico');

INSERT INTO public.plans (tipo, nome, preco, relatorios_incluidos, descricao)
SELECT 'mensal_pro', 'Mensal Pró', 289.95, 25, '25 relatórios mensais com suporte prioritário'
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE tipo = 'mensal_pro');

INSERT INTO public.plans (tipo, nome, preco, relatorios_incluidos, descricao)
SELECT 'personalizado', 'Personalizado', 0.00, NULL, 'Plano sob medida para empresas e grupos'
WHERE NOT EXISTS (SELECT 1 FROM public.plans WHERE tipo = 'personalizado');

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are publicly readable"
  ON public.plans FOR SELECT
  USING (ativo = true);

-- Tabela de assinaturas
CREATE TABLE public.subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id uuid REFERENCES public.plans(id) NOT NULL,
  
  status subscription_status DEFAULT 'pending',
  
  -- Mercado Pago
  payment_id text,
  payment_status text,
  
  -- Controle de uso
  relatorios_usados int DEFAULT 0,
  relatorios_disponiveis int,
  
  -- Datas
  data_inicio timestamp with time zone,
  data_expiracao timestamp with time zone,
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Tabela de avaliações (histórico de laudos)
CREATE TABLE public.avaliacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Dados do Formulário PTAM (JSON completo)
  form_data jsonb NOT NULL,
  
  -- Metadados para busca e filtros
  endereco_imovel text,
  tipo_imovel text,
  finalidade text,
  valor_final decimal(15,2),
  
  -- Status
  status text DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizado')),
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own avaliacoes"
  ON public.avaliacoes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Tabela de vídeos tutoriais
CREATE TABLE public.tutorial_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  descricao text,
  url_video text NOT NULL,
  thumbnail text,
  ordem int,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tutorial_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Videos are publicly readable"
  ON public.tutorial_videos FOR SELECT
  USING (ativo = true);

-- Função para criar profile automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    nome_completo, 
    telefone, 
    endereco, 
    cidade, 
    estado, 
    cep
  )
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome_completo', ''),
    COALESCE(new.raw_user_meta_data->>'telefone', ''),
    COALESCE(new.raw_user_meta_data->>'endereco', ''),
    COALESCE(new.raw_user_meta_data->>'cidade', ''),
    COALESCE(new.raw_user_meta_data->>'estado', ''),
    COALESCE(new.raw_user_meta_data->>'cep', '')
  );
  RETURN new;
END;
$$;

-- Trigger para criar profile ao criar usuário
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();

CREATE TRIGGER update_avaliacoes_updated_at
  BEFORE UPDATE ON public.avaliacoes
>>>>>>> bfb7ae9ccedca645f984a09ceb934d0fef71822c
  FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();