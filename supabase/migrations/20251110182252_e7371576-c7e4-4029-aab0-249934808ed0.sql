-- Adicionar campo logo_url à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS logo_url text;