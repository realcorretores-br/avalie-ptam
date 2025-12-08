-- Function to check low credits and insert notification
CREATE OR REPLACE FUNCTION public.check_low_credits()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if relatorios_disponiveis dropped to 3 or below (and wasn't already)
    -- To avoid spamming, we could check if it was > 3 before.
    -- Or just check if it IS 3 now.
    
    IF NEW.relatorios_disponiveis = 3 AND (OLD.relatorios_disponiveis > 3 OR OLD.relatorios_disponiveis IS NULL) THEN
        INSERT INTO public.notifications (user_id, title, message, is_mass)
        VALUES (
            NEW.user_id,
            'Seus créditos estão acabando!',
            'Você tem apenas 3 relatórios restantes. Recarregue agora para não ficar na mão.',
            false
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
DROP TRIGGER IF EXISTS on_low_credits ON public.subscriptions;

CREATE TRIGGER on_low_credits
AFTER UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.check_low_credits();
