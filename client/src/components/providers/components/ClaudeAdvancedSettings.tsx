// Claude Advanced Settings Component - Anthropic-specific features

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Zap, Shield, BookOpen } from "lucide-react";
import { ProviderConfiguration } from '../types';
import { CLAUDE_EXTENDED_THINKING_MODELS } from '../constants';

interface ClaudeAdvancedSettingsProps {
  configuration: ProviderConfiguration;
  onConfigurationChange: (updates: Partial<ProviderConfiguration>) => void;
}

export function ClaudeAdvancedSettings({ 
  configuration, 
  onConfigurationChange 
}: ClaudeAdvancedSettingsProps) {
  const supportsExtendedThinking = CLAUDE_EXTENDED_THINKING_MODELS.includes(configuration.model);

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
    return tokens.toString();
  };

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-purple-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2 text-purple-800">
            <Brain className="w-4 h-4" />
            Configurações Avançadas Claude
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Extended Thinking */}
          {supportsExtendedThinking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    Extended Thinking
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Raciocínio interno expandido antes da resposta final
                  </p>
                </div>
                <Switch
                  checked={configuration.enableExtendedThinking || false}
                  onCheckedChange={(checked) => onConfigurationChange({ enableExtendedThinking: checked })}
                />
              </div>
              
              {configuration.enableExtendedThinking && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Budget de Tokens para Pensamento</Label>
                      <Badge variant="outline">
                        {formatTokens(configuration.thinkingBudgetTokens || 10000)} tokens
                      </Badge>
                    </div>
                    
                    <Slider
                      value={[configuration.thinkingBudgetTokens || 10000]}
                      onValueChange={(value) => onConfigurationChange({ thinkingBudgetTokens: value[0] })}
                      min={1000}
                      max={50000}
                      step={1000}
                      className="w-full"
                    />
                    
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1K (Básico)</span>
                      <span>25K (Médio)</span>
                      <span>50K (Máximo)</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p><strong>Como funciona:</strong></p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li>Claude "pensa" internamente sobre o problema</li>
                      <li>Raciocínio mais profundo e estruturado</li>
                      <li>Maior precisão em tarefas complexas</li>
                      <li>Você não vê o pensamento, apenas a resposta final</li>
                    </ul>
                    
                    <p className="mt-2"><strong>Recomendações de Budget:</strong></p>
                    <ul className="list-disc ml-4 space-y-1">
                      <li><strong>1-5K:</strong> Problemas simples e diretos</li>
                      <li><strong>10-20K:</strong> Análises e raciocínio moderado</li>
                      <li><strong>25-50K:</strong> Problemas complexos e matemática</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Constitutional AI Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Constitutional AI
            </Label>
            <div className="space-y-2">
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1 w-fit">
                <Shield className="w-3 h-3" />
                Sempre Ativo
              </Badge>
              <div className="text-xs text-muted-foreground space-y-1">
                <p><strong>Características:</strong></p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Treinamento baseado em princípios éticos</li>
                  <li>Respostas mais seguras e responsáveis</li>
                  <li>Redução de vieses e conteúdo prejudicial</li>
                  <li>Transparência nas limitações</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Model Capabilities */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Capacidades do Modelo
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <p className="font-medium">Pontos Fortes:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Análise textual profunda</li>
                  <li>Raciocínio lógico</li>
                  <li>Escrita criativa</li>
                  <li>Programação e código</li>
                  <li>Pesquisa e síntese</li>
                </ul>
              </div>
              <div className="space-y-1">
                <p className="font-medium">Especialidades:</p>
                <ul className="list-disc ml-4 space-y-1">
                  <li>Contextos longos (até 200K tokens)</li>
                  <li>Análise de documentos</li>
                  <li>Problemas matemáticos</li>
                  <li>Tradução nuançada</li>
                  <li>Análise ética</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Context Window Info */}
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Janela de Contexto
            </Label>
            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Capacidade:</strong> Até 200.000 tokens de contexto</p>
              <p><strong>Equivale a:</strong> ~150.000 palavras ou ~600 páginas</p>
              <p><strong>Ideal para:</strong> Análise de documentos longos, códigos extensos, conversas longas</p>
            </div>
          </div>

          {/* Safety Features */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Recursos de Segurança</Label>
            <div className="grid grid-cols-1 gap-2">
              <Badge variant="outline" className="text-xs justify-start">
                <Shield className="w-3 h-3 mr-1" />
                Filtros de conteúdo integrados
              </Badge>
              <Badge variant="outline" className="text-xs justify-start">
                <Shield className="w-3 h-3 mr-1" />
                Detecção de prompts maliciosos
              </Badge>
              <Badge variant="outline" className="text-xs justify-start">
                <Shield className="w-3 h-3 mr-1" />
                Transparência em limitações
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}