import React from 'react';
import { BaseWidget } from './BaseWidget';
import { Badge } from '@/components/ui/badge';
import { Users, Star, Shield, TrendingUp } from 'lucide-react';
import { usePartners } from '@/lib/hooks/partner/usePartner';
import { useQuery } from '@tanstack/react-query';
import type { PartnerType } from '@shared/schema';

interface PartnerStatsData {
  total: number;
  verified: number;
  averageRating: number;
  totalReviews: number;
  topTypes: Array<{ type: string; count: number }>;
}

export const PartnerStatsWidget: React.FC = () => {
  const { data: partners = [], isLoading: partnersLoading, error: partnersError } = usePartners();
  
  const { data: partnerTypes = [] } = useQuery<PartnerType[]>({
    queryKey: ['/api/partner-types'],
    queryFn: async () => {
      const response = await fetch('/api/partner-types');
      if (!response.ok) throw new Error('Failed to fetch partner types');
      return response.json();
    }
  });

  const isLoading = partnersLoading;
  const error = partnersError?.message;

  // Calculate statistics from real data
  const stats: PartnerStatsData = React.useMemo(() => {
    if (!partners.length) {
      return {
        total: 0,
        verified: 0,
        averageRating: 0,
        totalReviews: 0,
        topTypes: []
      };
    }

    const verified = partners.filter(p => p.isVerified).length;
    const totalReviews = partners.reduce((sum, p) => sum + (p.totalReviews || 0), 0);
    const avgRating = partners.reduce((sum, p) => sum + parseFloat(p.averageRating || '0'), 0) / partners.length;

    // Calculate top partner types
    const typeCounts = partners.reduce((acc, partner) => {
      if (partner.partnerTypeId) {
        const type = partnerTypes.find(t => t.id === partner.partnerTypeId);
        if (type) {
          acc[type.name] = (acc[type.name] || 0) + 1;
        }
      }
      return acc;
    }, {} as Record<string, number>);

    const topTypes = Object.entries(typeCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    return {
      total: partners.length,
      verified,
      averageRating: avgRating,
      totalReviews,
      topTypes
    };
  }, [partners, partnerTypes]);

  return (
    <BaseWidget
      title="Estatísticas de Parceiros"
      icon={<Users className="h-4 w-4" />}
      isLoading={isLoading}
      error={error}
    >
      <div className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-xs text-gray-500">Total de Parceiros</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
            <div className="text-xs text-gray-500">Verificados</div>
          </div>
        </div>

        {/* Rating and Reviews */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-lg font-semibold">{stats.averageRating.toFixed(1)}</span>
            </div>
            <div className="text-xs text-gray-500">Avaliação Média</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold">{stats.totalReviews}</div>
            <div className="text-xs text-gray-500">Total de Avaliações</div>
          </div>
        </div>

        {/* Top Partner Types */}
        {stats.topTypes.length > 0 && (
          <div>
            <div className="text-sm font-medium mb-2">Principais Categorias</div>
            <div className="space-y-2">
              {stats.topTypes.map(({ type, count }) => (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{type}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification Rate */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Taxa de Verificação</span>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3 text-green-500" />
              <span className="font-medium">
                {stats.total > 0 ? Math.round((stats.verified / stats.total) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </BaseWidget>
  );
};