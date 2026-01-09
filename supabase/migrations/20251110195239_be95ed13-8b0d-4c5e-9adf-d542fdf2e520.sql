-- Create payment_gateways table
CREATE TABLE public.payment_gateways (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;

-- Admins can manage payment gateways
CREATE POLICY "Admins can manage payment gateways"
ON public.payment_gateways
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Everyone can view active gateway
CREATE POLICY "Everyone can view active gateway"
ON public.payment_gateways
FOR SELECT
TO authenticated
USING (is_active = true);

-- Insert default Mercado Pago gateway
INSERT INTO public.payment_gateways (name, display_name, is_active, config)
VALUES ('mercadopago', 'Mercado Pago', true, '{"access_token_key": "MERCADO_PAGO_ACCESS_TOKEN"}');

-- Add trigger for updated_at
CREATE TRIGGER update_payment_gateways_updated_at
BEFORE UPDATE ON public.payment_gateways
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();