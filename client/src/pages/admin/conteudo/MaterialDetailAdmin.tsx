
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMaterials } from '@/contexts/MaterialsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DOMPurify from 'isomorphic-dompurify';
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
  ExternalLink,
  Edit
} from 'lucide-react';
import { Material } from '@/types/material';

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    FileText, Video, Youtube, FileSpreadsheet, Code2, Globe, Image
  };
  return icons[iconName] || FileText;
};

// Re-using MaterialViewer logic from src/pages/myarea/MaterialDetail.tsx
const MaterialViewer = ({ material }: { material: Material }) => {
  const {} = useMaterials();
  
  // Note: incrementView functionality removed

  // ... (viewer rendering logic copied from MaterialDetail.tsx)
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
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(material.embedCode || '') }}
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
    </div>
  );
};


const MaterialDetailAdmin = () => {
  const { id } = useParams<{ id: string }>();
  const { materials } = useMaterials();
  const material = materials.find(m => m.id === parseInt(id || '0'));

  if (!material) {
    return <div>Material não encontrado.</div>;
  }

  const IconComponent = getIcon(material.type.icon);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" asChild>
          <Link to="/admin/conteudo/materiais">
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
          <MaterialViewer material={material as any} />
        </div>
        <div className="space-y-6">
          <Card>
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
                    <Badge variant="destructive">Restrito</Badge>
                  ) : (
                    <Badge variant="secondary">Público</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
               <Button variant="outline" asChild className="w-full">
                  <Link to={`/admin/conteudo/materiais/${material.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar material
                  </Link>
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MaterialDetailAdmin;

