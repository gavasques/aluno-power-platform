import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus, Search, Filter } from 'lucide-react';

const FormasPagamentoCadastro = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Formas de Pagamento</h1>
          <p className="text-muted-foreground">
            Configure os métodos de pagamento e suas taxas
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Forma
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
                  placeholder="Buscar forma de pagamento..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="">Todos os tipos</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="pix">PIX</option>
              <option value="boleto">Boleto</option>
              <option value="transferencia">Transferência</option>
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
            <div className="bg-orange-50 p-6 rounded-full">
              <Receipt className="h-12 w-12 text-orange-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhuma forma de pagamento cadastrada</h3>
              <p className="text-muted-foreground max-w-md">
                Configure as formas de pagamento que você aceita, com suas respectivas taxas e prazos
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Primeira Forma
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Formas Populares - Sugestão */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Formas Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { nome: 'PIX', tipo: 'pix', taxa: '0%' },
              { nome: 'Dinheiro', tipo: 'dinheiro', taxa: '0%' },
              { nome: 'Cartão Débito', tipo: 'cartao_debito', taxa: '1-2%' },
              { nome: 'Cartão Crédito', tipo: 'cartao_credito', taxa: '2-4%' },
              { nome: 'Boleto', tipo: 'boleto', taxa: 'R$ 2-5' },
              { nome: 'Transferência', tipo: 'transferencia', taxa: '0-1%' }
            ].map((forma) => (
              <div key={forma.tipo} className="p-3 bg-white rounded-lg border border-blue-200">
                <div className="font-semibold text-sm">{forma.nome}</div>
                <div className="text-xs text-muted-foreground">Taxa típica: {forma.taxa}</div>
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

export default FormasPagamentoCadastro;