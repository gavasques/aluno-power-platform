
import React from 'react';
import { useParams, useLocation } from 'wouter';
import { useTemplates } from '@/contexts/TemplatesContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  FileText,
  ArrowLeft,
  Info,
  Lightbulb,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TemplateDetail = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { getTemplateById } = useTemplates();
  const { toast } = useToast();

  const template = getTemplateById(id || '');

  if (!template) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Template não encontrado</h3>
          <p className="text-muted-foreground mb-4">
            O template solicitado não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/hub/templates')}>
            Voltar para Templates
          </Button>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Template copiado!",
        description: `O template "${title}" foi copiado para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o template. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para destacar conteúdo dentro de {} e []
  const highlightPlaceholders = (text: string) => {
    const parts = text.split(/(\[[^\]]*\]|\{[^}]*\})/g);
    
    return parts.map((part, index) => {
      if (part.match(/^\[[^\]]*\]$/) || part.match(/^\{[^}]*\}$/)) {
        return (
          <span 
            key={index} 
            className="bg-yellow-200 text-yellow-800 px-1 rounded font-medium"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate('/hub/templates')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{template.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{template.category.name}</Badge>
          </div>
        </div>
      </div>

      {/* Descrição */}
      {template.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              Descrição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{template.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Quando Usar */}
      {template.whenToUse && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5" />
              Quando Usar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{template.whenToUse}</p>
          </CardContent>
        </Card>
      )}

      {/* Customização */}
      {template.customization && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="h-5 w-5" />
              Como Personalizar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{template.customization}</p>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo do Template */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Conteúdo do Template
            </CardTitle>
            <Button 
              onClick={() => copyToClipboard(template.content, template.title)}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 border rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
              {highlightPlaceholders(template.content)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Categoria:</span> {template.category.name}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateDetail;
