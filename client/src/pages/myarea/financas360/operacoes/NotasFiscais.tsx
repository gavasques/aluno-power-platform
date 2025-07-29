import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Receipt, Plus, Search, Filter, Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

const NotasFiscaisOperacao = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notas Fiscais</h1>
          <p className="text-muted-foreground">
            Gestão de documentos fiscais de entrada e saída
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Upload className="h-4 w-4" />
            Upload XML
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Nova NF
          </Button>
        </div>
      </div>

      {/* Cards Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Total NFs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-xs text-blue-600">Notas cadastradas</div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800 flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Autorizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-xs text-green-600">Status autorizado</div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-red-800 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Canceladas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-xs text-red-600">Status cancelado</div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-yellow-800 flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Valor Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">R$ 0,00</div>
            <div className="text-xs text-yellow-600">Valor das NFs</div>
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
                placeholder="Buscar por número, chave..."
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="">Todos os tipos</option>
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
            </select>
            <select className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500">
              <option value="">Todos os status</option>
              <option value="autorizada">Autorizada</option>
              <option value="cancelada">Cancelada</option>
              <option value="inutilizada">Inutilizada</option>
            </select>
            <input
              type="date"
              placeholder="Data emissão"
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
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
            <div className="bg-amber-50 p-6 rounded-full">
              <Receipt className="h-12 w-12 text-amber-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">Nenhuma nota fiscal cadastrada</h3>
              <p className="text-muted-foreground max-w-md">
                Importe seus XMLs ou cadastre manualmente suas notas fiscais para controle fiscal completo
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="gap-2">
                <Upload className="h-4 w-4" />
                Importar XML
              </Button>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Cadastrar Manualmente
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funcionalidades */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Funcionalidades Disponíveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Upload className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Import XML</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Importe automaticamente XMLs das notas fiscais
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Vinculação</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Vincule NFs automaticamente aos lançamentos
              </p>
            </div>
            
            <div className="p-4 bg-white rounded-lg border border-blue-200">
              <div className="flex items-center gap-3 mb-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                <span className="font-semibold">Relatórios</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Gere relatórios fiscais automaticamente
              </p>
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

export default NotasFiscaisOperacao;