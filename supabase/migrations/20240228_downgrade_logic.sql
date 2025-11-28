-- Add columns for legacy credits logic
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS legacy_credits integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS legacy_credits_expires_at timestamp with time zone;
