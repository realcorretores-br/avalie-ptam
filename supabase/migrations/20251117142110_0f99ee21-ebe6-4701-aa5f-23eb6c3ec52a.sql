-- Add expires_at column to additional_reports_purchases for 30-day credit expiration
ALTER TABLE additional_reports_purchases 
ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

-- Add payment_method_id to subscriptions for automatic card billing
ALTER TABLE subscriptions 
ADD COLUMN payment_method_id TEXT;

-- Create index for efficient expiration queries
CREATE INDEX idx_additional_reports_expires_at 
ON additional_reports_purchases(expires_at) 
WHERE status = 'approved';

CREATE INDEX idx_additional_reports_pending_expiry 
ON additional_reports_purchases(created_at) 
WHERE status = 'pending';