/**
 * Product Import/Export Page
 * Main interface for Excel-based bulk operations
 */

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileSpreadsheet, Package, Settings } from 'lucide-react';
import ExcelImportExportManager from '@/components/excel/ExcelImportExportManager';

export default function ProductImportExport() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <FileSpreadsheet className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Importação & Exportação</h1>
          <p className="text-muted-foreground">
            Gerencie seus dados através de planilhas Excel - importe e exporte produtos e configurações de canais
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Canais de Venda
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Gestão de Produtos via Excel
              </CardTitle>
              <CardDescription>
                Importe e exporte dados de produtos em massa utilizando planilhas Excel. 
                Ideal para atualizações em lote, cadastro de novos produtos e sincronização de dados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelImportExportManager type="products" />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Channels Tab */}
        <TabsContent value="channels" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Canais de Venda via Excel
              </CardTitle>
              <CardDescription>
                Configure e gerencie suas configurações de canais de venda através de planilhas Excel.
                Defina preços, categorias, configurações específicas de cada marketplace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExcelImportExportManager type="channels" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Feature Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefícios do Sistema Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">⚡ Atualizações em Massa</h3>
              <p className="text-sm text-muted-foreground">
                Atualize centenas ou milhares de produtos de uma só vez usando planilhas familiares
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">🔍 Detecção Inteligente</h3>
              <p className="text-sm text-muted-foreground">
                O sistema detecta automaticamente registros novos e atualizações de produtos existentes
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">📊 Templates Prontos</h3>
              <p className="text-sm text-muted-foreground">
                Templates Excel pré-configurados com todas as colunas e formatação necessária
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">✅ Validação de Dados</h3>
              <p className="text-sm text-muted-foreground">
                Validação automática de dados durante a importação com relatórios de erro detalhados
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">🔄 Sincronização</h3>
              <p className="text-sm text-muted-foreground">
                Mantenha seus dados sincronizados entre diferentes plataformas e marketplaces
              </p>
            </div>
            
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">📈 Escalabilidade</h3>
              <p className="text-sm text-muted-foreground">
                Sistema otimizado para lidar com grandes volumes de dados e operações empresariais
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}