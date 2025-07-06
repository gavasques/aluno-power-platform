import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Calendar, CreditCard, ArrowUpRight } from 'lucide-react';

interface SubscriptionInfo {
  planName?: string;
  status?: string;
  nextBilling?: string | Date | null;
  billingCycle?: string;
}

interface SubscriptionCardProps {
  subscription?: SubscriptionInfo | null;
  onManage?: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onManage
}) => {
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'cancelled': return 'Cancelado';
      case 'expired': return 'Expirado';
      case 'suspended': return 'Suspenso';
      default: return 'Inativo';
    }
  };

  const getBillingCycleLabel = (cycle?: string) => {
    switch (cycle) {
      case 'monthly': return 'Mensal';
      case 'yearly': return 'Anual';
      default: return 'N/A';
    }
  };

  const isFreePlan = !subscription || !subscription.planName || subscription.planName === 'Gratuito';

  return (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Assinatura</CardTitle>
        <div className="flex items-center gap-2">
          {!isFreePlan && (
            <Crown className="h-4 w-4 text-yellow-500" />
          )}
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Plan Info */}
          <div>
            <div className="text-2xl font-bold">
              {subscription?.planName || 'Plano Gratuito'}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                className={getStatusColor(subscription?.status)}
                variant="secondary"
              >
                {getStatusLabel(subscription?.status)}
              </Badge>
              {subscription?.billingCycle && (
                <span className="text-xs text-muted-foreground">
                  • {getBillingCycleLabel(subscription.billingCycle)}
                </span>
              )}
            </div>
          </div>

          {/* Next Billing */}
          {subscription?.nextBilling && subscription.status === 'active' && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Próxima cobrança
                </p>
                <p className="text-xs text-blue-700">
                  {formatDate(subscription.nextBilling)}
                </p>
              </div>
            </div>
          )}

          {/* Free Plan Benefits */}
          {isFreePlan && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Você está no plano gratuito
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Acesso básico às ferramentas</li>
                <li>• Créditos limitados por mês</li>
                <li>• Suporte por email</li>
              </ul>
            </div>
          )}

          {/* Premium Plan Benefits */}
          {!isFreePlan && subscription?.status === 'active' && (
            <div className="space-y-2">
              <p className="text-xs text-green-600 font-medium">
                ✓ Acesso premium ativo
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Créditos ilimitados</li>
                <li>• Todas as ferramentas disponíveis</li>
                <li>• Suporte prioritário</li>
                <li>• Relatórios avançados</li>
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2">
            {isFreePlan ? (
              <Button onClick={onManage} className="w-full" size="sm">
                <ArrowUpRight className="h-4 w-4 mr-2" />
                Fazer Upgrade
              </Button>
            ) : (
              <Button onClick={onManage} variant="outline" className="w-full" size="sm">
                Gerenciar Assinatura
              </Button>
            )}
          </div>

          {/* Savings Indicator for Yearly Plans */}
          {subscription?.billingCycle === 'yearly' && subscription.status === 'active' && (
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 font-medium">
                🎉 Você economiza 20% com o plano anual
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};