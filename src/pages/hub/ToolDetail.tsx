
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, CheckCircle, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTools } from "@/contexts/ToolsContext";

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tools, toolTypes, addUserReview } = useTools();
  const [userReviewData, setUserReviewData] = useState({ rating: 5, comment: "" });
  const { toast } = useToast();

  const tool = tools.find(t => t.id === id);

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Ferramenta não encontrada</h2>
          <Button onClick={() => navigate("/hub/ferramentas")}>
            Voltar para Ferramentas
          </Button>
        </div>
      </div>
    );
  }

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
    addUserReview({
      toolId: tool.id,
      userId: 'current-user',
      rating: userReviewData.rating,
      comment: userReviewData.comment,
    });
    setUserReviewData({ rating: 5, comment: "" });
    toast({
      title: "Sucesso!",
      description: "Sua avaliação foi enviada com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header da Ferramenta */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-start gap-6">
            <img
              src={tool.logo}
              alt={tool.name}
              className="w-24 h-24 rounded-lg object-cover border"
            />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-3xl font-bold">{tool.name}</h1>
                {tool.verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    LV Verificado
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="mb-4">
                {toolTypes.find(t => t.id === tool.typeId)?.name || tool.category}
              </Badge>
              <p className="text-lg text-muted-foreground mb-4">
                {tool.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Avaliação LV:</span>
                    <div className="flex">{renderStars(tool.officialRating)}</div>
                    <span className="text-muted-foreground">
                      {tool.officialRating}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Usuários:</span>
                    <div className="flex">{renderStars(tool.userRating)}</div>
                    <span className="text-muted-foreground">
                      {tool.userRating} ({tool.reviewCount})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
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
                <p className="text-muted-foreground leading-relaxed">{tool.overview}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {tool.features?.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tool.pricing?.plans?.map((plan: any, index: number) => (
                    <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold text-xl mb-2">{plan.name}</h3>
                      <p className="text-3xl font-bold text-primary mb-4">{plan.price}</p>
                      <ul className="space-y-2">
                        {plan.features?.map((feature: string, fIndex: number) => (
                          <li key={fIndex} className="text-sm text-muted-foreground flex items-center gap-2">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            {feature}
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
                <p className="text-muted-foreground leading-relaxed">{tool.availabilityBrazil}</p>
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
                  <div className="flex">{renderStars(tool.lvReview?.rating || 0)}</div>
                  <span className="text-2xl font-semibold">{tool.lvReview?.rating}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{tool.lvReview?.review}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="proscons" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Prós</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {tool.prosAndCons?.pros?.map((pro: string, index: number) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{pro}</span>
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
                  <ul className="space-y-3">
                    {tool.prosAndCons?.cons?.map((con: string, index: number) => (
                      <li key={index} className="flex items-center gap-3">
                        <span className="h-5 w-5 text-red-500 flex-shrink-0 text-xl">×</span>
                        <span className="text-muted-foreground">{con}</span>
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
                  {tool.discounts?.map((discount: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <p className="font-medium">{discount.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {discount.link && (
                          <Button variant="outline" asChild>
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
                <form onSubmit={handleUserReview} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-3">Sua Avaliação</label>
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
                    <label className="block text-sm font-medium mb-3">Comentário (opcional)</label>
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
  );
};

export default ToolDetail;
