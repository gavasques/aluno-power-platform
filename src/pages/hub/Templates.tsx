
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Search, Eye, FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  title: string;
  category: string;
  content: string;
  customization: string[];
  whenToUse: string;
  preview: string;
  tags: string[];
  variables: string[];
}

const mockTemplates: Template[] = [
  {
    id: "1",
    title: "Email de Primeiro Contato com Fornecedor",
    category: "Comunicação com Fornecedores",
    content: `Prezado(a) [NOME_FORNECEDOR],

Espero que esta mensagem o(a) encontre bem.

Meu nome é [SEU_NOME] e represento a empresa [NOME_EMPRESA], especializada em [TIPO_NEGÓCIO]. Descobrimos sua empresa através de [FONTE] e ficamos impressionados com a qualidade dos seus produtos [CATEGORIA_PRODUTO].

Estamos interessados em estabelecer uma parceria comercial e gostaríamos de conhecer melhor:

• Catálogo completo de produtos
• Condições comerciais (preços, MOQ, forma de pagamento)
• Prazos de produção e entrega
• Certificações e qualidade dos produtos
• Possibilidade de customização

Nosso volume de compras mensal é de aproximadamente [VOLUME_COMPRAS] e temos planos de expansão para [MERCADO_DESTINO].

Aguardamos seu retorno para darmos início a uma parceria próspera.

Atenciosamente,
[SEU_NOME]
[CARGO]
[EMPRESA]
[CONTATO]`,
    customization: [
      "Substitua [NOME_FORNECEDOR] pelo nome do fornecedor",
      "Preencha [SEU_NOME] com seu nome completo",
      "Adapte [TIPO_NEGÓCIO] para sua área de atuação",
      "Especifique [VOLUME_COMPRAS] com dados reais"
    ],
    whenToUse: "Use este template quando entrar em contato pela primeira vez com um fornecedor potencial. Ideal para iniciar negociações e apresentar sua empresa de forma profissional.",
    preview: "Prezado(a) [NOME_FORNECEDOR], Meu nome é [SEU_NOME] e represento...",
    tags: ["fornecedor", "primeiro contato", "email", "apresentação"],
    variables: ["NOME_FORNECEDOR", "SEU_NOME", "NOME_EMPRESA", "TIPO_NEGÓCIO", "VOLUME_COMPRAS"]
  },
  {
    id: "2",
    title: "Abertura de Caso na Amazon - Produto com Problema",
    category: "Suporte Amazon",
    content: `Assunto: Problema com Produto ASIN [ASIN] - Necessário Suporte Urgente

Prezada Equipe de Suporte Amazon,

Sou vendedor na plataforma Amazon (ID do Vendedor: [SELLER_ID]) e estou enfrentando um problema com o produto ASIN [ASIN].

DESCRIÇÃO DO PROBLEMA:
[DESCREVER_PROBLEMA_DETALHADAMENTE]

IMPACTO:
• Perda de vendas: [VALOR_ESTIMADO]
• Avaliações negativas: [QUANTIDADE]
• Período afetado: [PERIODO]

AÇÕES JÁ TOMADAS:
1. [AÇÃO_1]
2. [AÇÃO_2]
3. [AÇÃO_3]

SOLUÇÃO SOLICITADA:
[DESCREVER_SOLUÇÃO_DESEJADA]

INFORMAÇÕES ADICIONAIS:
• SKU: [SKU]
• Lote afetado: [LOTE]
• Data de envio: [DATA_ENVIO]
• Centro de distribuição: [FC_CODE]

Peço urgência na resolução deste caso, pois está impactando significativamente nossos negócios.

Aguardo retorno em até 24 horas.

Atenciosamente,
[SEU_NOME]
[SELLER_ID]
[CONTATO]`,
    customization: [
      "Substitua [ASIN] pelo código do produto",
      "Detalhe o problema em [DESCREVER_PROBLEMA_DETALHADAMENTE]",
      "Quantifique o impacto financeiro em [VALOR_ESTIMADO]",
      "Liste as ações já tomadas"
    ],
    whenToUse: "Use quando tiver problemas com produtos na Amazon que precisam de intervenção do suporte. Essencial para casos de suspensão, problemas de qualidade ou erros no catálogo.",
    preview: "Prezada Equipe de Suporte Amazon, Sou vendedor na plataforma...",
    tags: ["amazon", "suporte", "problema", "caso"],
    variables: ["ASIN", "SELLER_ID", "DESCREVER_PROBLEMA_DETALHADAMENTE", "VALOR_ESTIMADO"]
  }
];

const Templates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const { toast } = useToast();

  const categories = ["Todos", "Comunicação com Fornecedores", "Suporte Amazon", "Marketing", "Jurídico"];

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "Todos" || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (content: string, title: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Template copiado!",
      description: `O template "${title}" foi copiado para a área de transferência.`,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Templates</h1>
        <p className="text-muted-foreground">
          Biblioteca de modelos de texto para comunicação profissional
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
                    placeholder="Buscar templates..."
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

        {/* Lista de Templates */}
        <div className="lg:w-3/4">
          <div className="grid gap-4">
            {filteredTemplates.map(template => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <CardTitle className="text-xl">{template.title}</CardTitle>
                      </div>
                      <Badge variant="secondary" className="mb-2">
                        {template.category}
                      </Badge>
                      <p className="text-muted-foreground">{template.preview}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(template.content, template.title)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map(tag => (
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
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedTemplate.title}</h2>
                  <Badge variant="secondary">{selectedTemplate.category}</Badge>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTemplate(null)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Conteúdo</TabsTrigger>
                  <TabsTrigger value="customization">Personalização</TabsTrigger>
                  <TabsTrigger value="usage">Quando Usar</TabsTrigger>
                </TabsList>

                <TabsContent value="content" className="mt-6">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Template Completo</CardTitle>
                        <Button
                          onClick={() => copyToClipboard(selectedTemplate.content, selectedTemplate.title)}
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copiar Template
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg">
                        <pre className="whitespace-pre-wrap text-sm">{selectedTemplate.content}</pre>
                      </div>
                      
                      {selectedTemplate.variables.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Variáveis para personalizar:</h4>
                          <div className="flex flex-wrap gap-1">
                            {selectedTemplate.variables.map(variable => (
                              <Badge key={variable} variant="outline" className="text-xs">
                                {variable}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="customization" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Como Personalizar</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {selectedTemplate.customization.map((step, index) => (
                          <div key={index} className="flex gap-3">
                            <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <p className="text-sm">{step}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="usage" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Quando Usar Este Template</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedTemplate.whenToUse}</p>
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

export default Templates;
