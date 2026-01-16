-- Add AbacatePay gateway
INSERT INTO public.payment_gateways (name, display_name, is_active, config)
VALUES ('abacatepay', 'AbacatePay', true, '{"access_token_key": "ABACATE_PAY_API_KEY"}');

-- Deactivate Mercado Pago (to ensure only one is active)
UPDATE public.payment_gateways 
SET is_active = false 
WHERE name = 'mercadopago';
