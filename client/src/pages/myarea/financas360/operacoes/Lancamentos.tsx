import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Search, Filter, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const LancamentosOperacao = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lançamentos</h1>
          <p className="text-muted-foreground">
            Controle suas receitas e despesas financeiras
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            Nova Receita
          </Button>
          <Button className="gap-2">
            <TrendingDown className="h-4 w-4" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Receitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">R$ 0,00</div>
            <div className="text-xs text-green-600">0 lançamentos</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Despesas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">R$ 0,00</div>
            <div className="text-xs text-red-600">0 lançamentos</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">R$ 0,00</div>
            <div className="text-xs text-blue-600">Receitas - Despesas</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-xs text-yellow-600">Vencendo em 7 dias</div>
          </CardContent>
        </Card>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar lançamento..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Todos os tipos</option>
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="vencido">Vencido</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <input
              type="date"
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
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
            <div className="bg-emerald-50 p-6 rounded-full">
              <FileText className="h-12 w-12 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhum lançamento registrado</h3>
              <p className="text-muted-foreground max-w-md">
                Comece registrando suas primeiras receitas e despesas para controlar seu fluxo de caixa
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                Primeira Receita
              </Button>
              <Button className="gap-2">
                <TrendingDown className="h-4 w-4" />
                Primeira Despesa
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="justify-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Venda Produto
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Compra Estoque
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              Pagamento Fornecedor
            </Button>
            <Button variant="outline" size="sm" className="justify-start gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Recebimento Cliente
            </Button>
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
              Este módulo está sendo desenvolvido na Fase 5 do projeto Finanças360
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LancamentosOperacao;