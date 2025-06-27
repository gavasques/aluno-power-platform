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

  // Simular carregamento dos dados - em produção viria da query string ou context
  useEffect(() => {
    // Mock data para demonstração - em produção seria obtido do estado global ou API
    const mockResult: ProcessingResult = {
      analysis: {
        mainBenefits: [
          "Qualidade de som excepcional com drivers de 40mm",
          "Cancelamento ativo de ruído eficiente",
          "Bateria de longa duração (30+ horas)"
        ],
        painPoints: [
          "Conectividade Bluetooth instável em alguns dispositivos",
          "Desconforto após uso prolongado",
          "Falta de case de transporte adequado"
        ],
        keyFeatures: [
          "Bluetooth 5.0",
          "Cancelamento ativo de ruído",
          "Drivers 40mm",
          "Bateria 30h",
          "Design dobrável"
        ],
        targetAudience: "Profissionais que trabalham remotamente, estudantes universitários, amantes de música e gamers casuais",
        competitorWeaknesses: [
          "Preço elevado em relação ao valor oferecido",
          "Qualidade de construção inferior",
          "Suporte técnico limitado"
        ],
        opportunityAreas: [
          "Melhor custo-benefício",
          "Design mais ergonômico",
          "Conectividade mais estável"
        ],
        emotionalTriggers: [
          "Produtividade no trabalho",
          "Escape e relaxamento",
          "Status e qualidade premium"
        ],
        searchIntentAnalysis: "Usuários buscam principalmente por qualidade de som, conforto e durabilidade da bateria",
        pricePositioning: "Faixa média-premium (R$ 200-400) com foco em custo-benefício",
        marketDifferentiators: [
          "Tecnologia de cancelamento adaptativo",
          "Conectividade multi-dispositivo",
          "Design ergonômico superior"
        ]
      },
      titles: [
        "Fone Bluetooth Premium Cancelamento Ruído Ativo 30h Bateria Graves Potentes Conforto Ergonômico Trabalho Home Office Gaming Estudo Música",
        "Headphone Bluetooth 5.0 Noise Cancelling Dobrável 40mm Drivers Qualidade Studio Microfone HD Chamadas Profissionais Bateria Longa Duração",
        "Fone Ouvido Bluetooth Sem Fio Cancelamento Ativo Ruído Premium Quality Sound Confortável Leve Gaming Work From Home 30h Autonomia",
        "Bluetooth Headphones Cancelamento Ruído Profissional Qualidade Studio Drivers 40mm Bateria 30h Microfone HD Ergonômico Dobrável Premium",
        "Fone Bluetooth Noise Cancelling Premium Graves Potentes 30h Bateria Conforto Extremo Trabalho Remoto Gaming Música Qualidade Excepcional",
        "Headphone Sem Fio Bluetooth 5.0 Ativo Noise Cancel Drivers 40mm Som Crystal Clear Bateria Longa Duração Ergonômico Gaming Profissional",
        "Fone Bluetooth Premium Quality Cancelamento Ruído Adaptativo Conforto Ergonômico Superior Bateria 30h Gaming Work Music Studio Sound",
        "Bluetooth Headset Cancelamento Ativo Ruído Profissional Qualidade Premium Drivers 40mm Bateria Longa Duração Confortável Gaming Office",
        "Fone Ouvido Bluetooth Noise Cancelling Graves Potentes Som Cristalino Bateria 30h Ergonômico Dobrável Premium Gaming Work From Home",
        "Headphone Bluetooth Premium Cancelamento Ruído Ativo Qualidade Studio Drivers 40mm Conforto Extremo Bateria Longa Gaming Profissional"
      ],
      bulletPoints: [
        "🎵 QUALIDADE SONORA PREMIUM: Drivers de 40mm de alta definição entregam graves potentes, médios cristalinos e agudos nítidos para experiência musical imersiva",
        "🔇 CANCELAMENTO ATIVO DE RUÍDO: Tecnologia ANC avançada elimina até 95% dos ruídos externos, perfeito para foco no trabalho e imersão completa",
        "🔋 BATERIA DE LONGA DURAÇÃO: Até 30 horas de reprodução contínua com ANC ativo, carregamento rápido USB-C em apenas 2 horas, nunca fique sem música",
        "💼 CONFORTO ERGONÔMICO: Almofadas memory foam ultra-macias e headband acolchoado garantem conforto mesmo após 8+ horas de uso contínuo",
        "📱 CONECTIVIDADE UNIVERSAL: Bluetooth 5.0 estável conecta até 2 dispositivos simultaneamente, compatível com todos smartphones, tablets e computadores"
      ],
      description: "Experimente a revolução do áudio com nosso Fone Bluetooth Premium, projetado especificamente para profissionais exigentes e amantes da música de qualidade. Com tecnologia de cancelamento ativo de ruído de última geração, você terá foco total em suas atividades, seja no home office, gaming ou simplesmente relaxando com suas músicas favoritas.\n\nNossos drivers de 40mm de alta definição foram calibrados por engenheiros de áudio para entregar graves profundos e cristalinos, médios precisos e agudos brilhantes, proporcionando uma experiência sonora que rivaliza com equipamentos de estúdio profissional. A tecnologia ANC elimina até 95% dos ruídos externos, criando seu próprio ambiente sonoro privado.\n\nO design ergonômico com almofadas memory foam premium e headband ultra-acolchoado garante conforto excepcional mesmo durante maratonas de 8+ horas de uso. A construção dobrável e resistente torna o transporte simples e seguro.\n\nCom bateria de 30 horas e Bluetooth 5.0 que conecta até 2 dispositivos simultaneamente, você terá liberdade total para trabalhar, jogar e se entreter sem limitações. Microfone HD integrado garante chamadas profissionais cristalinas.\n\n✅ Garantia de 2 anos e suporte técnico especializado\n✅ Certificações internacionais de qualidade e segurança\n\nTransforme sua experiência sonora hoje mesmo - sua produtividade e bem-estar agradecem!",
      processingTime: 45230,
      tokensUsed: {
        input: 2450,
        output: 1230,
        total: 3680
      },
      cost: 0.0892,
      usageId: "usage-123",
      generationId: "gen-456"
    };

    setResult(mockResult);
    setEditedTitles([...mockResult.titles]);
    setEditedBulletPoints([...mockResult.bulletPoints]);
    setEditedDescription(mockResult.description);
  }, []);

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