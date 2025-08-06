import React, { useState } from 'react';
import { Plus, Search, Package, Zap, Calculator, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLocation } from 'wouter';

export default function ProductsPro() {
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  const features = [
    {
      icon: Calculator,
      title: "Cálculos Excel Integrados",
      description: "Sistema avançado de cálculos com fórmulas Excel nativas para margens, custos e preços"
    },
    {
      icon: TrendingUp,
      title: "18+ Campos de Custo",
      description: "Controle detalhado de todos os custos: produto, logística, taxas, impostos e margens"
    },
    {
      icon: Zap,
      title: "Multi-Canais Avançado",
      description: "Gerencie preços e configurações para Amazon, Mercado Livre, Shopee e outros marketplaces"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Produtos Pro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Sistema avançado de gerenciamento de produtos com cálculos integrados
          </p>
        </div>
        <Button onClick={() => setLocation('/produtos-novo')} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Produto
        </Button>
      </div>

      {/* Features Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <Card key={index} className="relative">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <IconComponent className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Products Section */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Meus Produtos
            </CardTitle>
            <Badge variant="secondary">Em desenvolvimento</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos por nome, SKU ou marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Nenhum produto cadastrado
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Comece criando seu primeiro produto com o sistema avançado de cálculos
            </p>
            <Button onClick={() => setLocation('/produtos-novo')} className="flex items-center gap-2 mx-auto">
              <Plus className="h-4 w-4" />
              Criar Primeiro Produto
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg mt-1">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Sistema em Desenvolvimento Ativo
              </h4>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                O Produtos Pro está sendo desenvolvido com base no feedback dos usuários. 
                Recursos avançados de cálculo e multi-canais serão lançados em breve.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}