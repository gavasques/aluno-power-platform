import React from 'react';
import { useGetFeatureCost } from '@/hooks/useFeatureCosts';
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface AgentCostDisplayProps {
  featureCode: string;
  description?: string;
  className?: string;
}

export function AgentCostDisplay({ 
  featureCode, 
  description = "Custo por uso da IA:", 
  className = "" 
}: AgentCostDisplayProps) {
  const { getFeatureCost } = useGetFeatureCost();
  const cost = getFeatureCost(featureCode);

  if (cost === 0) {
    return (
      <div className={`bg-white/70 px-4 py-2 rounded-lg border ${className}`}>
        <div className="flex items-center gap-2 text-sm">
          <LoadingSpinner size="sm" />
          <span className="text-gray-600">Carregando custo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white/70 px-4 py-2 rounded-lg border ${className}`}>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-600">{description}</span>
        <span className="font-bold text-purple-600">
          {cost} {cost === 1 ? 'crédito' : 'créditos'}
        </span>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        * Cobrado apenas ao usar "Gerar com IA"
      </div>
    </div>
  );
}

export default AgentCostDisplay;