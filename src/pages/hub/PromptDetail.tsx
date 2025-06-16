
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePrompts } from '@/contexts/PromptsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  BrainCircuit,
  Calendar,
  ArrowLeft,
  Info,
  Lightbulb,
  Image as ImageIcon
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PromptDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getPromptById } = usePrompts();
  const { toast } = useToast();

  const prompt = getPromptById(id || '');

  if (!prompt) {
    return (
      <div className="w-full p-6">
        <div className="text-center py-12">
          <BrainCircuit className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Prompt não encontrado</h3>
          <p className="text-muted-foreground mb-4">
            O prompt solicitado não existe ou foi removido.
          </p>
          <Button onClick={() => navigate('/hub/prompts-ia')}>
            Voltar para Prompts IA
          </Button>
        </div>
      </div>
    );
  }

  const copyToClipboard = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Prompt copiado!",
        description: `O prompt "${title}" foi copiado para a área de transferência.`,
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o prompt. Tente novamente.",
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
          onClick={() => navigate('/hub/prompts-ia')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{prompt.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{prompt.category.name}</Badge>
            {prompt.images && prompt.images.length > 0 && (
              <Badge variant="outline" className="text-xs">
                <ImageIcon className="h-3 w-3 mr-1" />
                {prompt.images.length} {prompt.images.length === 1 ? 'imagem' : 'imagens'}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Criado em {prompt.createdAt.toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Descrição */}
      {prompt.description && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Info className="h-5 w-5" />
              Descrição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{prompt.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Exemplos de Uso */}
      {prompt.usageExamples && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5" />
              Exemplos de Uso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{prompt.usageExamples}</p>
          </CardContent>
        </Card>
      )}

      {/* Conteúdo do Prompt */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BrainCircuit className="h-5 w-5" />
              Conteúdo do Prompt
            </CardTitle>
            <Button 
              onClick={() => copyToClipboard(prompt.content, prompt.title)}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copiar Prompt
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 border rounded-lg p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
              {highlightPlaceholders(prompt.content)}
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Imagens */}
      {prompt.images && prompt.images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5" />
              Imagens de Exemplo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {prompt.images.map((image) => (
                <div key={image.id} className="border rounded-lg overflow-hidden">
                  <img 
                    src={image.url} 
                    alt={image.alt}
                    className="w-full h-48 object-cover"
                  />
                  {image.alt && (
                    <div className="p-2 text-sm text-muted-foreground">
                      {image.alt}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações Adicionais */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <span className="font-medium">Categoria:</span> {prompt.category.name}
            </div>
            <div>
              <span className="font-medium">Criado em:</span> {prompt.createdAt.toLocaleDateString('pt-BR')}
            </div>
            <div>
              <span className="font-medium">Última atualização:</span> {prompt.updatedAt.toLocaleDateString('pt-BR')}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptDetail;
