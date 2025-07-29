import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Plus, Search, Filter } from 'lucide-react';

const EstruturaDRECadastro = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Estrutura DRE</h1>
          <p className="text-muted-foreground">
            Configure a estrutura do Demonstrativo de Resultados do Exercício
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Item DRE
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar por código ou descrição..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Todos os tipos</option>
              <option value="receita">Receita</option>
              <option value="custo">Custo</option>
              <option value="despesa">Despesa</option>
            </select>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500">
              <option value="">Todos os níveis</option>
              <option value="1">Nível 1</option>
              <option value="2">Nível 2</option>
              <option value="3">Nível 3</option>
            </select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estado Vazio */}
      <Card className="text-center py-12">
        <CardContent>
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-teal-50 p-6 rounded-full">
              <BarChart3 className="h-12 w-12 text-teal-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhum item DRE cadastrado</h3>
              <p className="text-muted-foreground max-w-md">
                Configure a estrutura do DRE para classificar receitas, custos e despesas adequadamente
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Configurar Estrutura DRE
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estrutura Sugerida */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Estrutura DRE Padrão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="font-semibold text-green-800">📈 RECEITAS</div>
            <div className="ml-4 space-y-1">
              <div className="text-sm">1.1 - Receita Bruta de Vendas</div>
              <div className="text-sm">1.2 - Deduções das Vendas</div>
              <div className="text-sm font-semibold">1.3 - Receita Líquida</div>
            </div>
            
            <div className="font-semibold text-red-800">📉 CUSTOS</div>
            <div className="ml-4 space-y-1">
              <div className="text-sm">2.1 - Custo dos Produtos Vendidos</div>
              <div className="text-sm">2.2 - Custo de Aquisição</div>
            </div>
            
            <div className="font-semibold text-orange-800">💰 DESPESAS</div>
            <div className="ml-4 space-y-1">
              <div className="text-sm">3.1 - Despesas Operacionais</div>
              <div className="text-sm">3.2 - Despesas Administrativas</div>
              <div className="text-sm">3.3 - Despesas Financeiras</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status de Desenvolvimento */}
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
              Em Desenvolvimento
            </Badge>
            <span className="text-sm text-orange-800">
              Este módulo está sendo desenvolvido na Fase 4 do projeto Finanças360
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EstruturaDRECadastro;