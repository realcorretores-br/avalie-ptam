-- Run this in your Supabase SQL Editor

-- 1. Add unique constraint to profiles.cpf
ALTER TABLE profiles ADD CONSTRAINT profiles_cpf_unique UNIQUE (cpf);

-- 2. Create RPC function to check CPF availability securely
CREATE OR REPLACE FUNCTION check_cpf_availability(cpf_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM profiles WHERE cpf = cpf_to_check);
END;
$$;

-- 3. Grant access to the function
GRANT EXECUTE ON FUNCTION check_cpf_availability(text) TO anon, authenticated, service_role;
