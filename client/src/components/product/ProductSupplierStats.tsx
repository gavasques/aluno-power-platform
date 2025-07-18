/**
 * Product Supplier Statistics Component
 * 
 * SOLID Principles Applied:
 * - SRP: Single responsibility for supplier statistics display
 * - OCP: Open for extension with new statistics
 * - LSP: Consistent component interface
 * - ISP: Interface segregation with focused props
 * - DIP: Depends on abstractions through props
 */

import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Package, 
  Clock, 
  DollarSign, 
  Users, 
  CheckCircle,
  XCircle,
  BarChart3,
  Activity,
  Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ProductSupplierStatsUtils } from '@/shared/utils/productSupplierUtils';
import type { ProductSupplierStats } from '@/shared/types/productSupplier';

interface ProductSupplierStatsProps {
  stats: ProductSupplierStats;
  productId: number;
}

export const ProductSupplierStats: React.FC<ProductSupplierStatsProps> = ({
  stats,
  productId
}) => {
  // Calculate percentage of active suppliers
  const activePercentage = stats.totalSuppliers > 0 
    ? (stats.activeSuppliers / stats.totalSuppliers) * 100 
    : 0;

  // Calculate cost difference between highest and lowest
  const costDifference = stats.highestCost - stats.lowestCost;
  const costDifferencePercentage = stats.lowestCost > 0 
    ? ((costDifference / stats.lowestCost) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Suppliers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fornecedores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSuppliers} ativos, {stats.inactiveSuppliers} inativos
            </p>
          </CardContent>
        </Card>

        {/* Active Suppliers */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fornecedores Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activeSuppliers}</div>
            <div className="mt-2">
              <Progress value={activePercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {activePercentage.toFixed(1)}% do total
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Average Cost */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {ProductSupplierUtils.formatCurrency(stats.avgCost)}
            </div>
            <p className="text-xs text-muted-foreground">
              Média entre todos os fornecedores
            </p>
          </CardContent>
        </Card>

        {/* Average Lead Time */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.avgLeadTime ? `${stats.avgLeadTime.toFixed(0)} dias` : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Tempo médio de entrega
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Range Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Análise de Custos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Menor Custo</span>
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-bold">
                    {ProductSupplierUtils.formatCurrency(stats.lowestCost)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Maior Custo</span>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <span className="text-red-600 font-bold">
                    {ProductSupplierUtils.formatCurrency(stats.highestCost)}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Diferença</span>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span className="text-blue-600 font-bold">
                    {ProductSupplierUtils.formatCurrency(costDifference)}
                  </span>
                </div>
              </div>
            </div>
            
            {costDifferencePercentage > 0 && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    Oportunidade de Economia
                  </span>
                </div>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  Diferença de {costDifferencePercentage.toFixed(1)}% entre o menor e maior custo
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Primary Supplier Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Fornecedor Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.primarySupplier ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={stats.primarySupplier.supplier?.logo} 
                      alt={stats.primarySupplier.supplier?.tradeName} 
                    />
                    <AvatarFallback>
                      {stats.primarySupplier.supplier?.tradeName?.charAt(0) || 'N'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {stats.primarySupplier.supplier?.tradeName || 'N/A'}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.primarySupplier.supplier?.corporateName || 'N/A'}
                    </p>
                  </div>
                  <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Principal
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500 mb-1">Código do Produto</p>
                    <p className="font-medium">{stats.primarySupplier.supplierProductCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Custo</p>
                    <p className="font-medium text-green-600">
                      {ProductSupplierUtils.formatCurrency(stats.primarySupplier.supplierCost)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Tempo de Entrega</p>
                    <p className="font-medium">
                      {stats.primarySupplier.leadTime ? `${stats.primarySupplier.leadTime} dias` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Status</p>
                    <div className="flex items-center gap-1">
                      {stats.primarySupplier.active ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className={stats.primarySupplier.active ? 'text-green-600' : 'text-red-600'}>
                        {stats.primarySupplier.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum fornecedor principal definido</p>
                <p className="text-sm text-gray-400 mt-1">
                  Defina um fornecedor como principal para melhor organização
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Status dos Fornecedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.activeSuppliers}
              </div>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Ativos</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Disponíveis para pedidos
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {stats.inactiveSuppliers}
              </div>
              <div className="flex items-center justify-center gap-2 text-red-600">
                <XCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Inativos</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Temporariamente indisponíveis
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {stats.primarySupplier ? 1 : 0}
              </div>
              <div className="flex items-center justify-center gap-2 text-yellow-600">
                <Star className="h-4 w-4" />
                <span className="text-sm font-medium">Principal</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Fornecedor prioritário
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};