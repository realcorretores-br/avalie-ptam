-- 1. Deactivate AbacatePay
UPDATE public.payment_gateways 
SET is_active = false 
WHERE name = 'abacatepay';

-- 2. Insert or Update Mercado Pago configuration
INSERT INTO public.payment_gateways (name, display_name, is_active, config)
VALUES ('mercadopago', 'Mercado Pago', true, '{"access_token_key": "MERCADO_PAGO_ACCESS_TOKEN"}')
ON CONFLICT (name) DO UPDATE SET 
  is_active = true,
  config = '{"access_token_key": "MERCADO_PAGO_ACCESS_TOKEN"}';

-- 3. Verify the change
SELECT name, is_active, config FROM public.payment_gateways;
