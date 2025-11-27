-- 1. Garantir que a função segura de verificação de role existe
-- SECURITY DEFINER permite que esta função rode sem as restrições de RLS do usuário atual
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_my_role() TO authenticated;

-- 2. Garantir que o usuário é admin
UPDATE profiles 
SET role = 'admin' 
WHERE email = 'jonathan@silvajonathan.me';

-- 3. Limpar TODAS as políticas antigas da tabela profiles para evitar conflitos
DROP POLICY IF EXISTS "Enable read access for admins" ON "profiles";
DROP POLICY IF EXISTS "Enable update access for admins" ON "profiles";
DROP POLICY IF EXISTS "Enable delete access for admins" ON "profiles";
DROP POLICY IF EXISTS "Users can insert their own profile" ON "profiles";
DROP POLICY IF EXISTS "Users can update own profile" ON "profiles";
DROP POLICY IF EXISTS "Users can read own profile" ON "profiles";
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON "profiles";
DROP POLICY IF EXISTS "Users can insert their own profile." ON "profiles";
DROP POLICY IF EXISTS "Users can update own profile." ON "profiles";

-- 4. Habilitar RLS (caso não esteja)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Criar novas políticas robustas (usando get_my_role para evitar recursão)

-- LEITURA:
-- Usuário pode ver seu próprio perfil.
-- Admin pode ver TODOS os perfis.
CREATE POLICY "Profiles visibility" ON "profiles"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (
  auth.uid() = id OR 
  get_my_role() = 'admin'
);

-- ATUALIZAÇÃO:
-- Usuário pode editar seu próprio perfil.
-- Admin pode editar TODOS os perfis.
CREATE POLICY "Profiles update" ON "profiles"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR 
  get_my_role() = 'admin'
)
WITH CHECK (
  auth.uid() = id OR 
  get_my_role() = 'admin'
);

-- INSERÇÃO:
-- Usuário pode criar seu próprio perfil (necessário no cadastro).
CREATE POLICY "Profiles insert" ON "profiles"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- EXCLUSÃO:
-- Apenas Admin pode excluir perfis.
CREATE POLICY "Profiles delete" ON "profiles"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (
  get_my_role() = 'admin'
);

-- Verificação final
SELECT email, role FROM profiles WHERE email = 'jonathan@silvajonathan.me';
