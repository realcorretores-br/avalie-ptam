-- Enable Asaas Gateway and set credentials
UPDATE payment_gateways
SET 
  is_active = false
WHERE id != '00000000-0000-0000-0000-000000000000'; -- Deactivate others

INSERT INTO payment_gateways (name, display_name, is_active, config)
VALUES (
  'asaas', 
  'Asaas', 
  true, 
  '{
    "access_token_key": "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmQ2MzM1NGVmLWI4ZDAtNDFhYS1hZjYzLTc3MmZmOTNjY2NiYzo6JGFhY2hfNjM5MGRlZDItZWE4Ny00YWUyLWIwOGQtYjRmYmVjNDVhNThh",
    "wallet_id": "df29797b-174e-4f44-bde3-77bff0039e74",
    "environment": "sandbox"
  }'::jsonb
)
ON CONFLICT (name) DO UPDATE
SET 
  is_active = true,
  config = '{
    "access_token_key": "$aact_hmlg_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmQ2MzM1NGVmLWI4ZDAtNDFhYS1hZjYzLTc3MmZmOTNjY2NiYzo6JGFhY2hfNjM5MGRlZDItZWE4Ny00YWUyLWIwOGQtYjRmYmVjNDVhNThh",
    "wallet_id": "df29797b-174e-4f44-bde3-77bff0039e74",
    "environment": "sandbox"
  }'::jsonb;
