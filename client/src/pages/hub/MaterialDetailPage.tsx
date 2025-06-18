import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Download, 
  ExternalLink, 
  Eye,
  FileText,
  Video,
  Code,
  Share2
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Material as DbMaterial, MaterialType } from '@shared/schema';

const MaterialDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch material
  const { data: material, isLoading } = useQuery({
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

  // Increment view count on page load
  useEffect(() => {
    if (material) {
      incrementViewMutation.mutate();
    }
  }, [material?.id]);

  const getMaterialType = () => {
    if (!material) return null;
    return materialTypes.find(t => t.id === material.typeId);
  };

  const handleDownload = () => {
    if (material?.fileUrl) {
      window.open(material.fileUrl, '_blank');
      incrementDownloadMutation.mutate();
    }
  };

  const handleExternalLink = () => {
    if (material?.externalUrl) {
      window.open(material.externalUrl, '_blank');
    }
  };

  const getTypeIcon = (contentType: string) => {
    const icons = {
      pdf: FileText,
      video: Video,
      embed: Code,
      download: Download,
    };
    const IconComponent = icons[contentType as keyof typeof icons] || FileText;
    return <IconComponent className="h-5 w-5" />;
  };

  const renderContent = () => {
    if (!material) return null;
    
    const materialType = getMaterialType();
    if (!materialType) return null;

    switch (materialType.contentType) {
      case 'pdf':
        if (material.fileUrl) {
          return (
            <div className="w-full h-screen">
              <iframe
                src={`${material.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                className="w-full h-full border-0"
                title={material.title}
              />
            </div>
          );
        }
        break;

      case 'video':
        if (material.videoUrl) {
          return (
            <div className="w-full flex justify-center">
              <video 
                controls 
                className="w-full max-w-6xl h-auto"
                poster={material.videoThumbnail || undefined}
                style={{ maxHeight: '80vh' }}
              >
                <source src={material.videoUrl} type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
              </video>
            </div>
          );
        }
        break;

      case 'embed':
        if (material.embedCode) {
          return (
            <div 
              className="w-full min-h-screen"
              dangerouslySetInnerHTML={{ __html: material.embedCode }}
            />
          );
        } else if (material.embedUrl) {
          return (
            <div className="w-full h-screen">
              <iframe
                src={material.embedUrl}
                className="w-full h-full border-0"
                title={material.title}
                allowFullScreen
              />
            </div>
          );
        }
        break;

      case 'download':
        return (
          <div className="flex flex-col items-center justify-center min-h-96 py-12">
            <div className="text-center max-w-2xl">
              <Download className="h-24 w-24 mx-auto text-blue-500 mb-6" />
              <h2 className="text-2xl font-bold mb-4">Material para Download</h2>
              <p className="text-gray-600 mb-6 text-lg">
                {material.description}
              </p>
              <Button onClick={handleDownload} size="lg" className="mb-4">
                <Download className="h-5 w-5 mr-2" />
                Baixar Arquivo
              </Button>
              {material.fileSize && (
                <p className="text-sm text-gray-500">
                  Tamanho: {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Formato de conteúdo não suportado</p>
            </div>
          </div>
        );
    }

    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500">Conteúdo não disponível</p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando material...</p>
        </div>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Material não encontrado</h2>
            <p className="text-gray-600 mb-6">
              O material solicitado não existe ou foi removido.
            </p>
            <Button onClick={() => navigate('/hub/materials')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar aos Materiais
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const materialType = getMaterialType();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/hub/materials')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <div className="flex items-center space-x-3">
                {materialType && getTypeIcon(materialType.contentType)}
                <div>
                  <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                    {material.title}
                  </h1>
                  <div className="flex items-center space-x-2">
                    {materialType && (
                      <Badge variant="secondary" className="text-xs">
                        {materialType.name}
                      </Badge>
                    )}
                    <Badge 
                      variant={material.accessLevel === 'public' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {material.accessLevel === 'public' ? 'Público' : 'Restrito'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {material.viewCount} visualizações
              </span>
              {material.fileUrl && (
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
              {material.externalUrl && (
                <Button variant="outline" size="sm" onClick={handleExternalLink}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Link Externo
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full">
        {renderContent()}
      </div>

      {/* Footer with material info */}
      {materialType?.contentType !== 'embed' && (
        <div className="bg-white border-t mt-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Sobre este material</h3>
                <p className="text-gray-600 mb-4">{material.description}</p>
                {material.tags && material.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {material.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Downloads:</span>
                  <span className="font-medium">{material.downloadCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Visualizações:</span>
                  <span className="font-medium">{material.viewCount}</span>
                </div>
                {material.fileSize && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tamanho:</span>
                    <span className="font-medium">
                      {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialDetailPage;