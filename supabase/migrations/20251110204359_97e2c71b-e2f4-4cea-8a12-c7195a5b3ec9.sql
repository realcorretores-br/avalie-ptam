-- Add auto_renew column to subscriptions table
ALTER TABLE public.subscriptions 
ADD COLUMN auto_renew BOOLEAN NOT NULL DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN public.subscriptions.auto_renew IS 'Controls whether the subscription should automatically renew when it expires (only applicable to monthly plans)';
