import React, { useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
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
  Share2,
  Calendar
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Material as DbMaterial, MaterialType } from '@shared/schema';

const MaterialDetailPage = () => {
  const [, params] = useRoute('/hub/materiais/:id');
  const [, setLocation] = useLocation();
  const id = params?.id;
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
            <div className="bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Documento PDF</h2>
                    <Button onClick={handleDownload} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Baixar PDF
                    </Button>
                  </div>
                  <div className="w-full h-screen bg-white rounded shadow-sm">
                    <iframe
                      src={`${material.fileUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                      className="w-full h-full border-0 rounded"
                      title={material.title}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }
        break;

      case 'video':
        if (material.videoUrl) {
          return (
            <div className="bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gray-100 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">Conteúdo em Vídeo</h2>
                  <div className="flex justify-center">
                    <video 
                      controls 
                      className="w-full max-w-4xl h-auto rounded-lg shadow-lg"
                      poster={material.videoThumbnail || undefined}
                      style={{ maxHeight: '70vh' }}
                    >
                      <source src={material.videoUrl} type="video/mp4" />
                      Seu navegador não suporta o elemento de vídeo.
                    </video>
                  </div>
                </div>
              </div>
            </div>
          );
        }
        break;

      case 'embed':
        if (material.embedCode) {
          return (
            <div className="bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Conteúdo Interativo</h2>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                        Embed Content
                      </Badge>
                      {material.externalUrl && (
                        <Button variant="outline" size="sm" onClick={handleExternalLink}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Abrir Original
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div 
                      className="w-full min-h-[600px] lg:min-h-[700px]"
                      dangerouslySetInnerHTML={{ __html: material.embedCode }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        } else if (material.embedUrl) {
          return (
            <div className="bg-white">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Conteúdo Externo</h2>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Link Externo
                      </Badge>
                      <Button variant="outline" size="sm" onClick={handleExternalLink}>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Abrir em Nova Aba
                      </Button>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <iframe
                      src={material.embedUrl}
                      className="w-full h-[600px] lg:h-[700px] border-0"
                      title={material.title}
                      allowFullScreen
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        }
        break;

      case 'download':
        return (
          <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
                <div className="text-center max-w-2xl mx-auto">
                  <div className="bg-blue-500 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <Download className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Material para Download</h2>
                  <p className="text-gray-600 mb-8 text-lg leading-relaxed">
                    {material.description}
                  </p>
                  <div className="space-y-4">
                    <Button onClick={handleDownload} size="lg" className="bg-blue-600 hover:bg-blue-700">
                      <Download className="h-5 w-5 mr-2" />
                      Baixar Arquivo
                    </Button>
                    {material.fileSize && (
                      <p className="text-sm text-gray-500">
                        Tamanho do arquivo: {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Formato não suportado</h3>
                <p className="text-gray-500">Este tipo de conteúdo não pode ser exibido no momento.</p>
              </div>
            </div>
          </div>
        );
    }

    return (
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Conteúdo indisponível</h3>
            <p className="text-gray-500">O conteúdo deste material não está disponível no momento.</p>
          </div>
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
            <Button onClick={() => setLocation('/hub/materials')}>
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
                onClick={() => setLocation('/hub/materials')}
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

      {/* Footer with material info - always show for better UX */}
      <div className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Sobre este material</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{material.description}</p>
              {material.tags && material.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Tags relacionadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {material.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="lg:col-span-1">
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">Estatísticas</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Eye className="h-4 w-4 mr-2" />
                      Visualizações
                    </span>
                    <span className="font-semibold text-gray-900">{material.viewCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Download className="h-4 w-4 mr-2" />
                      Downloads
                    </span>
                    <span className="font-semibold text-gray-900">{material.downloadCount}</span>
                  </div>
                  {material.fileSize && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Tamanho
                      </span>
                      <span className="font-semibold text-gray-900">
                        {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-sm text-gray-600 flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Última modificação
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {new Date(material.lastModified).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailPage;