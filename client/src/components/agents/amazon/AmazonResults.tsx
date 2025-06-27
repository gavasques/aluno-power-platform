import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Copy, Eye, Star, TrendingUp, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { GeneratedContent, GeneratedTitle, ProductInsight } from '@/types/amazon';

interface AmazonResultsProps {
  content: GeneratedContent;
  onExport: (format: 'csv' | 'json' | 'txt') => void;
  isExporting?: boolean;
}

// Utilitários reutilizáveis
const formatAllContent = (content: GeneratedContent): string => `
TÍTULOS GERADOS:
${content.titles.map((title, index) => `${index + 1}. ${title.title} (Score: ${title.score})`).join('\n')}

BULLET POINTS:
${content.bulletPoints.map((point) => `• ${point}`).join('\n')}

DESCRIÇÃO:
${content.description}

PALAVRAS-CHAVE:
${content.keywords.join(', ')}

TERMOS DE BUSCA:
${content.searchTerms.join(', ')}
`.trim();

const TAB_CONFIG = [
  { id: 'titles', label: 'Títulos', icon: Star },
  { id: 'bullets', label: 'Bullet Points', icon: Target },
  { id: 'description', label: 'Descrição', icon: Eye },
  { id: 'insights', label: 'Insights', icon: TrendingUp }
] as const;

// Componentes auxiliares modulares
const ContentSection = ({ title, icon: Icon, children }: { 
  title: string; 
  icon: React.ComponentType<{ className?: string }>; 
  children: React.ReactNode;
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <Icon className="h-5 w-5" />
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const ContentCard = ({ children, index }: { 
  children: React.ReactNode; 
  index?: number;
}) => (
  <Card className="p-4">
    <CardContent className="p-0">
      {index !== undefined && (
        <div className="mb-2">
          <Badge variant="outline">#{index + 1}</Badge>
        </div>
      )}
      {children}
    </CardContent>
  </Card>
);

export const AmazonResults = ({ content, onExport, isExporting }: AmazonResultsProps) => {
  const [selectedTab, setSelectedTab] = useState('titles');
  const { toast } = useToast();

  const copyToClipboard = async (text: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copiado!", description: successMessage });
    } catch {
      toast({ title: "Erro ao copiar", variant: "destructive" });
    }
  };

  const copyAllContent = () => copyToClipboard(
    formatAllContent(content), 
    "Todo o conteúdo foi copiado para a área de transferência."
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Download className="h-5 w-5" />
            Conteúdo Gerado
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={copyAllContent}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar Tudo
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onExport('csv')}
              disabled={isExporting}
            >
              {isExporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            {[
              { id: 'titles', label: 'Títulos', count: content.titles.length },
              { id: 'bullets', label: 'Bullet Points', count: content.bulletPoints.length },
              { id: 'description', label: 'Descrição', count: 1 },
              { id: 'insights', label: 'Insights', count: content.insights.length }
            ].map(tab => {
              const Icon = getTabIcon(tab.id);
              return (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id}
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                    {tab.count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="titles" className="mt-6">
            <ContentSection title="Títulos Otimizados" icon={Star}>
              {content.titles.map((title, index) => (
                <ContentCard key={title.id} index={index}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Badge variant="outline" className="mb-2">Score: {title.score}/10</Badge>
                      <p className="font-medium">{title.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{title.length} caracteres</p>
                    </div>
                    <Button size="sm" variant="outline" 
                      onClick={() => copyToClipboard(title.title, "Título copiado!")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </ContentCard>
              ))}
            </ContentSection>
          </TabsContent>

          <TabsContent value="bullets" className="mt-6">
            <ContentSection title="Bullet Points" icon={Target}>
              {content.bulletPoints.map((bullet, index) => (
                <ContentCard key={index} index={index}>
                  <div className="flex justify-between items-start">
                    <p className="flex-1">{bullet}</p>
                    <Button size="sm" variant="outline"
                      onClick={() => copyToClipboard(bullet, "Bullet point copiado!")}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </ContentCard>
              ))}
            </ContentSection>
          </TabsContent>

          <TabsContent value="description" className="mt-6">
            <ContentSection title="Descrição do Produto" icon={Eye}>
              <ContentCard>
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button size="sm" variant="outline"
                      onClick={() => copyToClipboard(content.description, "Descrição copiada!")}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm">{content.description}</pre>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {content.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">{keyword}</Badge>
                    ))}
                  </div>
                </div>
              </ContentCard>
            </ContentSection>
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <ContentSection title="Insights e Recomendações" icon={TrendingUp}>
              {content.insights.map((insight, index) => (
                <ContentCard key={index}>
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={insight.impact === 'high' ? 'destructive' : 'secondary'}>
                        {insight.impact === 'high' ? 'Alto' : insight.impact === 'medium' ? 'Médio' : 'Baixo'} Impacto
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </ContentCard>
              ))}
            </ContentSection>
          </TabsContent>
        </Tabs>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{content.titles.length}</p>
            <p className="text-sm text-muted-foreground">Títulos</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{content.bulletPoints.length}</p>
            <p className="text-sm text-muted-foreground">Bullet Points</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{content.keywords.length}</p>
            <p className="text-sm text-muted-foreground">Keywords</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{content.insights.length}</p>
            <p className="text-sm text-muted-foreground">Insights</p>
          </div>
        </div>

        {/* Keywords Preview */}
        <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Palavras-chave Identificadas:</h4>
          <div className="flex flex-wrap gap-2">
            {content.keywords.slice(0, 10).map((keyword, index) => (
              <span 
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm"
              >
                {keyword}
              </span>
            ))}
            {content.keywords.length > 10 && (
              <span className="text-sm text-muted-foreground">
                +{content.keywords.length - 10} mais
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};