import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DOMPurify from 'isomorphic-dompurify';
import {
  Download,
  Eye,
  Lock,
  Unlock,
  Calendar,
  User,
  FileText,
  Video,
  Youtube,
  FileSpreadsheet,
  Code2,
  Globe,
  Image,
  ExternalLink,
  ArrowLeft,
  Edit
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Material as DbMaterial, MaterialType } from '@shared/schema';

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType> = {
    FileText,
    Video,
    Youtube,
    FileSpreadsheet,
    Code2,
    Globe,
    Image
  };
  return icons[iconName] || FileText;
};

const MaterialViewer = ({ material, materialType }: { material: DbMaterial; materialType?: MaterialType }) => {
  const renderViewer = () => {
    if (!materialType) return null;

    switch (materialType.name) {
      case 'PDF':
        return (
          <div className="w-full h-96 border border-border rounded-lg">
            <iframe
              src={material.fileUrl + '#toolbar=1&navpanes=1&scrollbar=1'}
              className="w-full h-full rounded-lg"
              title={material.title}
            />
          </div>
        );

      case 'Vídeo Youtube':
        const videoId = material.externalUrl?.includes('youtube.com') 
          ? material.externalUrl.split('v=')[1]?.split('&')[0]
          : material.externalUrl?.split('youtu.be/')[1];
        return (
          <div className="w-full aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full rounded-lg"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              title={material.title}
            />
          </div>
        );

      case 'Vídeo Panda':
      case 'Vídeos':
        return (
          <div className="w-full aspect-video">
            <video
              controls
              className="w-full h-full rounded-lg"
              src={material.fileUrl || material.externalUrl || undefined}
            >
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>
        );

      case 'Embed':
        return (
          <div 
            className="w-full min-h-64 border border-border rounded-lg p-4"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(material.embedCode || '') }}
          />
        );

      case 'iframe':
        return (
          <div className="w-full h-96 border border-border rounded-lg">
            <iframe
              src={material.externalUrl || undefined}
              className="w-full h-full rounded-lg"
              title={material.title}
            />
          </div>
        );

      case 'Imagens':
        return (
          <div className="w-full">
            <img
              src={material.fileUrl || material.externalUrl || undefined}
              alt={material.title}
              className="w-full h-auto rounded-lg border border-border"
            />
          </div>
        );

      default:
        return (
          <Card className="bg-white border border-border">
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Visualização não disponível para este tipo de arquivo
              </p>
              <Button asChild className="mt-4">
                <a href={material.fileUrl || material.externalUrl || undefined} download>
                  <Download className="h-4 w-4 mr-2" />
                  Baixar arquivo
                </a>
              </Button>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="space-y-4">
      {renderViewer()}
      
      {(material.fileUrl || material.externalUrl) && materialType?.viewerType !== 'inline' && (
        <div className="flex gap-2">
          {material.fileUrl && (
            <Button asChild>
              <a href={material.fileUrl} download>
                <Download className="h-4 w-4 mr-2" />
                Download
              </a>
            </Button>
          )}
          {material.externalUrl && (
            <Button variant="outline" asChild>
              <a href={material.externalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Abrir link
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

const MaterialDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Fetch material
  const { data: material, isLoading, error } = useQuery({
    queryKey: ['/api/materials', id],
    queryFn: () => apiRequest<DbMaterial>(`/api/materials/${id}`),
    enabled: !!id,
  });

  // Fetch material types
  const { data: materialTypes = [] } = useQuery({
    queryKey: ['/api/material-types'],
    queryFn: () => apiRequest<MaterialType[]>('/api/material-types'),
  });

  // Increment view count mutation
  const incrementViewMutation = useMutation({
    mutationFn: () => apiRequest(`/api/materials/${id}/view`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
    },
  });

  // Increment download count mutation
  const incrementDownloadMutation = useMutation({
    mutationFn: () => apiRequest(`/api/materials/${id}/download`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
    },
  });

  // Auto-increment view count on load
  React.useEffect(() => {
    if (material) {
      incrementViewMutation.mutate();
    }
  }, [material?.id]);

  const getMaterialType = () => {
    if (!material) return null;
    return materialTypes.find(t => t.id === material.typeId);
  };

  const handleDownload = () => {
    incrementDownloadMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando material...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-white border border-border max-w-md mx-auto">
            <CardContent className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">Material não encontrado</h2>
              <p className="text-muted-foreground mb-4">O material solicitado não existe ou foi removido.</p>
              <Button onClick={() => setLocation('/minha-area/materiais')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos Materiais
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const materialType = getMaterialType();
  const IconComponent = materialType ? getIcon(materialType.icon) : FileText;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setLocation('/minha-area/materiais')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{material.title}</h1>
              <p className="text-muted-foreground">{materialType?.name || 'Tipo desconhecido'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLocation(`/minha-area/materiais/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <MaterialViewer material={material} materialType={materialType} />
          </div>

          <div className="space-y-6">
            {/* Informações básicas */}
            <Card className="bg-white border border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconComponent className="h-5 w-5" />
                  Informações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Descrição</label>
                  <p className="text-sm text-muted-foreground mt-1">{material.description}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Nível de Acesso</label>
                  <div className="flex items-center gap-2 mt-1">
                    {material.accessLevel === 'restricted' ? (
                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Lock className="h-3 w-3 mr-1" />
                        Restrito
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <Unlock className="h-3 w-3 mr-1" />
                        Público
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Tags</label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {material.tags?.map(tag => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {material.viewCount} visualizações
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    {material.downloadCount} downloads
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalhes técnicos */}
            <Card className="bg-white border border-border">
              <CardHeader>
                <CardTitle>Detalhes Técnicos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Enviado em:</span>
                  <span className="text-foreground">
                    {new Date(material.uploadDate).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Enviado por:</span>
                  <span className="text-foreground">Você</span>
                </div>

                {material.fileSize && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Tamanho:</span>
                    <span className="text-foreground ml-2">
                      {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ações */}
            <Card className="bg-white border border-border">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {material.fileUrl && (
                    <Button asChild className="w-full" onClick={handleDownload}>
                      <a href={material.fileUrl} download>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar arquivo
                      </a>
                    </Button>
                  )}
                  {material.externalUrl && (
                    <Button variant="outline" asChild className="w-full">
                      <a href={material.externalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir link externo
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;