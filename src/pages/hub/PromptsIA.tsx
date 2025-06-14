
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Search, Eye } from "lucide-react";
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
    tags: ["descrição", "vendas", "produto"]
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
    tags: ["email", "fornecedor", "negociação"]
  }
];

const PromptsIA = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const { toast } = useToast();

  const categories = ["Todos", "Descrições", "Comunicação", "Marketing", "Suporte"];

  const filteredPrompts = mockPrompts.filter(prompt => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Todos" || prompt.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Prompt copiado!",
      description: `O prompt "${title}" foi copiado para a área de transferência.`,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Prompts de IA</h1>
        <p className="text-muted-foreground">
          Biblioteca de prompts otimizados para ferramentas de IA externas
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de Filtros */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Prompts */}
        <div className="lg:w-3/4">
          <div className="grid gap-4">
            {filteredPrompts.map(prompt => (
              <Card key={prompt.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl mb-2">{prompt.title}</CardTitle>
                      <Badge variant="secondary" className="mb-2">
                        {prompt.category}
                      </Badge>
                      <p className="text-muted-foreground">{prompt.preview}</p>
                    </div>
                    <div className="flex gap-2">
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
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {prompt.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedPrompt.title}</h2>
                  <Badge variant="secondary">{selectedPrompt.category}</Badge>
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
