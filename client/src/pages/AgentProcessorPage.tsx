import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ArrowLeft, Upload, FileText, Loader2, Download, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AgentWithPrompts, AmazonListingResponse } from "../types/agent.types";
import { apiRequest } from "@/lib/queryClient";

export default function AgentProcessorPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const [productName, setProductName] = useState("");
  const [productInfo, setProductInfo] = useState("");
  const [reviewsData, setReviewsData] = useState("");
  const [format, setFormat] = useState<"text" | "csv">("text");
  const [result, setResult] = useState<AmazonListingResponse | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { data: agent, isLoading } = useQuery<AgentWithPrompts>({
    queryKey: [`/api/agents/${id}`],
    enabled: !!id,
  });

  const processMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest(`/api/agents/${id}/process`, {
        method: "POST",
        body: data,
      }),
    onSuccess: (data: AmazonListingResponse) => {
      setResult(data);
      toast({
        title: "Processamento concluído",
        description: `Gerado em ${data.processingTime}ms por $${data.cost.toFixed(4)}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no processamento",
        description: error.message || "Falha ao processar listagem",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || !reviewsData.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome do produto e avaliações são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    processMutation.mutate({
      productName,
      productInfo,
      reviewsData,
      format,
    });
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast({
        title: "Copiado!",
        description: "Texto copiado para a área de transferência",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o texto",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Agente não encontrado</h2>
          <p className="text-muted-foreground mb-6">
            O agente solicitado não existe ou foi removido
          </p>
          <Button asChild>
            <Link href="/agentes">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Agentes
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/agentes">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Agentes
          </Link>
        </Button>
        
        <div className="flex items-center space-x-4 mb-2">
          <h1 className="text-3xl font-bold">{agent.name}</h1>
          <Badge variant={agent.isActive ? "default" : "secondary"}>
            {agent.isActive ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        
        <p className="text-muted-foreground">{agent.description}</p>
        
        <div className="flex items-center space-x-6 mt-4 text-sm text-muted-foreground">
          <span>Modelo: <strong>{agent.model}</strong></span>
          <span>Temperatura: <strong>{agent.temperature}</strong></span>
          <span>Max Tokens: <strong>{agent.maxTokens}</strong></span>
          <span>Custo/1k: <strong>${agent.costPer1kTokens}</strong></span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do Produto</CardTitle>
            <CardDescription>
              Insira as informações do produto e avaliações para processamento
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productName">Nome do Produto *</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="Ex: Smartphone Samsung Galaxy A54"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="productInfo">Informações Adicionais</Label>
                <Textarea
                  id="productInfo"
                  value={productInfo}
                  onChange={(e) => setProductInfo(e.target.value)}
                  placeholder="Especificações técnicas, características especiais..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reviewsData">Avaliações dos Clientes *</Label>
                <Textarea
                  id="reviewsData"
                  value={reviewsData}
                  onChange={(e) => setReviewsData(e.target.value)}
                  placeholder="Cole aqui as avaliações dos clientes..."
                  rows={8}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="format">Formato das Avaliações</Label>
                <Select value={format} onValueChange={(value: "text" | "csv") => setFormat(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={processMutation.isPending || !agent.isActive}
              >
                {processMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Processar Listagem
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              Listagem gerada automaticamente pelo agente de IA
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {result ? (
              <div className="space-y-6">
                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{result.processingTime}ms</div>
                    <div className="text-sm text-muted-foreground">Tempo</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{result.tokensUsed.total}</div>
                    <div className="text-sm text-muted-foreground">Tokens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${result.cost.toFixed(4)}</div>
                    <div className="text-sm text-muted-foreground">Custo</div>
                  </div>
                </div>

                {/* Analysis */}
                <div>
                  <h3 className="font-semibold mb-3">Análise do Produto</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Principais Benefícios</h4>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {result.analysis.mainBenefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Pontos de Dor</h4>
                      <ul className="text-sm list-disc list-inside space-y-1">
                        {result.analysis.painPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Titles */}
                <div>
                  <h3 className="font-semibold mb-3">Títulos Sugeridos</h3>
                  <div className="space-y-2">
                    {result.titles.map((title, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="text-sm flex-1">{title}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(title, index)}
                        >
                          {copiedIndex === index ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Bullet Points */}
                <div>
                  <h3 className="font-semibold mb-3">Bullet Points</h3>
                  <div className="space-y-2">
                    {result.bulletPoints.map((point, index) => (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                        <span className="text-sm flex-1">{point}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(point, index + 100)}
                        >
                          {copiedIndex === index + 100 ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold">Descrição</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(result.description, 9999)}
                    >
                      {copiedIndex === 9999 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <p className="text-sm whitespace-pre-wrap">{result.description}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aguardando processamento</h3>
                <p className="text-muted-foreground">
                  Preencha os dados do produto e clique em processar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}