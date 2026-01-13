import { Card } from "@/components/ui/card";
import { FileText, CreditCard, Coins } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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

  // Calculate generic total logic
  const planCredits = subscription ? (subscription.relatorios_disponiveis || 0) - (subscription.relatorios_usados || 0) : 0;
  const extraCredits = subscription?.creditos_extra || 0;
  const totalAvailable = Math.max(0, planCredits) + Math.max(0, extraCredits);

  const hasExpiration = subscription?.data_expiracao;
  const isExpired = hasExpiration && new Date(subscription.data_expiracao) < new Date();

  // Show red if 0 or expired
  const isCritical = totalAvailable === 0 || isExpired;

  return (
    <Card className={`p-4 ${isCritical ? 'bg-destructive/5 border-destructive/20' : 'bg-primary/5 border-primary/20'}`}>
      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${isCritical ? 'bg-destructive/10' : 'bg-primary/10'}`}>
          <Coins className={`h-6 w-6 ${isCritical ? 'text-destructive' : 'text-primary'}`} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            {isExpired ? "Créditos Expirados" : "Créditos Disponíveis"}
          </p>
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold ${isCritical ? 'text-destructive' : 'text-primary'}`}>
              {totalAvailable}
            </span>
            {hasExpiration && !isExpired && (
              <span className="text-xs text-muted-foreground">
                Válido até {new Date(subscription.data_expiracao).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.href = '/dashboard/planos'}
          className="ml-auto"
        >
          Comprar
        </Button>
      </div>
    </Card>
  );
};
