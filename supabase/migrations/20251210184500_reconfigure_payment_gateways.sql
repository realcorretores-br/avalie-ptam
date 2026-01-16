-- Ensure payment_gateways table exists (idempotent check)
CREATE TABLE IF NOT EXISTS payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn off all other gateways
UPDATE payment_gateways SET is_active = false;

-- Insert or Update Mercado Pago configuration
INSERT INTO payment_gateways (name, display_name, is_active, config)
VALUES (
    'mercadopago',
    'Mercado Pago',
    true,
    jsonb_build_object(
        'public_key', 'APP_USR-1a1eaee9-9823-4462-8792-0d46fd19517b',
        'access_token', 'APP_USR-4196436067933490-102406-f5fbb599bd45ccd66aad2fe22e8829dd-287066595',
        'client_id', '4196436067933490',
        'client_secret', 'GwBQ1ZyHhtnRAyiJTy3KFw6FWEqreW7h'
    )
)
ON CONFLICT (name) DO UPDATE
SET 
    display_name = EXCLUDED.display_name,
    is_active = true,
    config = jsonb_build_object(
        'public_key', 'APP_USR-1a1eaee9-9823-4462-8792-0d46fd19517b',
        'access_token', 'APP_USR-4196436067933490-102406-f5fbb599bd45ccd66aad2fe22e8829dd-287066595',
        'client_id', '4196436067933490',
        'client_secret', 'GwBQ1ZyHhtnRAyiJTy3KFw6FWEqreW7h'
    ),
    updated_at = now();
