-- Corrigir função de atualizar data do último relatório com search_path
CREATE OR REPLACE FUNCTION update_last_report_date()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET data_ultimo_relatorio = NEW.created_at
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Corrigir função de limpar saldos acumulados expirados com search_path
CREATE OR REPLACE FUNCTION clean_expired_accumulated_balances()
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE subscriptions
  SET saldo_acumulado = 0,
      data_saldo_expira = NULL,
      plano_anterior_id = NULL
  WHERE data_saldo_expira IS NOT NULL 
    AND data_saldo_expira < NOW()
    AND saldo_acumulado > 0;
END;
$$;