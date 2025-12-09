-- 1. FIX DELETE USER ERROR
-- Drop existing foreign key that prevents deletion
ALTER TABLE public.additional_reports_purchases
DROP CONSTRAINT IF EXISTS additional_reports_purchases_user_id_fkey;

-- Re-add with ON DELETE CASCADE
ALTER TABLE public.additional_reports_purchases
ADD CONSTRAINT additional_reports_purchases_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 2. AUTOMATE BONUS REDEMPTION / PURCHASE PROCESSING
-- Create function to handle new purchases (including bonuses)
CREATE OR REPLACE FUNCTION public.handle_new_purchase()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan_id uuid;
BEGIN
  -- Only process if payment is approved and we haven't processed it yet (optional check)
  IF NEW.payment_status = 'approved' THEN
    
    -- Check if user has a subscription (active or not, we just need a record to attach credits to)
    -- Ideally we want to add to the 'active' one, or the most recent one.
    -- For simplicity: Update the most recent subscription or create new.
    
    IF EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = NEW.user_id) THEN
      -- Add credits to existing subscription (latest updated)
      UPDATE public.subscriptions
      SET relatorios_disponiveis = relatorios_disponiveis + NEW.quantidade,
          updated_at = now()
      WHERE id = (
        SELECT id FROM public.subscriptions 
        WHERE user_id = NEW.user_id 
        ORDER BY updated_at DESC LIMIT 1
      );
    ELSE
      -- User has no subscription, create a default 'Avulso' one
      -- Get ID for 'avulso' plan
      SELECT id INTO v_plan_id FROM public.plans WHERE tipo = 'avulso' LIMIT 1;
      
      -- If plan exists (it should), create subscription
      IF v_plan_id IS NOT NULL THEN
        INSERT INTO public.subscriptions (
          user_id,
          plan_id,
          status,
          relatorios_disponiveis,
          relatorios_usados,
          data_inicio
        ) VALUES (
          NEW.user_id,
          v_plan_id,
          'active',
          NEW.quantidade, -- The bonus amount
          0,
          now()
        );
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create Trigger
DROP TRIGGER IF EXISTS on_purchase_created ON public.additional_reports_purchases;

CREATE TRIGGER on_purchase_created
  AFTER INSERT ON public.additional_reports_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_purchase();
