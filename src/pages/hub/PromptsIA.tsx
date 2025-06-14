
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Search, Eye, List, Grid3X3, Bot } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Prompt {
  id: string;
  title: string;
  category: string;
  content: string;
  examples: string[];
  preview: string;
  tags: string[];
  difficulty: "Básico" | "Intermediário" | "Avançado";
  uses: number;
}

const mockPrompts: Prompt[] = [
  {
    id: "1",
    title: "Descrição de Produto para E-commerce",
    category: "Descrições",
    content: "Crie uma descrição atrativa e persuasiva para o produto [NOME_DO_PRODUTO] que será vendido em e-commerce. Inclua: características principais, benefícios para o cliente, especificações técnicas relevantes e call-to-action convincente. Foque em resolver problemas do cliente e destaque diferenciais competitivos.",
    examples: [
      "Para um smartphone: destaque câmera, bateria, design",
      "Para roupas: materiais, caimento, ocasiões de uso"
    ],
    preview: "Crie uma descrição atrativa e persuasiva para o produto...",
    tags: ["descrição", "vendas", "produto"],
    difficulty: "Básico",
    uses: 1245
  },
  {
    id: "2",
    title: "Email para Negociação com Fornecedor",
    category: "Comunicação",
    content: "Redija um email profissional para negociar com fornecedor sobre [PRODUTO/SERVIÇO]. Inclua: apresentação da empresa, volume de compras esperado, condições de pagamento desejadas, prazo de entrega necessário. Mantenha tom respeitoso mas firme nas negociações.",
    examples: [
      "Negociação de preços para compra em volume",
      "Solicitação de amostras grátis"
    ],
    preview: "Redija um email profissional para negociar...",
    tags: ["email", "fornecedor", "negociação"],
    difficulty: "Intermediário",
    uses: 856
  },
  {
    id: "3",
    title: "Análise de Concorrência",
    category: "Pesquisa",
    content: "Analise os principais concorrentes de [PRODUTO/NICHO]. Identifique: preços praticados, principais canais de venda, estratégias de marketing, pontos fortes e fracos, oportunidades de diferenciação. Forneça recomendações estratégicas baseadas na análise.",
    examples: [
      "Análise de smartphones na faixa de R$ 1.000-2.000",
      "Concorrentes no nicho de moda fitness feminina"
    ],
    preview: "Analise os principais concorrentes de [PRODUTO/NICHO]...",
    tags: ["concorrência", "análise", "estratégia"],
    difficulty: "Avançado",
    uses: 623
  },
  {
    id: "4",
    title: "Resposta a Avaliação Negativa",
    category: "Atendimento",
    content: "Crie uma resposta profissional e empática para uma avaliação negativa recebida sobre [PRODUTO/SERVIÇO]. A resposta deve: reconhecer o problema, pedir desculpas sinceramente, oferecer solução concreta, demonstrar comprometimento com a melhoria.",
    examples: [
      "Produto chegou com defeito",
      "Demora na entrega"
    ],
    preview: "Crie uma resposta profissional e empática...",
    tags: ["atendimento", "resposta", "avaliação"],
    difficulty: "Intermediário",
    uses: 734
  },
  {
    id: "5",
    title: "Post para Redes Sociais",
    category: "Marketing",
    content: "Crie um post engajante para [REDE_SOCIAL] sobre [PRODUTO/TEMA]. Inclua: hook chamativo, benefícios principais, call-to-action claro, hashtags relevantes. Adapte o tom e formato para a rede social específica.",
    examples: [
      "Post no Instagram sobre lançamento de produto",
      "LinkedIn sobre tendências do mercado"
    ],
    preview: "Crie um post engajante para [REDE_SOCIAL]...",
    tags: ["social media", "post", "engajamento"],
    difficulty: "Básico",
    uses: 1567
  },
  {
    id: "6",
    title: "Análise SWOT de Produto",
    category: "Análise",
    content: "Realize uma análise SWOT completa para [PRODUTO/SERVIÇO]. Identifique Forças (Strengths), Fraquezas (Weaknesses), Oportunidades (Opportunities) e Ameaças (Threats). Para cada ponto, forneça explicação detalhada e sugestões de ação.",
    examples: [
      "SWOT de um aplicativo de delivery",
      "Análise para produto importado da China"
    ],
    preview: "Realize uma análise SWOT completa para [PRODUTO/SERVIÇO]...",
    tags: ["swot", "análise", "estratégia"],
    difficulty: "Avançado",
    uses: 445
  }
];

const PromptsIA = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todas");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const { toast } = useToast();

  const categories = ["Todos", "Descrições", "Comunicação", "Marketing", "Suporte", "Pesquisa", "Análise", "Atendimento"];
  const difficulties = ["Todas", "Básico", "Intermediário", "Avançado"];

  const filteredPrompts = mockPrompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Todos" || prompt.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "Todas" || prompt.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const copyToClipboard = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Prompt copiado!",
      description: `O prompt "${title}" foi copiado para a área de transferência.`,
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Básico": return "bg-green-100 text-green-800";
      case "Intermediário": return "bg-yellow-100 text-yellow-800";
      case "Avançado": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filteredPrompts.map(prompt => (
        <Card key={prompt.id} className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-2 mb-2">
              <Bot className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
              <CardTitle className="text-sm font-semibold line-clamp-2">{prompt.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">{prompt.category}</Badge>
              <Badge className={`text-xs ${getDifficultyColor(prompt.difficulty)}`}>
                {prompt.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground mb-3 line-clamp-3">{prompt.preview}</p>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {prompt.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{prompt.uses} usos</span>
            </div>

            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-xs h-7"
                onClick={() => setSelectedPrompt(prompt)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button
                size="sm"
                className="flex-1 text-xs h-7"
                onClick={() => copyToClipboard(prompt.content, prompt.title)}
              >
                <Copy className="h-3 w-3 mr-1" />
                Copiar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-3">
      {filteredPrompts.map(prompt => (
        <Card key={prompt.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Bot className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold mb-1">{prompt.title}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{prompt.category}</Badge>
                      <Badge className={getDifficultyColor(prompt.difficulty)}>
                        {prompt.difficulty}
                      </Badge>
                      <span className="text-sm text-muted-foreground">{prompt.uses} usos</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{prompt.preview}</p>
                <div className="flex flex-wrap gap-1">
                  {prompt.tags.map(tag => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedPrompt(prompt)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Ver
                </Button>
                <Button 
                  size="sm"
                  onClick={() => copyToClipboard(prompt.content, prompt.title)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Copiar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Prompts de IA</h1>
        <p className="text-muted-foreground">
          Biblioteca de prompts otimizados para ferramentas de IA externas
        </p>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar prompts..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map(difficulty => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Resultados */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {filteredPrompts.length} prompts encontrados
        </p>
      </div>

      {viewMode === "grid" ? renderGridView() : renderListView()}

      {/* Modal de Detalhes */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedPrompt.title}</h2>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedPrompt.category}</Badge>
                    <Badge className={getDifficultyColor(selectedPrompt.difficulty)}>
                      {selectedPrompt.difficulty}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedPrompt(null)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="content">Conteúdo do Prompt</TabsTrigger>
                  <TabsTrigger value="examples">Exemplos de Uso</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Prompt Completo</CardTitle>
                        <Button
                          onClick={() => copyToClipboard(selectedPrompt.content, selectedPrompt.title)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Prompt
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{selectedPrompt.content}</pre>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="examples" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Exemplos de Uso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedPrompt.examples.map((example, index) => (
                          <div key={index} className="bg-muted p-4 rounded-lg">
                            <p className="text-sm">{example}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptsIA;
