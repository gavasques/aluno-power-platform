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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
    setSelectedFile(null);
    setEditingFile(null);
    setIsDialogOpen(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // For now, create a file record with basic information
      const fileData = {
        partnerId,
        name: selectedFile.name.replace(/\.[^/.]+$/, ""), // Remove extension for display name
        fileName: selectedFile.name,
        fileUrl: `https://example.com/uploads/${selectedFile.name}`, // Placeholder URL
        fileType: 'other',
        fileSize: `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`,
        description: `Arquivo enviado: ${selectedFile.name}`
      };

      const response = await apiRequest('/api/partner-files', {
        method: 'POST',
        body: JSON.stringify(fileData),
      });

      if (!response) {
        throw new Error('Upload failed');
      }

      queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'files'] });
      toast({
        title: "Sucesso",
        description: "Arquivo enviado com sucesso!",
      });
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao enviar arquivo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleEdit = (file: PartnerFile) => {
    // For now, disable editing - only allow new uploads
    toast({
      title: "Info",
      description: "Para editar um arquivo, remova-o e faça upload de um novo.",
    });
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Upload de Arquivo</h3>
                  <p className="text-gray-400 text-sm">Selecione um arquivo para enviar</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file" className="text-white">Selecionar Arquivo *</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileSelect}
                    className="bg-slate-800 border-slate-600 text-white file:bg-blue-600 file:text-white file:border-0 file:rounded file:px-4 file:py-2 file:mr-4"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                  />
                  {selectedFile && (
                    <div className="text-sm text-gray-400 mt-2">
                      Arquivo selecionado: <span className="text-white">{selectedFile.name}</span> 
                      <span className="ml-2">({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  )}
                </div>
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
                  disabled={isUploading || !selectedFile}
                >
                  {isUploading ? 'Enviando...' : 'Enviar Arquivo'}
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