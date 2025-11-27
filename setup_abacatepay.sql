-- 1. Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.payment_gateways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- 3. Insert or Update AbacatePay configuration
INSERT INTO public.payment_gateways (name, display_name, is_active, config)
VALUES ('abacatepay', 'AbacatePay', true, '{"access_token_key": "ABACATE_PAY_API_KEY"}')
ON CONFLICT (name) DO UPDATE SET 
  is_active = true,
  config = '{"access_token_key": "ABACATE_PAY_API_KEY"}';

-- 4. Deactivate Mercado Pago (to ensure only one is active)
UPDATE public.payment_gateways 
SET is_active = false 
WHERE name = 'mercadopago';
