
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMaterials } from '@/contexts/MaterialsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
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
  ExternalLink
} from 'lucide-react';
import { Material } from '@/types/material';

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

const MaterialViewer = ({ material }: { material: Material }) => {
  const { incrementView } = useMaterials();
  
  React.useEffect(() => {
    incrementView(material.id);
  }, [material.id, incrementView]);

  const renderViewer = () => {
    switch (material.type.name) {
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
              allowFullScreen
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
              src={material.fileUrl || material.externalUrl}
            >
              Seu navegador não suporta o elemento de vídeo.
            </video>
          </div>
        );

      case 'Embed':
        return (
          <div 
            className="w-full min-h-64 border border-border rounded-lg p-4"
            dangerouslySetInnerHTML={{ __html: material.embedCode || '' }}
          />
        );

      case 'iframe':
        return (
          <div className="w-full h-96 border border-border rounded-lg">
            <iframe
              src={material.externalUrl}
              className="w-full h-full rounded-lg"
              title={material.title}
            />
          </div>
        );

      case 'Imagens':
        return (
          <div className="w-full">
            <img
              src={material.fileUrl || material.externalUrl}
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
                <a href={material.fileUrl || material.externalUrl} download>
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
      
      {(material.fileUrl || material.externalUrl) && material.type.viewerType !== 'inline' && (
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
  const { materials, incrementDownload } = useMaterials();
  
  const material = materials.find(m => m.id === id);
  
  if (!material) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-white border border-border">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-foreground mb-2">Material não encontrado</h2>
            <p className="text-muted-foreground mb-4">O material solicitado não existe ou foi removido.</p>
            <Button asChild>
              <Link to="/minha-area/materiais">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar aos materiais
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const IconComponent = getIcon(material.type.icon);

  const handleDownload = () => {
    incrementDownload(material.id);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/minha-area/materiais">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{material.title}</h1>
          <p className="text-muted-foreground">{material.type.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MaterialViewer material={material} />
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
                  {material.tags.map(tag => (
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

          {/* Informações técnicas */}
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
                <span className="text-foreground">{material.uploadedBy.name}</span>
              </div>

              {material.fileSize && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Tamanho:</span>
                  <span className="text-foreground ml-2">
                    {(material.fileSize / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              )}

              {material.technicalInfo && (
                <div className="space-y-2 text-sm">
                  {material.technicalInfo.duration && (
                    <div>
                      <span className="text-muted-foreground">Duração:</span>
                      <span className="text-foreground ml-2">{material.technicalInfo.duration}</span>
                    </div>
                  )}
                  {material.technicalInfo.format && (
                    <div>
                      <span className="text-muted-foreground">Formato:</span>
                      <span className="text-foreground ml-2">{material.technicalInfo.format}</span>
                    </div>
                  )}
                  {material.technicalInfo.quality && (
                    <div>
                      <span className="text-muted-foreground">Qualidade:</span>
                      <span className="text-foreground ml-2">{material.technicalInfo.quality}</span>
                    </div>
                  )}
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
                <Button variant="outline" asChild className="w-full">
                  <Link to={`/minha-area/materiais/${material.id}/edit`}>
                    Editar material
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetail;
