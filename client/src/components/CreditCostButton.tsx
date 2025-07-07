import { Button } from '@/components/ui/button';
import { useGetFeatureCost, formatCredits, useCanProcessFeature } from '@/hooks/useFeatureCosts';
import { Badge } from '@/components/ui/badge';
import { CreditCard, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditCostButtonProps {
  featureName: string;
  userBalance: number;
  onProcess: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function CreditCostButton({
  featureName,
  userBalance,
  onProcess,
  children,
  disabled = false,
  className,
  variant = "default",
  size = "default"
}: CreditCostButtonProps) {
  const { getFeatureCost, isLoading: costsLoading } = useGetFeatureCost();
  const { canProcess } = useCanProcessFeature();
  
  const requiredCredits = getFeatureCost(featureName);
  const { canProcess: canAfford, missingCredits } = canProcess(featureName, userBalance);
  
  const isDisabled = disabled || costsLoading || !canAfford;
  
  if (costsLoading) {
    return (
      <Button disabled className={className} variant={variant} size={size}>
        Carregando...
      </Button>
    );
  }
  
  return (
    <div className="flex flex-col gap-2">
      <Button
        onClick={onProcess}
        disabled={isDisabled}
        className={cn(
          "relative",
          !canAfford && "opacity-60 cursor-not-allowed",
          className
        )}
        variant={variant}
        size={size}
      >
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          {children}
          {requiredCredits > 0 && (
            <Badge 
              variant={canAfford ? "secondary" : "destructive"} 
              className="ml-2 text-xs"
            >
              {formatCredits(requiredCredits)}
            </Badge>
          )}
        </div>
      </Button>
      
      {!canAfford && requiredCredits > 0 && (
        <div className="flex items-center gap-1 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span>
            Você precisa de mais {formatCredits(missingCredits)} para usar esta ferramenta
          </span>
        </div>
      )}
      
      {canAfford && requiredCredits > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          Esta ação irá consumir {formatCredits(requiredCredits)}
        </div>
      )}
    </div>
  );
}

// Versão simplificada apenas com o badge de custo
interface CreditCostBadgeProps {
  featureName: string;
  className?: string;
}

export function CreditCostBadge({ featureName, className }: CreditCostBadgeProps) {
  const { getFeatureCost, isLoading } = useGetFeatureCost();
  
  if (isLoading) return null;
  
  const cost = getFeatureCost(featureName);
  
  if (cost === 0) return null;
  
  return (
    <Badge variant="outline" className={cn("text-xs", className)}>
      <CreditCard className="h-3 w-3 mr-1" />
      {formatCredits(cost)}
    </Badge>
  );
}