import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Função auxiliar para requisições API com tipagem correta
const makeApiRequest = async (url: string, options: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}) => {
  const response = await fetch(url, {
    method: options.method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, X, FileText, Hash, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Schema de validação seguindo princípios DRY
const amazonListingSchema = z.object({
  productName: z.string().min(1, 'Nome do produto é obrigatório'),
  brand: z.string().min(1, 'Marca é obrigatória'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  keywords: z.string().min(1, 'Palavras-chave são obrigatórias'),
  longTailKeywords: z.string().optional(),
  features: z.string().optional(),
  targetAudience: z.string().optional(),
  reviewsData: z.string().min(1, 'Dados de avaliações são obrigatórios'),
});

type AmazonListingFormData = z.infer<typeof amazonListingSchema>;

interface SessionInfo {
  sessionHash: string;
  userId: string;
  sessionId: string;
}

interface FileUpload {
  id: string;
  name: string;
  content: string;
  size: number;
}

interface TagsDisplay {
  [key: string]: string;
}

/**
 * Componente principal do Amazon Listing Optimizer
 * Responsabilidade única: gerenciar formulário e sessão
 * Princípio Aberto/Fechado: extensível para novos campos
 */
export function AmazonListingOptimizerForm() {
  const [sessionInfo, setSessionInfo] = useState<SessionInfo | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([]);
  const [tags, setTags] = useState<TagsDisplay>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<AmazonListingFormData>({
    resolver: zodResolver(amazonListingSchema),
    defaultValues: {
      productName: '',
      brand: '',
      category: '',
      keywords: '',
      longTailKeywords: '',
      features: '',
      targetAudience: '',
      reviewsData: '',
    },
  });

  // Busca departamentos disponíveis para categorias de produto
  const { data: categoriesData } = useQuery({
    queryKey: ['/api/departments'],
  });

  // Cria nova sessão ao abrir o componente
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      return makeApiRequest('/api/sessions', {
        method: 'POST',
        body: {
          userId: 'user-1', // TODO: pegar do contexto de autenticação
          agentType: 'amazon-listing-optimizer',
          inputData: {}
        }
      });
    },
    onSuccess: (data: any) => {
      if (data.success) {
        setSessionInfo({
          sessionHash: data.session.sessionHash,
          userId: data.session.userId,
          sessionId: data.session.id
        });
      }
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível criar sessão',
        variant: 'destructive'
      });
    }
  });

  // Atualiza sessão com dados do formulário
  const updateSessionMutation = useMutation({
    mutationFn: async (inputData: any) => {
      if (!sessionInfo) return;
      
      return makeApiRequest(`/api/sessions/${sessionInfo.sessionId}`, {
        method: 'PUT',
        body: { inputData }
      });
    },
    onSuccess: (data: any) => {
      if (data?.success && data?.session?.tags) {
        setTags(data.session.tags);
      }
    }
  });

  // Processa múltiplos arquivos
  const processFilesMutation = useMutation({
    mutationFn: async (files: FileUpload[]) => {
      if (!sessionInfo) throw new Error('Sessão não encontrada');
      
      return makeApiRequest(`/api/sessions/${sessionInfo.sessionId}/files/process`, {
        method: 'POST',
        body: {
          files: files.map(f => ({
            name: f.name,
            content: f.content
          }))
        }
      });
    },
    onSuccess: (data: any) => {
      if (data?.success) {
        form.setValue('reviewsData', data.combinedContent);
        toast({
          title: 'Sucesso',
          description: `${data.filesProcessed} arquivos processados e combinados`,
        });
      }
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível processar os arquivos',
        variant: 'destructive'
      });
    }
  });

  // Cria sessão ao montar o componente
  useEffect(() => {
    createSessionMutation.mutate();
  }, []);

  // Atualiza sessão quando dados do formulário mudam
  const handleFormChange = (data: Partial<AmazonListingFormData>) => {
    if (sessionInfo) {
      updateSessionMutation.mutate(data);
    }
  };

  // Manipula upload de arquivos
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (uploadedFiles.length >= 10) {
        toast({
          title: 'Limite atingido',
          description: 'Máximo de 10 arquivos permitidos',
          variant: 'destructive'
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const newFile: FileUpload = {
          id: Math.random().toString(36).substring(7),
          name: file.name,
          content,
          size: file.size
        };
        
        setUploadedFiles(prev => [...prev, newFile]);
      };
      reader.readAsText(file);
    });

    // Limpa o input
    event.target.value = '';
  };

  // Remove arquivo
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Processa todos os arquivos
  const handleProcessFiles = () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Nenhum arquivo para processar',
        variant: 'destructive'
      });
      return;
    }

    processFilesMutation.mutate(uploadedFiles);
  };

  const onSubmit = (data: AmazonListingFormData) => {
    handleFormChange(data);
    // TODO: Implementar processamento final
    console.log('Processando listing:', data);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header com informações da sessão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Amazon Listing Optimizer
            {sessionInfo && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground ml-auto">
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  {sessionInfo.sessionHash}
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {sessionInfo.userId}
                </div>
              </div>
            )}
          </CardTitle>
        </CardHeader>
      </Card>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações do Produto */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Nome do Produto *</Label>
                <Input
                  id="productName"
                  {...form.register('productName')}
                  onChange={(e) => {
                    form.register('productName').onChange(e);
                    handleFormChange({ productName: e.target.value });
                  }}
                  placeholder="Ex: Fone de Ouvido Bluetooth Premium"
                />
                {form.formState.errors.productName && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.productName.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  {...form.register('brand')}
                  onChange={(e) => {
                    form.register('brand').onChange(e);
                    handleFormChange({ brand: e.target.value });
                  }}
                  placeholder="Ex: Sony, JBL, Apple"
                />
                {form.formState.errors.brand && (
                  <p className="text-sm text-red-500 mt-1">
                    {form.formState.errors.brand.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoria *</Label>
              <Select 
                value={form.watch('category')} 
                onValueChange={(value) => {
                  form.setValue('category', value);
                  handleFormChange({ category: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesData?.map((category: any) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.category.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="keywords">Palavras-chave Principais</Label>
              <Input
                id="keywords"
                {...form.register('keywords')}
                onChange={(e) => {
                  form.register('keywords').onChange(e);
                  handleFormChange({ keywords: e.target.value });
                }}
                placeholder="Ex: fone bluetooth, headset sem fio"
              />
            </div>

            <div>
              <Label htmlFor="longTailKeywords">Palavras-chave de Cauda Longa</Label>
              <Input
                id="longTailKeywords"
                {...form.register('longTailKeywords')}
                onChange={(e) => {
                  form.register('longTailKeywords').onChange(e);
                  handleFormChange({ longTailKeywords: e.target.value });
                }}
                placeholder="Ex: fone de ouvido bluetooth com cancelamento de ruído"
              />
            </div>

            <div>
              <Label htmlFor="features">Principais Características</Label>
              <Textarea
                id="features"
                {...form.register('features')}
                onChange={(e) => {
                  form.register('features').onChange(e);
                  handleFormChange({ features: e.target.value });
                }}
                placeholder="Ex: Cancelamento de ruído ativo, bateria 30h, resistente à água"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Público-alvo</Label>
              <Textarea
                id="targetAudience"
                {...form.register('targetAudience')}
                onChange={(e) => {
                  form.register('targetAudience').onChange(e);
                  handleFormChange({ targetAudience: e.target.value });
                }}
                placeholder="Ex: Profissionais que trabalham remotamente, gamers, estudantes"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upload de Avaliações */}
        <Card>
          <CardHeader>
            <CardTitle>Avaliações dos Concorrentes</CardTitle>
            <p className="text-sm text-muted-foreground">
              Faça upload de até 10 arquivos de avaliações que serão interpretados e combinados
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-center">
                  <Label htmlFor="fileUpload" className="cursor-pointer text-primary hover:underline">
                    Clique para fazer upload
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Arquivos .txt, .csv, .xlsx (máx. 10 arquivos)
                  </p>
                </div>
                <Input
                  id="fileUpload"
                  type="file"
                  multiple
                  accept=".txt,.csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            {/* Lista de arquivos uploadados */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Arquivos Carregados ({uploadedFiles.length}/10)</Label>
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-muted-foreground">
                        ({(file.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  onClick={handleProcessFiles}
                  disabled={processFilesMutation.isPending}
                  className="w-full"
                >
                  {processFilesMutation.isPending ? 'Processando...' : 'Processar e Combinar Arquivos'}
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="reviewsData">Texto Manual das Avaliações</Label>
              <Textarea
                id="reviewsData"
                {...form.register('reviewsData')}
                onChange={(e) => {
                  form.register('reviewsData').onChange(e);
                  handleFormChange({ reviewsData: e.target.value });
                }}
                placeholder="Cole aqui as avaliações dos concorrentes ou use o upload de arquivos acima"
                rows={8}
                className="font-mono text-sm"
              />
              {form.formState.errors.reviewsData && (
                <p className="text-sm text-red-500 mt-1">
                  {form.formState.errors.reviewsData.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tags Geradas */}
        {Object.keys(tags).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Tags Disponíveis para Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(tags).map(([key, value]) => (
                  <div key={key} className="p-2 bg-muted rounded text-xs">
                    <div className="font-mono text-primary">{`{${key}}`}</div>
                    <div className="text-muted-foreground truncate">{value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botão de Submit */}
        <Card>
          <CardContent className="pt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={!sessionInfo || form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? 'Processando...' : 'Gerar Listing Otimizado'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}