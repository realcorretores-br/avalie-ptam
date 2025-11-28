-- Remove unique constraint on 'tipo' if it exists, to allow multiple plans of the same type
ALTER TABLE plans DROP CONSTRAINT IF EXISTS plans_tipo_key;

-- Create 'Plano Gratuito' if it doesn't exist
INSERT INTO plans (nome, descricao, preco, relatorios_incluidos, tipo, ativo)
SELECT 'Plano Gratuito', 'Plano inicial com 1 crédito grátis', 0, 1, 'avulso', true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE nome = 'Plano Gratuito');

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  free_plan_id uuid;
BEGIN
  -- Get the free plan ID
  SELECT id INTO free_plan_id FROM plans WHERE nome = 'Plano Gratuito' LIMIT 1;

  IF free_plan_id IS NOT NULL THEN
    -- Create a profile for the user (if not already handled by another trigger, but usually good to ensure)
    -- Assuming profile creation is handled elsewhere or we just need the subscription.
    -- Let's focus on the subscription.

    INSERT INTO public.subscriptions (
      user_id,
      plan_id,
      status,
      payment_status,
      relatorios_disponiveis,
      relatorios_usados,
      data_inicio
    ) VALUES (
      new.id,
      free_plan_id,
      'active',
      'approved',
      1,
      0,
      now()
    );
  END IF;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created_bonus ON auth.users;
CREATE TRIGGER on_auth_user_created_bonus
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
