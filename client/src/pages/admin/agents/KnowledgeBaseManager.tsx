import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Upload, 
  FileText, 
  Trash2, 
  Edit2, 
  Search, 
  Plus,
  Database,
  BookOpen,
  FileIcon,
  Calendar,
  User,
  X
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { apiRequest } from '@/lib/queryClient';
import { KnowledgeBaseDoc, KnowledgeBaseCollection } from '../../../../shared/schema';

interface FileUploadData {
  title: string;
  tags: string[];
  file: File;
}

export function KnowledgeBaseManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [uploadData, setUploadData] = useState<Partial<FileUploadData>>({
    title: '',
    tags: [],
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<KnowledgeBaseDoc | null>(null);

  // Fetch documents
  const { data: documents = [], isLoading: docsLoading, refetch: refetchDocs } = useQuery({
    queryKey: ['/api/knowledge-base/documents'],
    staleTime: 30 * 1000, // 30 seconds
  });

  // Fetch collections
  const { data: collections = [], isLoading: collectionsLoading } = useQuery({
    queryKey: ['/api/knowledge-base/collections'],
    staleTime: 60 * 1000, // 1 minute
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async (data: FileUploadData) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('title', data.title);
      formData.append('tags', JSON.stringify(data.tags));

      const response = await fetch('/api/knowledge-base/documents/upload', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Documento enviado com sucesso',
        description: 'O documento foi processado e está disponível na base de conhecimento.',
      });
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadData({ title: '', tags: [] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/documents'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro no upload',
        description: error.message || 'Falha ao enviar documento',
        variant: 'destructive',
      });
    },
  });

  // Update document mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<KnowledgeBaseDoc> }) => {
      return apiRequest(`/api/knowledge-base/documents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Documento atualizado',
        description: 'As alterações foram salvas com sucesso.',
      });
      setEditingDoc(null);
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/documents'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na atualização',
        description: error.message || 'Falha ao atualizar documento',
        variant: 'destructive',
      });
    },
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/knowledge-base/documents/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Documento excluído',
        description: 'O documento foi removido da base de conhecimento.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/knowledge-base/documents'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro na exclusão',
        description: error.message || 'Falha ao excluir documento',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadData.title) {
        setUploadData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, '') }));
      }
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !uploadData.tags?.includes(tagInput.trim())) {
      setUploadData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setUploadData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || [],
    }));
  };

  const handleUpload = () => {
    if (!selectedFile || !uploadData.title) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Selecione um arquivo e adicione um título.',
        variant: 'destructive',
      });
      return;
    }

    uploadMutation.mutate({
      file: selectedFile,
      title: uploadData.title,
      tags: uploadData.tags || [],
    });
  };

  const handleEdit = (doc: KnowledgeBaseDoc) => {
    setEditingDoc(doc);
  };

  const handleSaveEdit = () => {
    if (!editingDoc) return;

    updateMutation.mutate({
      id: editingDoc.id,
      updates: {
        title: editingDoc.title,
        summary: editingDoc.summary,
        tags: editingDoc.tags,
      },
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate(id);
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileTypeIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word')) return '📝';
    if (fileType.includes('text')) return '📃';
    return '📄';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Base de Conhecimento</h2>
          <p className="text-muted-foreground">
            Gerencie documentos para funcionalidade de Retrieval da OpenAI
          </p>
        </div>
        
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="mr-2 h-4 w-4" />
              Adicionar Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload de Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">Arquivo</Label>
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf,.txt,.md,.docx"
                  onChange={handleFileSelect}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Formatos suportados: PDF, TXT, MD, DOCX (máx. 10MB)
                </p>
              </div>

              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={uploadData.title || ''}
                  onChange={e => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Nome do documento"
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    placeholder="Adicionar tag"
                    onKeyPress={e => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {uploadData.tags && uploadData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {uploadData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleUpload}
                  disabled={uploadMutation.isPending || !selectedFile || !uploadData.title}
                  className="flex-1"
                >
                  {uploadMutation.isPending ? 'Enviando...' : 'Enviar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar documentos..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Database className="h-4 w-4" />
          {documents.length} documento{documents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Documents Grid */}
      {docsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredDocuments.length === 0 ? (
        <Card className="p-8 text-center">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? 'Nenhum documento encontrado' : 'Nenhum documento na base'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? 'Tente pesquisar com outros termos'
              : 'Comece adicionando seus primeiros documentos para a base de conhecimento'
            }
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Adicionar Primeiro Documento
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map(doc => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">{getFileTypeIcon(doc.fileType)}</span>
                    <CardTitle className="text-base line-clamp-1">{doc.title}</CardTitle>
                  </div>
                  
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(doc)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir "{doc.title}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(doc.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {doc.summary}
                </p>
                
                {doc.tags && doc.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {doc.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{doc.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileIcon className="h-3 w-3" />
                    {formatFileSize(doc.fileSize)}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingDoc && (
        <Dialog open={!!editingDoc} onOpenChange={() => setEditingDoc(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Documento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={editingDoc.title}
                  onChange={e => setEditingDoc(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>

              <div>
                <Label htmlFor="edit-summary">Resumo</Label>
                <Textarea
                  id="edit-summary"
                  value={editingDoc.summary || ''}
                  onChange={e => setEditingDoc(prev => prev ? { ...prev, summary: e.target.value } : null)}
                  rows={3}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {editingDoc.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button
                        onClick={() => setEditingDoc(prev => prev ? {
                          ...prev,
                          tags: prev.tags?.filter(t => t !== tag) || []
                        } : null)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateMutation.isPending}
                  className="flex-1"
                >
                  {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setEditingDoc(null)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}