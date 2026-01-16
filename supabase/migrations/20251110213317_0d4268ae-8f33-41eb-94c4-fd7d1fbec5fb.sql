-- Create table for additional report purchases
CREATE TABLE IF NOT EXISTS public.additional_reports_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  subscription_id UUID REFERENCES public.subscriptions(id),
  quantidade INTEGER NOT NULL,
  preco_unitario NUMERIC NOT NULL DEFAULT 34.99,
  preco_total NUMERIC NOT NULL,
  payment_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.additional_reports_purchases ENABLE ROW LEVEL SECURITY;

-- Policies for additional_reports_purchases
CREATE POLICY "Users can view own purchases"
  ON public.additional_reports_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own purchases"
  ON public.additional_reports_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all purchases"
  ON public.additional_reports_purchases
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage purchases"
  ON public.additional_reports_purchases
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster queries
CREATE INDEX idx_additional_reports_user_id ON public.additional_reports_purchases(user_id);
CREATE INDEX idx_additional_reports_subscription_id ON public.additional_reports_purchases(subscription_id);