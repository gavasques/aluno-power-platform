
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ImageUpload } from "@/components/ui/image-upload";
import { Star, CheckCircle, ExternalLink, Copy, MessageCircle, Trash2, Reply } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useTools } from "@/contexts/ToolsContext";

const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { tools, toolTypes, getUserReviewsForTool, addUserReview, deleteUserReview, addReplyToReview } = useTools();
  const [userReviewData, setUserReviewData] = useState({ 
    rating: 5, 
    comment: "", 
    photos: [] as string[] 
  });
  const [replyData, setReplyData] = useState<{ [key: string]: string }>({});
  const [showReplyDialog, setShowReplyDialog] = useState<string | null>(null);
  const { toast } = useToast();

  const tool = tools.find(t => t.id === id);
  const userReviews = getUserReviewsForTool(id || '');

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

  const getBrazilBadge = () => {
    switch (tool.brazilSupport) {
      case 'works':
        return <Badge className="bg-green-100 text-green-700 border-green-300">Funciona no Brasil</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">Funciona Parcialmente no Brasil</Badge>;
      case 'no':
        return <Badge className="bg-red-100 text-red-700 border-red-300">Não roda no Brasil</Badge>;
      default:
        return null;
    }
  };

  const handleUserReview = (e: React.FormEvent) => {
    e.preventDefault();
    addUserReview({
      toolId: tool.id,
      userId: 'current-user',
      userName: 'Usuário Atual',
      rating: userReviewData.rating,
      comment: userReviewData.comment,
      photos: userReviewData.photos,
    });
    setUserReviewData({ rating: 5, comment: "", photos: [] });
    toast({
      title: "Sucesso!",
      description: "Sua avaliação foi enviada com sucesso.",
    });
  };

  const handleDeleteReview = (reviewId: string) => {
    deleteUserReview(reviewId);
    toast({
      title: "Sucesso!",
      description: "Avaliação removida com sucesso.",
    });
  };

  const handleReply = (reviewId: string) => {
    const comment = replyData[reviewId];
    if (comment?.trim()) {
      addReplyToReview(reviewId, {
        userId: 'current-user',
        userName: 'Usuário Atual',
        comment: comment.trim()
      });
      setReplyData(prev => ({ ...prev, [reviewId]: '' }));
      setShowReplyDialog(null);
      toast({
        title: "Sucesso!",
        description: "Resposta enviada com sucesso.",
      });
    }
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
                {getBrazilBadge()}
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="features">Funcionalidades</TabsTrigger>
            <TabsTrigger value="guilherme-review">Avaliação Guilherme</TabsTrigger>
            <TabsTrigger value="proscons">Prós e Contras</TabsTrigger>
            <TabsTrigger value="discounts">Descontos</TabsTrigger>
            <TabsTrigger value="reviews">Avaliações</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{tool.overview}</p>
              </CardContent>
            </Card>

            {tool.pricing?.plans && tool.pricing.plans.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preços</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tool.pricing.plans.map((plan, index) => (
                      <div key={index} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold text-xl mb-2">{plan.name}</h3>
                        <p className="text-3xl font-bold text-primary mb-4">{plan.price}</p>
                        <ul className="space-y-2">
                          {plan.features?.map((feature, fIndex) => (
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
            )}
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <div className="space-y-6">
              {tool.features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                    {feature.photos.length > 0 && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {feature.photos.map((photo, photoIndex) => (
                          <img
                            key={photoIndex}
                            src={photo}
                            alt={`${feature.title} - Imagem ${photoIndex + 1}`}
                            className="w-full h-48 object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="guilherme-review" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Avaliação Guilherme</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex">{renderStars(tool.guilhermeReview?.rating || 0)}</div>
                  <span className="text-2xl font-semibold">{tool.guilhermeReview?.rating}</span>
                </div>
                <p className="text-muted-foreground leading-relaxed">{tool.guilhermeReview?.review}</p>
                
                {tool.guilhermeReview?.photos && tool.guilhermeReview.photos.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Screenshots da Avaliação</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {tool.guilhermeReview.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Avaliação Guilherme - Imagem ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border"
                        />
                      ))}
                    </div>
                  </div>
                )}
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
                    {tool.prosAndCons?.pros?.map((pro, index) => (
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
                    {tool.prosAndCons?.cons?.map((con, index) => (
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
                  {tool.discounts?.map((discount, index) => (
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

          <TabsContent value="reviews" className="mt-6 space-y-6">
            {/* Formulário para nova avaliação */}
            <Card>
              <CardHeader>
                <CardTitle>Avaliar Ferramenta</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUserReview} className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Sua Avaliação</label>
                    <Select 
                      value={userReviewData.rating.toString()} 
                      onValueChange={(value) => setUserReviewData({...userReviewData, rating: parseInt(value)})}
                    >
                      <SelectTrigger className="w-full">
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
                  
                  <div className="space-y-3">
                    <label className="block text-sm font-medium">Comentário</label>
                    <Textarea
                      value={userReviewData.comment}
                      onChange={(e) => setUserReviewData({...userReviewData, comment: e.target.value})}
                      placeholder="Compartilhe sua experiência com esta ferramenta..."
                      rows={4}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <ImageUpload
                      images={userReviewData.photos}
                      onImagesChange={(photos) => setUserReviewData({...userReviewData, photos})}
                      label="Fotos da sua experiência (opcional)"
                      maxImages={3}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Enviar Avaliação
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Lista de avaliações */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Avaliações dos Usuários ({userReviews.length})</h3>
              
              {userReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{review.userName}</span>
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Reply className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Responder Avaliação</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <Textarea
                                  value={replyData[review.id] || ''}
                                  onChange={(e) => setReplyData(prev => ({...prev, [review.id]: e.target.value}))}
                                  placeholder="Digite sua resposta..."
                                  rows={3}
                                />
                                <Button 
                                  onClick={() => handleReply(review.id)}
                                  className="w-full"
                                  disabled={!replyData[review.id]?.trim()}
                                >
                                  Enviar Resposta
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          {review.userId === 'current-user' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteReview(review.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {review.photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {review.photos.map((photo, index) => (
                            <img
                              key={index}
                              src={photo}
                              alt={`Foto da avaliação ${index + 1}`}
                              className="w-full h-32 object-cover rounded border"
                            />
                          ))}
                        </div>
                      )}

                      {review.replies.length > 0 && (
                        <div className="pl-6 border-l-2 border-muted space-y-3">
                          {review.replies.map((reply) => (
                            <div key={reply.id} className="bg-muted/50 rounded p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-medium">{reply.userName}</span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(reply.createdAt).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{reply.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {userReviews.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma avaliação ainda</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Seja o primeiro a avaliar esta ferramenta!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ToolDetail;
