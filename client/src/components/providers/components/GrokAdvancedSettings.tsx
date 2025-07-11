// Grok Advanced Settings Component - xAI-specific features

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Search, Eye, Globe, Zap } from "lucide-react";
import { ProviderConfiguration } from '../types';

interface GrokAdvancedSettingsProps {
  configuration: ProviderConfiguration;
  onConfigurationChange: (updates: Partial<ProviderConfiguration>) => void;
}

export function GrokAdvancedSettings({ 
  configuration, 
  onConfigurationChange 
}: GrokAdvancedSettingsProps) {
  const supportsVision = configuration.model.includes('vision') || configuration.model.includes('grok-4');
  const isImageGeneration = configuration.model.includes('image');

  return (
    <div className="space-y-6">
      <Card className="border-indigo-200 bg-indigo-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-indigo-800">
            <Zap className="w-4 h-4" />
            Configurações Avançadas Grok
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Reasoning Level */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Brain className="w-4 h-4" />
                Nível de Raciocínio
              </Label>
              <Badge className="bg-purple-100 text-purple-800">
                Think Mode
              </Badge>
            </div>
            
            <Select
              value={configuration.reasoningLevel || 'disabled'}
              onValueChange={(value) => onConfigurationChange({ reasoningLevel: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="disabled">Desabilitado</SelectItem>
                <SelectItem value="low">Think Low - Raciocínio básico</SelectItem>
                <SelectItem value="high">Think High - Raciocínio profundo</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Think Low:</strong> Respostas rápidas com raciocínio básico</p>
              <p><strong>Think High:</strong> Análise profunda e raciocínio detalhado</p>
              <p><strong>Custo:</strong> Think High consome mais tokens e tempo</p>
            </div>
          </div>

          {/* Live Search */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Live Search
                </Label>
                <p className="text-xs text-muted-foreground">
                  Busca em tempo real na web durante a resposta
                </p>
              </div>
              <Switch
                checked={configuration.enableSearch || false}
                onCheckedChange={(checked) => onConfigurationChange({ enableSearch: checked })}
              />
            </div>
            
            {configuration.enableSearch && (
              <div className="ml-6 space-y-2">
                <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
                  <Globe className="w-3 h-3" />
                  Busca Ativada
                </Badge>
                <p className="text-xs text-muted-foreground">
                  O modelo buscará informações atualizadas na web automaticamente quando necessário.
                  Ideal para perguntas sobre eventos recentes, preços, notícias, etc.
                </p>
              </div>
            )}
          </div>

          {/* Image Understanding (for vision models) */}
          {supportsVision && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Compreensão de Imagens
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Análise e descrição detalhada de imagens
                  </p>
                </div>
                <Switch
                  checked={configuration.enableImageUnderstanding || false}
                  onCheckedChange={(checked) => onConfigurationChange({ enableImageUnderstanding: checked })}
                />
              </div>
              
              {configuration.enableImageUnderstanding && (
                <div className="ml-6 space-y-2">
                  <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1 w-fit">
                    <Eye className="w-3 h-3" />
                    Visão Ativada
                  </Badge>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Capacidades:</strong></p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Análise detalhada do conteúdo visual</li>
                      <li>Identificação de objetos, pessoas e cenários</li>
                      <li>Leitura de texto em imagens (OCR)</li>
                      <li>Interpretação de gráficos e diagramas</li>
                      <li>Descrição de cores, composição e estilo</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Image Generation Info (for image models) */}
          {isImageGeneration && (
            <div className="space-y-2">
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                <Zap className="w-3 h-3" />
                Geração de Imagens
              </Badge>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Modelo:</strong> {configuration.model}</p>
                <p><strong>Qualidade:</strong> Alta resolução com detalhes profissionais</p>
                <p><strong>Estilos:</strong> Fotorrealismo, arte digital, ilustração</p>
                <p><strong>Custo:</strong> $0.07 por imagem gerada</p>
              </div>
            </div>
          )}

          {/* Model-specific Information */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Informações do Modelo</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-medium">Características Especiais:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Dados em tempo real</li>
                  <li>Processamento multimodal</li>
                  <li>Integração com X (Twitter)</li>
                  <li>Raciocínio avançado</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Casos de Uso Ideais:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Análise de tendências</li>
                  <li>Pesquisa atual</li>
                  <li>Análise de imagens</li>
                  <li>Criação de conteúdo</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}