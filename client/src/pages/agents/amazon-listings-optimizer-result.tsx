import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  Edit3, 
  Save, 
  X,
  Clock,
  DollarSign,
  Zap,
  ChevronDown,
  ChevronUp,
  Files,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface ProcessingResult {
  analysis: {
    mainBenefits: string[];
    painPoints: string[];
    keyFeatures: string[];
    targetAudience: string;
    competitorWeaknesses: string[];
    opportunityAreas: string[];
    emotionalTriggers: string[];
    searchIntentAnalysis: string;
    pricePositioning: string;
    marketDifferentiators: string[];
  };
  titles: string[];
  bulletPoints: string[];
  description: string;
  processingTime: number;
  tokensUsed: {
    input: number;
    output: number;
    total: number;
  };
  cost: number;
  usageId: string;
  generationId: string;
}

interface EditableCardProps {
  title: string;
  items: string[];
  onItemChange: (index: number, value: string) => void;
  maxLength?: number;
  showCharCount?: boolean;
  copyAllLabel?: string;
}

function EditableCard({ title, items, onItemChange, maxLength = 200, showCharCount = true, copyAllLabel = "Copiar Todos" }: EditableCardProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const { toast } = useToast();

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(items[index]);
  };

  const saveEdit = () => {
    if (editingIndex !== null) {
      onItemChange(editingIndex, editValue);
      setEditingIndex(null);
      toast({
        description: "Item editado com sucesso!"
      });
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const copyItem = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        description: "Copiado para a área de transferência!"
      });
    } catch (error) {
      toast({
        description: "Erro ao copiar texto",
        variant: "destructive"
      });
    }
  };

  const copyAll = async () => {
    try {
      const allText = items.join('\n\n');
      await navigator.clipboard.writeText(allText);
      toast({
        description: `${copyAllLabel} copiados com sucesso!`
      });
    } catch (error) {
      toast({
        description: "Erro ao copiar textos",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
          <Button variant="outline" size="sm" onClick={copyAll}>
            <Files className="w-4 h-4 mr-2" />
            {copyAllLabel}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
            {editingIndex === index ? (
              <div className="space-y-3">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="min-h-[100px] resize-none"
                  maxLength={maxLength}
                />
                {showCharCount && (
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{editValue.length}/{maxLength} caracteres</span>
                    <span className={editValue.length > maxLength ? "text-red-500" : ""}>
                      {editValue.length > maxLength ? "Limite excedido" : ""}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button size="sm" onClick={saveEdit} disabled={editValue.length > maxLength}>
                    <Save className="w-3 h-3 mr-1" />
                    Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    <X className="w-3 h-3 mr-1" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start gap-3 mb-2">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => startEdit(index)}>
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => copyItem(item)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-800 leading-relaxed">{item}</p>
                {showCharCount && (
                  <div className="mt-2 text-xs text-gray-500">
                    {item.length} caracteres
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AmazonListingsOptimizerResult() {
  const [, navigate] = useLocation();
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [editedTitles, setEditedTitles] = useState<string[]>([]);
  const [editedBulletPoints, setEditedBulletPoints] = useState<string[]>([]);
  const [editedDescription, setEditedDescription] = useState("");
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const { toast } = useToast();

  // Load data from sessionStorage
  useEffect(() => {
    const storedResult = sessionStorage.getItem('amazonListingResult');
    if (!storedResult) {
      navigate('/agents/amazon-listings-optimizer');
      return;
    }

    try {
      const parsedResult: ProcessingResult = JSON.parse(storedResult);
      setResult(parsedResult);
      setEditedTitles([...parsedResult.titles]);
      setEditedBulletPoints([...parsedResult.bulletPoints]);
      setEditedDescription(parsedResult.description);
    } catch (error) {
      console.error('Error parsing stored result:', error);
      navigate('/agents/amazon-listings-optimizer');
      return;
    }
  }, [navigate]);

  const updateTitle = (index: number, value: string) => {
    const updated = [...editedTitles];
    updated[index] = value;
    setEditedTitles(updated);
  };

  const updateBulletPoint = (index: number, value: string) => {
    const updated = [...editedBulletPoints];
    updated[index] = value;
    setEditedBulletPoints(updated);
  };

  const copyDescription = async () => {
    try {
      await navigator.clipboard.writeText(editedDescription);
      toast({
        description: "Descrição copiada com sucesso!"
      });
    } catch (error) {
      toast({
        description: "Erro ao copiar descrição",
        variant: "destructive"
      });
    }
  };

  const copyAnalysis = async () => {
    if (!result) return;
    
    try {
      const analysisText = `
ANÁLISE DE MERCADO - RESULTADO

Principais Benefícios:
${result.analysis.mainBenefits.map((b, i) => `${i + 1}. ${b}`).join('\n')}

Principais Dores/Problemas:
${result.analysis.painPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Características Técnicas Valorizadas:
${result.analysis.keyFeatures.join(', ')}

Público-alvo:
${result.analysis.targetAudience}

Fraquezas dos Concorrentes:
${result.analysis.competitorWeaknesses.map((w, i) => `${i + 1}. ${w}`).join('\n')}

Oportunidades de Melhoria:
${result.analysis.opportunityAreas.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Gatilhos Emocionais:
${result.analysis.emotionalTriggers.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Intenção de Busca:
${result.analysis.searchIntentAnalysis}

Posicionamento de Preço:
${result.analysis.pricePositioning}

Diferenciadores de Mercado:
${result.analysis.marketDifferentiators.map((d, i) => `${i + 1}. ${d}`).join('\n')}
      `.trim();
      
      await navigator.clipboard.writeText(analysisText);
      toast({
        description: "Análise completa copiada!"
      });
    } catch (error) {
      toast({
        description: "Erro ao copiar análise",
        variant: "destructive"
      });
    }
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Header de Sucesso */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" asChild className="p-2">
              <Link href="/agents/amazon-listings-optimizer">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-500 shadow-lg">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Processamento Concluído!
                  </h1>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Sucesso
                  </Badge>
                </div>
                <p className="text-gray-600 text-lg">
                  Sua listagem Amazon foi otimizada com sucesso. Revise e edite os resultados conforme necessário.
                </p>
              </div>
            </div>
          </div>

          {/* Métricas do Processamento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Tempo de Processamento</p>
                  <p className="text-lg font-semibold">{(result.processingTime / 1000).toFixed(1)}s</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <Zap className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Tokens Utilizados</p>
                  <p className="text-lg font-semibold">{result.tokensUsed.total.toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Custo do Processamento</p>
                  <p className="text-lg font-semibold">${result.cost.toFixed(4)}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Títulos */}
            <EditableCard
              title="Títulos Otimizados (10)"
              items={editedTitles}
              onItemChange={updateTitle}
              maxLength={200}
              copyAllLabel="Copiar Títulos"
            />

            {/* Bullet Points */}
            <EditableCard
              title="Bullet Points (5)"
              items={editedBulletPoints}
              onItemChange={updateBulletPoint}
              maxLength={200}
              copyAllLabel="Copiar Bullet Points"
            />

            {/* Descrição */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Descrição Completa
                  </CardTitle>
                  <div className="flex gap-2">
                    {!isEditingDescription && (
                      <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(true)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={copyDescription}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isEditingDescription ? (
                  <div className="space-y-4">
                    <Textarea
                      value={editedDescription}
                      onChange={(e) => setEditedDescription(e.target.value)}
                      className="min-h-[300px] resize-none"
                      maxLength={2000}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {editedDescription.length}/2000 caracteres
                      </span>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            setIsEditingDescription(false);
                            toast({ description: "Descrição editada com sucesso!" });
                          }}
                        >
                          <Save className="w-3 h-3 mr-1" />
                          Salvar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => setIsEditingDescription(false)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="whitespace-pre-wrap text-gray-800 leading-relaxed mb-4">
                      {editedDescription}
                    </div>
                    <div className="text-xs text-gray-500">
                      {editedDescription.length} caracteres
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Análise Lateral */}
          <div className="space-y-6">
            
            {/* Análise das Avaliações */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-gray-900">
                    Análise das Avaliações
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyAnalysis}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowAnalysis(!showAnalysis)}
                    >
                      {showAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {showAnalysis && (
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Principais Benefícios</h4>
                    <ul className="space-y-1 text-gray-600">
                      {result.analysis.mainBenefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Principais Dores</h4>
                    <ul className="space-y-1 text-gray-600">
                      {result.analysis.painPoints.map((pain, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-red-500 mt-1">•</span>
                          {pain}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Público-alvo</h4>
                    <p className="text-gray-600">{result.analysis.targetAudience}</p>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Oportunidades</h4>
                    <ul className="space-y-1 text-gray-600">
                      {result.analysis.opportunityAreas.map((opportunity, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-1">•</span>
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">Posicionamento de Preço</h4>
                    <p className="text-gray-600">{result.analysis.pricePositioning}</p>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Ações Rápidas */}
            <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Ações Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                  asChild
                >
                  <Link href="/agents/amazon-listings-optimizer">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Nova Otimização
                  </Link>
                </Button>
                
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Resultados salvos automaticamente. Você pode voltar a esta página a qualquer momento.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}