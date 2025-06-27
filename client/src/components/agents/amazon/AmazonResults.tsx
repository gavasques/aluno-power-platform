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

export const AmazonResults = ({ content, onExport, isExporting }: AmazonResultsProps) => {
  const [selectedTab, setSelectedTab] = useState('titles');
  const { toast } = useToast();

  const copyAllContent = async () => {
    const allContent = `
TÍTULOS GERADOS:
${content.titles.map((title, index) => `${index + 1}. ${title.title} (Score: ${title.score})`).join('\n')}

BULLET POINTS:
${content.bulletPoints.map((point, index) => `• ${point}`).join('\n')}

DESCRIÇÃO:
${content.description}

PALAVRAS-CHAVE:
${content.keywords.join(', ')}

TERMOS DE BUSCA:
${content.searchTerms.join(', ')}
    `.trim();

    try {
      await navigator.clipboard.writeText(allContent);
      toast({
        title: "Conteúdo copiado!",
        description: "Todo o conteúdo foi copiado para a área de transferência.",
      });
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  const getTabIcon = (tabId: string) => {
    switch (tabId) {
      case 'titles':
        return Star;
      case 'bullets':
        return Target;
      case 'description':
        return Eye;
      case 'insights':
        return TrendingUp;
      default:
        return Eye;
    }
  };

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
            <TitlesList 
              titles={content.titles}
              onCopy={(title: string) => {
                navigator.clipboard.writeText(title);
                toast({ title: "Título copiado!", description: "Título copiado para a área de transferência." });
              }}
            />
          </TabsContent>

          <TabsContent value="bullets" className="mt-6">
            <BulletPointsList 
              bulletPoints={content.bulletPoints}
              onCopy={(bullet) => {
                navigator.clipboard.writeText(bullet);
                toast({ title: "Bullet point copiado!", description: "Bullet point copiado para a área de transferência." });
              }}
            />
          </TabsContent>

          <TabsContent value="description" className="mt-6">
            <DescriptionEditor 
              description={content.description}
              keywords={content.keywords}
              onCopy={(description) => {
                navigator.clipboard.writeText(description);
                toast({ title: "Descrição copiada!", description: "Descrição copiada para a área de transferência." });
              }}
            />
          </TabsContent>

          <TabsContent value="insights" className="mt-6">
            <InsightsDisplay insights={content.insights} />
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