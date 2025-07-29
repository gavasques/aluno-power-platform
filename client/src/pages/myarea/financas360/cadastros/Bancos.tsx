import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Landmark, Plus, Search, Filter } from 'lucide-react';

const BancosCadastro = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bancos</h1>
          <p className="text-muted-foreground">
            Cadastro das instituições bancárias utilizadas
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Banco
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
                  placeholder="Buscar por nome ou código do banco..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>
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
            <div className="bg-green-50 p-6 rounded-full">
              <Landmark className="h-12 w-12 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhum banco cadastrado</h3>
              <p className="text-muted-foreground max-w-md">
                Cadastre os bancos que você utiliza para facilitar o controle das contas bancárias
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Primeiro Banco
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bancos Populares - Sugestão */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Bancos Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { codigo: '001', nome: 'Banco do Brasil' },
              { codigo: '104', nome: 'Caixa Econômica' },
              { codigo: '341', nome: 'Itaú' },
              { codigo: '033', nome: 'Santander' },
              { codigo: '237', nome: 'Bradesco' },
              { codigo: '260', nome: 'Nu Pagamentos' },
              { codigo: '336', nome: 'C6 Bank' },
              { codigo: '077', nome: 'Inter' }
            ].map((banco) => (
              <div key={banco.codigo} className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                <div className="font-semibold text-sm">{banco.codigo}</div>
                <div className="text-xs text-muted-foreground">{banco.nome}</div>
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

export default BancosCadastro;