INSERT INTO public.payment_gateways (name, display_name, is_active, config)
VALUES ('mercadopago', 'Mercado Pago', true, '{"access_token_key": "MERCADO_PAGO_ACCESS_TOKEN"}')
ON CONFLICT (name) DO UPDATE
SET is_active = true,
    config = '{"access_token_key": "MERCADO_PAGO_ACCESS_TOKEN"}';
