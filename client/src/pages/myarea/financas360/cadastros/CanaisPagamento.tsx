import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Plus, Search, Filter } from 'lucide-react';

const CanaisPagamentoCadastro = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Canais de Pagamento</h1>
          <p className="text-muted-foreground">
            Configure gateways, maquininhas e processadores de pagamento
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Canal
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
                  placeholder="Buscar canal de pagamento..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500">
              <option value="">Todos os tipos</option>
              <option value="gateway">Gateway</option>
              <option value="maquininha">Maquininha</option>
              <option value="banco">Banco</option>
              <option value="fintech">Fintech</option>
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
            <div className="bg-pink-50 p-6 rounded-full">
              <ArrowLeftRight className="h-12 w-12 text-pink-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhum canal de pagamento cadastrado</h3>
              <p className="text-muted-foreground max-w-md">
                Configure seus gateways de pagamento, maquininhas e processadores para controlar taxas e prazos
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Primeiro Canal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Canais Populares - Sugestão */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Canais Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { nome: 'PagSeguro', tipo: 'gateway', taxa: '2.9%' },
              { nome: 'Mercado Pago', tipo: 'gateway', taxa: '2.7%' },
              { nome: 'Stone', tipo: 'maquininha', taxa: '1.5%' },
              { nome: 'GetNet', tipo: 'maquininha', taxa: '1.6%' },
              { nome: 'Stripe', tipo: 'gateway', taxa: '3.4%' },
              { nome: 'PayPal', tipo: 'gateway', taxa: '4.9%' },
              { nome: 'Cielo', tipo: 'maquininha', taxa: '1.8%' },
              { nome: 'Rede', tipo: 'maquininha', taxa: '1.7%' }
            ].map((canal) => (
              <div key={canal.nome} className="p-3 bg-white rounded-lg border border-blue-200">
                <div className="font-semibold text-sm">{canal.nome}</div>
                <div className="text-xs text-muted-foreground capitalize">{canal.tipo}</div>
                <div className="text-xs text-blue-600">Taxa: {canal.taxa}</div>
              </div>
            ))}
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

export default CanaisPagamentoCadastro;