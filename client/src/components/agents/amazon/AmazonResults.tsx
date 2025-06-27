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

// Componentes auxiliares para modularização
const SummaryStats = ({ content }: { content: GeneratedContent }) => {
  const stats = [
    { label: 'Títulos', value: content.titles.length, color: 'blue' },
    { label: 'Bullet Points', value: content.bulletPoints.length, color: 'green' },
    { label: 'Keywords', value: content.keywords.length, color: 'purple' },
    { label: 'Insights', value: content.insights.length, color: 'orange' }
  ];

  return (
    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map(({ label, value, color }) => (
        <div key={label} className={`text-center p-3 bg-${color}-50 rounded-lg`}>
          <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      ))}
    </div>
  );
};

const KeywordsPreview = ({ keywords }: { keywords: string[] }) => (
  <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
    <h4 className="font-medium text-gray-800 mb-2">Palavras-chave Identificadas:</h4>
    <div className="flex flex-wrap gap-2">
      {keywords.slice(0, 10).map((keyword, index) => (
        <Badge key={index} variant="secondary">{keyword}</Badge>
      ))}
      {keywords.length > 10 && (
        <span className="text-sm text-muted-foreground">
          +{keywords.length - 10} mais
        </span>
      )}
    </div>
  </div>
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
            {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
              <TabsTrigger key={id} value={id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
                  {id === 'titles' ? content.titles.length :
                   id === 'bullets' ? content.bulletPoints.length :
                   id === 'description' ? 1 :
                   content.insights.length}
                </span>
              </TabsTrigger>
            ))}
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

        <SummaryStats content={content} />
        <KeywordsPreview keywords={content.keywords} />
      </CardContent>
    </Card>
  );
};