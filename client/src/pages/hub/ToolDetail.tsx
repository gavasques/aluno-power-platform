import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, ArrowLeft, Star } from "lucide-react";
import { useTools } from "@/contexts/ToolsContext";
import { useAuth } from "@/contexts/AuthContext";
import { ToolReviews } from "@/components/reviews/ToolReviews";
import { ToolDiscounts } from "@/components/discounts/ToolDiscounts";
import { ToolVideos } from "@/components/videos/ToolVideos";

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tools, toolTypes } = useTools();
  const { user, isAdmin } = useAuth();

  const tool = tools.find(t => t.id.toString() === id);

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

  const toolType = toolTypes.find(t => t.id === tool.typeId);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/hub/ferramentas")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
        </div>
      </div>

      {/* Tool Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {tool.logo && (
              <div className="flex-shrink-0">
                <img
                  src={tool.logo}
                  alt={tool.name}
                  className="h-20 w-20 object-contain rounded-lg border"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
              <Badge variant="secondary" className="mb-4">
                {toolType?.name || "Ferramenta"}
              </Badge>
              <p className="text-lg text-gray-600 mb-4">
                {tool.description}
              </p>
              <div className="flex items-center gap-4">
                {tool.website && (
                  <Button asChild>
                    <a
                      href={tool.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Visitar Site
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="pros-cons">Prós e Contras</TabsTrigger>
            <TabsTrigger value="videos">Vídeos</TabsTrigger>
            <TabsTrigger value="discounts">Descontos</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sobre a Ferramenta</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">{tool.description}</p>
                {tool.website && (
                  <div className="mt-4">
                    <Button asChild variant="outline">
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Acessar Website
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Funcionalidades</CardTitle>
              </CardHeader>
              <CardContent>
                {tool.features && tool.features.length > 0 ? (
                  <div className="grid gap-4">
                    {tool.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Funcionalidades não disponíveis no momento
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pros-cons" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Prós</CardTitle>
                </CardHeader>
                <CardContent>
                  {tool.pros && tool.pros.length > 0 ? (
                    <div className="space-y-3">
                      {tool.pros.map((pro, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <span className="text-gray-700">{pro}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Nenhum pró listado
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600">Contras</CardTitle>
                </CardHeader>
                <CardContent>
                  {tool.cons && tool.cons.length > 0 ? (
                    <div className="space-y-3">
                      {tool.cons.map((con, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <span className="text-gray-700">{con}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Nenhum contra listado
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="videos" className="mt-6">
            <ToolVideos toolId={tool.id} />
          </TabsContent>

          <TabsContent value="discounts" className="mt-6">
            <ToolDiscounts toolId={tool.id} isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="reviews" className="mt-6">
            <ToolReviews toolId={tool.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ToolDetail;