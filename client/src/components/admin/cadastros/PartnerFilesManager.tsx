import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, FileText, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import type { PartnerFile, InsertPartnerFile } from '@shared/schema';

interface PartnerFilesManagerProps {
  partnerId: number;
}

const fileTypeLabels = {
  presentation: 'Apresentação',
  catalog: 'Catálogo',
  pricing: 'Tabela de Preços',
  services: 'Serviços Ofertados',
  other: 'Outros'
};

export const PartnerFilesManager: React.FC<PartnerFilesManagerProps> = ({ partnerId }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFile, setEditingFile] = useState<PartnerFile | null>(null);
  const [formData, setFormData] = useState<Partial<InsertPartnerFile>>({
    name: '',
    description: '',
    fileUrl: '',
    fileType: 'other',
    fileName: '',
    fileSize: ''
  });

  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: files = [], isLoading } = useQuery<PartnerFile[]>({
    queryKey: ['/api/partners', partnerId, 'files'],
    queryFn: async () => {
      const response = await fetch(`/api/partners/${partnerId}/files`);
      if (!response.ok) throw new Error('Failed to fetch files');
      return response.json();
    },
    enabled: !!partnerId
  });

  const createMutation = useMutation({
    mutationFn: (file: InsertPartnerFile) => 
      apiRequest('/api/partner-files', {
        method: 'POST',
        body: JSON.stringify(file),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'files'] });
      toast({
        title: "Sucesso",
        description: "Arquivo adicionado com sucesso!",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao adicionar arquivo.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPartnerFile> }) => 
      apiRequest(`/api/partner-files/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'files'] });
      toast({
        title: "Sucesso",
        description: "Arquivo atualizado com sucesso!",
      });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar arquivo.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/partner-files/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'files'] });
      toast({
        title: "Sucesso",
        description: "Arquivo removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover arquivo.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      fileUrl: '',
      fileType: 'other',
      fileName: '',
      fileSize: ''
    });
    setEditingFile(null);
    setIsDialogOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.fileUrl || !formData.fileName) {
      toast({
        title: "Erro",
        description: "Nome, URL do arquivo e nome do arquivo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (editingFile) {
      updateMutation.mutate({ id: editingFile.id, data: formData });
    } else {
      createMutation.mutate({ ...formData, partnerId } as InsertPartnerFile);
    }
  };

  const handleEdit = (file: PartnerFile) => {
    setEditingFile(file);
    setFormData({
      name: file.name,
      description: file.description,
      fileUrl: file.fileUrl,
      fileType: file.fileType,
      fileName: file.fileName,
      fileSize: file.fileSize
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (file: PartnerFile) => {
    if (confirm(`Tem certeza que deseja excluir o arquivo "${file.name}"?`)) {
      deleteMutation.mutate(file.id);
    }
  };

  const handleDownload = (file: PartnerFile) => {
    window.open(file.fileUrl, '_blank');
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-white text-lg">Arquivos do Parceiro</Label>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Arquivo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {editingFile ? 'Editar Arquivo' : 'Novo Arquivo'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome do Arquivo *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Catálogo de Produtos 2024"
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileType" className="text-white">Tipo de Arquivo</Label>
                  <Select
                    value={formData.fileType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fileType: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {Object.entries(fileTypeLabels).map(([value, label]) => (
                        <SelectItem 
                          key={value} 
                          value={value}
                          className="text-white hover:bg-slate-700"
                        >
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileUrl" className="text-white">URL do Arquivo *</Label>
                <Input
                  id="fileUrl"
                  value={formData.fileUrl || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, fileUrl: e.target.value }))}
                  placeholder="https://exemplo.com/arquivo.pdf"
                  className="bg-slate-800 border-slate-600 text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fileName" className="text-white">Nome do Arquivo *</Label>
                  <Input
                    id="fileName"
                    value={formData.fileName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileName: e.target.value }))}
                    placeholder="catalogo-produtos.pdf"
                    className="bg-slate-800 border-slate-600 text-white"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileSize" className="text-white">Tamanho do Arquivo</Label>
                  <Input
                    id="fileSize"
                    value={formData.fileSize || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, fileSize: e.target.value }))}
                    placeholder="2.5 MB"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do arquivo e conteúdo"
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingFile ? 'Atualizar' : 'Adicionar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-white">Carregando arquivos...</div>
      ) : files.length === 0 ? (
        <div className="text-slate-400 text-center py-8">
          Nenhum arquivo cadastrado
        </div>
      ) : (
        <div className="grid gap-4">
          {files.map((file) => (
            <Card key={file.id} className="bg-slate-800 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-lg flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-blue-400" />
                      {file.name}
                    </CardTitle>
                    <div className="flex items-center text-sm text-slate-400 mt-1">
                      <span className="bg-slate-700 px-2 py-1 rounded text-xs">
                        {fileTypeLabels[file.fileType as keyof typeof fileTypeLabels] || file.fileType}
                      </span>
                      {file.fileSize && (
                        <span className="ml-2">{file.fileSize}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file)}
                      className="text-green-400 hover:text-green-300 hover:bg-green-400/10"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(file)}
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {file.description && (
                <CardContent className="pt-0">
                  <div className="text-sm text-slate-300">
                    {file.description}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};