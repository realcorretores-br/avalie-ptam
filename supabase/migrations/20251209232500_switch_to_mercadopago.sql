-- Deactivate all gateways
UPDATE payment_gateways SET is_active = false;

-- Activate Mercado Pago
UPDATE payment_gateways 
SET is_active = true,
    config = jsonb_build_object(
        'public_key', 'APP_USR-1a1eaee9-9823-4462-8792-0d46fd19517b',
        'access_token_key', 'MERCADO_PAGO_ACCESS_TOKEN', -- Key used in Edge Function to find the secret (we will hardcode the value in the function text for now)
        'client_id', '4196436067933490',
        'client_secret_key', 'MERCADO_PAGO_CLIENT_SECRET'
    )
WHERE name = 'mercadopago';
