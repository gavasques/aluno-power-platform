import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, ExternalLink, Download, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { queryClient, apiRequest } from '@/lib/queryClient';

interface GeneratedImage {
  id: string;
  agentId: string | null;
  sessionId: string | null;
  model: string;
  prompt: string;
  imageUrl: string;
  size: string;
  quality: string;
  format: string;
  cost: string;
  metadata: any;
  createdAt: string;
}

export default function GeneratedImages() {
  const { toast } = useToast();
  
  const { data: images, isLoading, error, refetch } = useQuery<GeneratedImage[]>({
    queryKey: ['/api/generated-images'],
    refetchInterval: 30000,
    retry: 3,
    retryDelay: 1000,
  });

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      return apiRequest(`/api/generated-images/${imageId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/generated-images'] });
      toast({
        title: 'Sucesso',
        description: 'Imagem removida com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a imagem.',
        variant: 'destructive',
      });
    },
  });

  const handleDelete = (id: string) => {
    deleteImageMutation.mutate(id);
  };

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível baixar a imagem.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Imagens Geradas</h1>
            <p className="text-muted-foreground">Carregando imagens...</p>
          </div>
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Carregando</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Imagens Geradas</h1>
            <p className="text-muted-foreground">Erro ao carregar imagens</p>
          </div>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4">
              <ImageIcon className="h-12 w-12" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Erro ao carregar imagens</h3>
            <p className="text-muted-foreground mb-4">Não foi possível conectar com o servidor.</p>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Imagens Geradas</h1>
          <p className="text-muted-foreground">
            Central de imagens geradas pelo modelo gpt-image-1
          </p>
          {images && (
            <p className="text-sm text-muted-foreground mt-2">
              Total: {images.length} imagens
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {!images || images.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h3 className="text-lg font-semibold mb-2">Nenhuma imagem gerada ainda</h3>
            <p className="text-muted-foreground mb-4">Use o modelo gpt-image-1 para gerar imagens que aparecerão aqui automaticamente.</p>
            <div className="text-sm text-muted-foreground">
              <p>• Acesse qualquer agente de IA</p>
              <p>• Selecione o modelo "gpt-image-1"</p>
              <p>• Digite um prompt para geração de imagem</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  {image.prompt.length > 50 
                    ? `${image.prompt.substring(0, 50)}...` 
                    : image.prompt
                  }
                </CardTitle>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{image.model}</Badge>
                  <Badge variant="outline">{image.quality}</Badge>
                  <Badge variant="outline">{image.size}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="relative group">
                  <img
                    src={image.imageUrl}
                    alt={image.prompt}
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-image.png';
                    }}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => window.open(image.imageUrl, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleDownload(image.imageUrl, image.prompt)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Custo:</span>
                    <span className="font-medium">${parseFloat(image.cost).toFixed(4)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Criado:</span>
                    <span>
                      {formatDistanceToNow(new Date(image.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                  
                  {image.agentId && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Agente:</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {image.agentId}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                    disabled={deleteImageMutation.isPending}
                  >
                    {deleteImageMutation.isPending ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}