import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Plus, Search, Filter, ArrowLeft, ArrowRight, Clock, CheckCircle } from 'lucide-react';

const DevolucoesOperacao = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Devoluções</h1>
          <p className="text-muted-foreground">
            Controle de devoluções de clientes e fornecedores
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Devolução
        </Button>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <ArrowLeft className="h-5 w-5" />
              De Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-xs text-red-600">R$ 0,00</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Para Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-xs text-blue-600">R$ 0,00</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">0</div>
            <div className="text-xs text-yellow-600">Aguardando processamento</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Processadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-xs text-green-600">Concluídas</div>
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
                placeholder="Buscar devolução..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Todos os tipos</option>
              <option value="cliente">De Cliente</option>
              <option value="fornecedor">Para Fornecedor</option>
            </select>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="processada">Processada</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <input
              type="date"
              placeholder="Data devolução"
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
            <div className="bg-red-50 p-6 rounded-full">
              <RefreshCw className="h-12 w-12 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhuma devolução registrada</h3>
              <p className="text-muted-foreground max-w-md">
                Registre devoluções de clientes e para fornecedores para manter seu controle financeiro atualizado
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Registrar Primeira Devolução
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Motivos Comuns */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Motivos Comuns de Devolução</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              'Produto defeituoso',
              'Não conforme',
              'Arrependimento',
              'Erro no pedido',
              'Avaria no transporte',
              'Vencimento próximo',
              'Garantia',
              'Outros'
            ].map((motivo) => (
              <div key={motivo} className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                <div className="text-sm font-medium">{motivo}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fluxo de Processo */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">Fluxo de Processo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">1</span>
              </div>
              <div className="text-sm font-medium">Solicitação</div>
            </div>
            <div className="h-1 bg-gray-300 flex-1 mx-2"></div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">2</span>
              </div>
              <div className="text-sm font-medium">Análise</div>
            </div>
            <div className="h-1 bg-gray-300 flex-1 mx-2"></div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">3</span>
              </div>
              <div className="text-sm font-medium">Aprovação</div>
            </div>
            <div className="h-1 bg-gray-300 flex-1 mx-2"></div>
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <span className="text-xl">4</span>
              </div>
              <div className="text-sm font-medium">Processamento</div>
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
              Este módulo está sendo desenvolvido na Fase 5 do projeto Finanças360
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DevolucoesOperacao;