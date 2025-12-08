import { Card } from "@/components/ui/card";
import { FileText, CreditCard, Coins } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Skeleton } from "@/components/ui/skeleton";

interface CreditDisplayProps {
  hideReportsLine?: boolean;
}

export const CreditDisplay = ({ hideReportsLine = false }: CreditDisplayProps) => {
  const { subscription, loading } = useSubscription();

  if (loading) {
    return (
      <Card className="p-4">
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="p-4 bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
            <FileText className="h-6 w-6 text-destructive" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">Sem Plano Ativo</p>
            <p className="text-xs text-muted-foreground">
              Assine um plano para criar relatórios
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const available = subscription.relatorios_disponiveis - subscription.relatorios_usados;
  const percentage = (subscription.relatorios_usados / subscription.relatorios_disponiveis) * 100;

  return (
    <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Relatórios Disponíveis</p>
          <div className="flex items-baseline gap-2">
            <Coins className="h-5 w-5 text-primary" />
            <span className="text-2xl font-bold text-primary">{available}</span>
            <span className="text-sm text-muted-foreground">
              de {subscription.relatorios_disponiveis}
            </span>
          </div>
        </div>
      </div>
      {!hideReportsLine && (
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>
            Relatórios: {subscription.relatorios_usados}/{subscription.relatorios_disponiveis} disponíveis
          </span>
        </div>
      )}
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </Card>
  );
};
