-- Adicionar campos para gestão de saldos acumulados e upgrades de planos
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS saldo_acumulado integer DEFAULT 0;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS data_saldo_expira timestamp with time zone;
ALTER TABLE subscriptions ADD COLUMN IF NOT EXISTS plano_anterior_id uuid;

-- Adicionar campo para data do último relatório no perfil
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS data_ultimo_relatorio timestamp with time zone;

-- Adicionar campos para gerenciar benefícios dos planos
ALTER TABLE plans ADD COLUMN IF NOT EXISTS beneficios jsonb DEFAULT '[]'::jsonb;

-- Adicionar campo para logo do site na landing_content
ALTER TABLE landing_content ADD COLUMN IF NOT EXISTS logo_url text;

-- Criar função para atualizar data do último relatório
CREATE OR REPLACE FUNCTION update_last_report_date()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles
  SET data_ultimo_relatorio = NEW.created_at
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para atualizar automaticamente a data do último relatório
DROP TRIGGER IF EXISTS trigger_update_last_report_date ON avaliacoes;
CREATE TRIGGER trigger_update_last_report_date
AFTER INSERT ON avaliacoes
FOR EACH ROW
EXECUTE FUNCTION update_last_report_date();

-- Criar função para limpar saldos acumulados expirados
CREATE OR REPLACE FUNCTION clean_expired_accumulated_balances()
RETURNS void AS $$
BEGIN
  UPDATE subscriptions
  SET saldo_acumulado = 0,
      data_saldo_expira = NULL,
      plano_anterior_id = NULL
  WHERE data_saldo_expira IS NOT NULL 
    AND data_saldo_expira < NOW()
    AND saldo_acumulado > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;