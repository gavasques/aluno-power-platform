
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Search, CheckCircle, ExternalLink, Copy, Phone, Mail } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  logo: string;
  verified: boolean;
  officialRating: number;
  userRating: number;
  reviewCount: number;
  overview: string;
  features: string[];
  pricing: {
    plans: Array<{
      name: string;
      price: string;
      features: string[];
    }>;
  };
  availabilityBrazil: string;
  lvReview: {
    rating: number;
    review: string;
  };
  prosAndCons: {
    pros: string[];
    cons: string[];
  };
  discounts: Array<{
    description: string;
    link?: string;
    coupon?: string;
  }>;
}

const mockTools: Tool[] = [
  {
    id: "1",
    name: "Helium 10",
    category: "Pesquisa de Produtos",
    description: "Suite completa de ferramentas para vendedores Amazon",
    logo: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=100&h=100&fit=crop",
    verified: true,
    officialRating: 4.8,
    userRating: 4.5,
    reviewCount: 245,
    overview: "Helium 10 é uma das suites mais completas para vendedores Amazon, oferecendo mais de 30 ferramentas diferentes para pesquisa de produtos, otimização de listagens, análise de concorrentes e muito mais.",
    features: [
      "Pesquisa de palavras-chave",
      "Análise de concorrentes",
      "Otimização de listings",
      "Monitoramento de posição",
      "Alertas de hijacking"
    ],
    pricing: {
      plans: [
        {
          name: "Starter",
          price: "$39/mês",
          features: ["Acesso básico às ferramentas", "Limite de uso reduzido"]
        },
        {
          name: "Platinum",
          price: "$99/mês",
          features: ["Acesso completo", "Sem limites de uso", "Suporte prioritário"]
        }
      ]
    },
    availabilityBrazil: "Disponível com suporte em português. Aceita cartões brasileiros.",
    lvReview: {
      rating: 4.7,
      review: "Excelente ferramenta com interface intuitiva. O custo-benefício é muito bom considerando a quantidade de funcionalidades oferecidas."
    },
    prosAndCons: {
      pros: [
        "Interface amigável e intuitiva",
        "Suporte ao português",
        "Dados precisos e atualizados",
        "Comunidade ativa"
      ],
      cons: [
        "Preço elevado para iniciantes",
        "Curva de aprendizado inicial",
        "Algumas funcionalidades complexas"
      ]
    },
    discounts: [
      {
        description: "20% de desconto nos primeiros 6 meses",
        link: "https://helium10.com/lovable",
        coupon: "LOVABLE20"
      }
    ]
  }
];

const Tools = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const { toast } = useToast();

  const categories = ["Todas", "Pesquisa de Produtos", "Otimização", "Analytics", "Automação"];

  const filteredTools = mockTools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todas" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${type} copiado para a área de transferência.`,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ferramentas</h1>
        <p className="text-muted-foreground">
          Catálogo de softwares para e-commerce com análises detalhadas
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
                    placeholder="Buscar ferramentas..."
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

        {/* Lista de Ferramentas */}
        <div className="lg:w-3/4">
          <div className="grid gap-6">
            {filteredTools.map(tool => (
              <Card key={tool.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-xl">{tool.name}</CardTitle>
                        {tool.verified && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verificado
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {tool.category}
                      </Badge>
                      <p className="text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Avaliação LV:</span>
                        <div className="flex">{renderStars(tool.officialRating)}</div>
                        <span className="text-sm text-muted-foreground">
                          {tool.officialRating}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Usuários:</span>
                        <div className="flex">{renderStars(tool.userRating)}</div>
                        <span className="text-sm text-muted-foreground">
                          {tool.userRating} ({tool.reviewCount} avaliações)
                        </span>
                      </div>
                    </div>
                    <Button onClick={() => setSelectedTool(tool)}>
                      Ver Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedTool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedTool.logo}
                    alt={selectedTool.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold">{selectedTool.name}</h2>
                      {selectedTool.verified && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verificado
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline">{selectedTool.category}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedTool(null)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="features">Funcionalidades</TabsTrigger>
                  <TabsTrigger value="pricing">Preços</TabsTrigger>
                  <TabsTrigger value="availability">Brasil</TabsTrigger>
                  <TabsTrigger value="review">Avaliação LV</TabsTrigger>
                  <TabsTrigger value="proscons">Prós e Contras</TabsTrigger>
                  <TabsTrigger value="discounts">Descontos</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Visão Geral</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedTool.overview}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="features" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Funcionalidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {selectedTool.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pricing" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Preços</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        {selectedTool.pricing.plans.map((plan, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <p className="text-2xl font-bold text-primary mb-3">{plan.price}</p>
                            <ul className="space-y-1">
                              {plan.features.map((feature, fIndex) => (
                                <li key={fIndex} className="text-sm text-muted-foreground">
                                  • {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="availability" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Disponibilidade no Brasil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedTool.availabilityBrazil}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="review" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Avaliação LV</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex">{renderStars(selectedTool.lvReview.rating)}</div>
                        <span className="text-lg font-semibold">{selectedTool.lvReview.rating}</span>
                      </div>
                      <p className="text-muted-foreground">{selectedTool.lvReview.review}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="proscons" className="mt-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-green-600">Prós</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedTool.prosAndCons.pros.map((pro, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-red-600">Contras</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {selectedTool.prosAndCons.cons.map((con, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="h-4 w-4 text-red-500">×</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="discounts" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Links e Descontos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedTool.discounts.map((discount, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <p className="font-medium mb-2">{discount.description}</p>
                            {discount.link && (
                              <Button variant="outline" className="mr-2" asChild>
                                <a href={discount.link} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-2" />
                                  Acessar Link
                                </a>
                              </Button>
                            )}
                            {discount.coupon && (
                              <Button
                                variant="outline"
                                onClick={() => copyToClipboard(discount.coupon!, "Cupom")}
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar Cupom: {discount.coupon}
                              </Button>
                            )}
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

export default Tools;
