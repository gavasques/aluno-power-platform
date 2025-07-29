import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Search, Filter } from 'lucide-react';

const ParceirosCadastro = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Parceiros</h1>
          <p className="text-muted-foreground">
            Gerencie clientes, fornecedores e parceiros comerciais
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Parceiro
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
                  placeholder="Buscar por nome, CPF/CNPJ..."
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500">
              <option value="">Todos os tipos</option>
              <option value="cliente">Cliente</option>
              <option value="fornecedor">Fornecedor</option>
              <option value="ambos">Ambos</option>
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
            <div className="bg-cyan-50 p-6 rounded-full">
              <Users className="h-12 w-12 text-cyan-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhum parceiro cadastrado</h3>
              <p className="text-muted-foreground max-w-md">
                Cadastre seus clientes e fornecedores para organizar suas operações comerciais
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Cadastrar Primeiro Parceiro
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tipos de Parceiros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800">Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-700 mb-3">
              Pessoas ou empresas que compram seus produtos/serviços
            </p>
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-xs text-green-600">Cadastrados</div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800">Fornecedores</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-700 mb-3">
              Empresas que fornecem produtos ou serviços para você
            </p>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-xs text-blue-600">Cadastrados</div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-purple-800">Ambos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-purple-700 mb-3">
              Parceiros que são tanto clientes quanto fornecedores
            </p>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-xs text-purple-600">Cadastrados</div>
          </CardContent>
        </Card>
      </div>

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

export default ParceirosCadastro;