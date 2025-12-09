-- Fix System Settings RLS
-- Allow admins to INSERT into system_settings (required for upsert if row missing or logically strictly required)
CREATE POLICY "Allow admin insert access" ON public.system_settings FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- Add 'pending_credits' to profiles for the bonus feature
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS creditos_pendentes int DEFAULT 0;

-- Update handle_new_user to give 1 pending credit to new users
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
    cep,
    creditos_pendentes
  )
  VALUES (
    new.id, 
    new.email,
    COALESCE(new.raw_user_meta_data->>'nome_completo', ''),
    COALESCE(new.raw_user_meta_data->>'telefone', ''),
    COALESCE(new.raw_user_meta_data->>'endereco', ''),
    COALESCE(new.raw_user_meta_data->>'cidade', ''),
    COALESCE(new.raw_user_meta_data->>'estado', ''),
    COALESCE(new.raw_user_meta_data->>'cep', ''),
    1 -- Give 1 pending credit by default
  );
  RETURN new;
END;
$$;
