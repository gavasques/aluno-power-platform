
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Search, CheckCircle, ExternalLink, Copy, Wrench } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTools } from "@/contexts/ToolsContext";

const Tools = () => {
  const { tools, toolTypes, addUserReview } = useTools();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedTool, setSelectedTool] = useState<any>(null);
  const [userReviewData, setUserReviewData] = useState({ rating: 5, comment: "" });
  const { toast } = useToast();

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || tool.typeId === selectedType;
    return matchesSearch && matchesType;
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

  const handleUserReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTool) {
      addUserReview({
        toolId: selectedTool.id,
        userId: 'current-user', // Em produção, vem do contexto de auth
        rating: userReviewData.rating,
        comment: userReviewData.comment,
      });
      setUserReviewData({ rating: 5, comment: "" });
      toast({
        title: "Sucesso!",
        description: "Sua avaliação foi enviada com sucesso.",
      });
    }
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
                <label className="text-sm font-medium mb-2 block">Tipo</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {toolTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                            LV Verificado
                          </Badge>
                        )}
                      </div>
                      <Badge variant="outline" className="mb-2">
                        {toolTypes.find(t => t.id === tool.typeId)?.name || tool.category}
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

          {filteredTools.length === 0 && (
            <div className="text-center py-12">
              <Wrench className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma ferramenta encontrada</h3>
              <p className="text-muted-foreground">
                Tente ajustar os filtros ou termos de busca.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Página de Detalhes da Ferramenta */}
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
                          LV Verificado
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline">
                      {toolTypes.find(t => t.id === selectedTool.typeId)?.name || selectedTool.category}
                    </Badge>
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
                <TabsList className="grid w-full grid-cols-8">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="features">Funcionalidades</TabsTrigger>
                  <TabsTrigger value="pricing">Preços</TabsTrigger>
                  <TabsTrigger value="availability">Brasil</TabsTrigger>
                  <TabsTrigger value="review">Avaliação LV</TabsTrigger>
                  <TabsTrigger value="proscons">Prós e Contras</TabsTrigger>
                  <TabsTrigger value="discounts">Descontos</TabsTrigger>
                  <TabsTrigger value="user-review">Avaliar</TabsTrigger>
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
                        {selectedTool.features?.map((feature: string, index: number) => (
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
                        {selectedTool.pricing?.plans?.map((plan: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h3 className="font-semibold text-lg">{plan.name}</h3>
                            <p className="text-2xl font-bold text-primary mb-3">{plan.price}</p>
                            <ul className="space-y-1">
                              {plan.features?.map((feature: string, fIndex: number) => (
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
                        <div className="flex">{renderStars(selectedTool.lvReview?.rating || 0)}</div>
                        <span className="text-lg font-semibold">{selectedTool.lvReview?.rating}</span>
                      </div>
                      <p className="text-muted-foreground">{selectedTool.lvReview?.review}</p>
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
                          {selectedTool.prosAndCons?.pros?.map((pro: string, index: number) => (
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
                          {selectedTool.prosAndCons?.cons?.map((con: string, index: number) => (
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
                        {selectedTool.discounts?.map((discount: any, index: number) => (
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
                                onClick={() => copyToClipboard(discount.coupon, "Cupom")}
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

                <TabsContent value="user-review" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Avaliar Ferramenta</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleUserReview} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Sua Avaliação</label>
                          <Select 
                            value={userReviewData.rating.toString()} 
                            onValueChange={(value) => setUserReviewData({...userReviewData, rating: parseInt(value)})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {[5, 4, 3, 2, 1].map(rating => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  <div className="flex items-center gap-2">
                                    <div className="flex">{renderStars(rating)}</div>
                                    <span>{rating} estrela{rating !== 1 ? 's' : ''}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Comentário (opcional)</label>
                          <Textarea
                            value={userReviewData.comment}
                            onChange={(e) => setUserReviewData({...userReviewData, comment: e.target.value})}
                            placeholder="Compartilhe sua experiência com esta ferramenta..."
                            rows={4}
                          />
                        </div>
                        <Button type="submit" className="w-full">
                          Enviar Avaliação
                        </Button>
                      </form>
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
