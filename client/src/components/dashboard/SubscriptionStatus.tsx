import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Calendar, CheckCircle, XCircle } from 'lucide-react';

interface SubscriptionStatusProps {
  subscription?: {
    planName: string;
    status: string;
    nextBilling?: string | null;
    billingCycle: string;
  } | null;
  onManage: () => void;
}

export function SubscriptionStatus({ subscription, onManage }: SubscriptionStatusProps) {
  const isActive = subscription?.status === 'active';
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          Status da Assinatura
        </CardTitle>
        <Crown className={`h-4 w-4 ${isActive ? 'text-yellow-500' : 'text-gray-400'}`} />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Plan Name */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">
              {subscription?.planName || 'Sem Plano'}
            </span>
            <Badge variant={isActive ? 'default' : 'secondary'}>
              {isActive ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativa
                </>
              ) : (
                <>
                  <XCircle className="h-3 w-3 mr-1" />
                  Inativa
                </>
              )}
            </Badge>
          </div>

          {/* Next Billing */}
          {subscription?.nextBilling && isActive && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>
                Próxima cobrança: {new Date(subscription.nextBilling).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}

          {/* Billing Cycle */}
          {subscription?.billingCycle && (
            <div className="text-xs text-muted-foreground">
              Ciclo: {subscription.billingCycle === 'monthly' ? 'Mensal' : 'Anual'}
            </div>
          )}

          {/* Action Button */}
          <Button 
            onClick={onManage} 
            variant={isActive ? "outline" : "default"} 
            className="w-full"
          >
            {isActive ? 'Gerenciar Assinatura' : 'Assinar Plano'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}