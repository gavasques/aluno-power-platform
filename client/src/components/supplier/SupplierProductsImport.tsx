import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface SupplierProductsImportProps {
  supplierId: number;
}

export const SupplierProductsImport: React.FC<SupplierProductsImportProps> = ({ supplierId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Import CSV mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);

      const response = await fetch(`/api/suppliers/${supplierId}/products/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro na importação');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products'] });
      toast({
        title: 'Importação Concluída',
        description: `${data.data.created} criados, ${data.data.updated} atualizados, ${data.data.linked} vinculados`,
      });
      setSelectedFile(null);
      setIsOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na Importação',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: 'Arquivo Inválido',
          description: 'Por favor, selecione um arquivo CSV',
          variant: 'destructive',
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `supplierSku,productName,description,cost,leadTime,minimumOrderQuantity,category,brand,notes
SKU001,Produto Exemplo,Descrição do produto,10.50,30,1,Categoria,Marca,Observações
SKU002,Outro Produto,Outra descrição,25.00,15,5,Outra Categoria,Outra Marca,Outras observações`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_produtos_fornecedor.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Importar CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Produtos via CSV</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Instruções */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Como usar a importação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm">
                <p className="font-medium mb-2">Colunas obrigatórias:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li><code>supplierSku</code> - SKU do produto no fornecedor</li>
                  <li><code>productName</code> - Nome do produto</li>
                </ul>
              </div>
              
              <div className="text-sm">
                <p className="font-medium mb-2">Colunas opcionais:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li><code>description</code> - Descrição do produto</li>
                  <li><code>cost</code> - Custo (formato: 10.50)</li>
                  <li><code>leadTime</code> - Tempo de entrega em dias</li>
                  <li><code>minimumOrderQuantity</code> - Quantidade mínima</li>
                  <li><code>category</code> - Categoria do produto</li>
                  <li><code>brand</code> - Marca do produto</li>
                  <li><code>notes</code> - Observações</li>
                </ul>
              </div>

              <div className="bg-blue-50 p-3 rounded-lg text-sm">
                <p className="text-blue-800">
                  <strong>Vinculação Automática:</strong> O sistema tentará vincular automaticamente 
                  os produtos importados com produtos existentes no seu sistema usando SKU e nome.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Download template */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Baixar Template CSV
            </Button>
          </div>

          {/* Upload area */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Label htmlFor="csvFile">Selecionar arquivo CSV</Label>
                <div className="flex items-center gap-4">
                  <input
                    id="csvFile"
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                
                {selectedFile && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Arquivo selecionado:</strong> {selectedFile.name}
                    </p>
                    <p className="text-xs text-green-600">
                      Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setSelectedFile(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!selectedFile || importMutation.isPending}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {importMutation.isPending ? 'Importando...' : 'Importar Produtos'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};