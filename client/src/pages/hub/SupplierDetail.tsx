import { useState } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Star, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Shield, 
  Calendar,
  MessageSquare,
  ThumbsUp,
  User,
  Building2,
  Linkedin,
  Instagram,
  Youtube
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Supplier } from "@shared/schema";

interface SupplierWithDetails extends Supplier {
  categoryName?: string;
  reviews?: SupplierReview[];
}

interface SupplierReview {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  isApproved: boolean;
}

const reviewSchema = z.object({
  rating: z.string().min(1, "Selecione uma avaliação"),
  comment: z.string().min(10, "Comentário deve ter pelo menos 10 caracteres").max(500, "Comentário não pode exceder 500 caracteres"),
});

const SupplierDetail = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const { data: supplier, isLoading } = useQuery({
    queryKey: ['/api/suppliers', id],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers/${id}`);
      if (!response.ok) throw new Error('Supplier not found');
      return response.json();
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['/api/suppliers', id, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers/${id}/reviews`);
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!id,
  });

  const form = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: "",
      comment: "",
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: { rating: number; comment: string }) => {
      const response = await fetch(`/api/suppliers/${id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create review');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', id, 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['/api/suppliers', id] });
      setIsReviewDialogOpen(false);
      form.reset();
      toast({
        title: "Avaliação enviada",
        description: "Sua avaliação foi enviada e está aguardando aprovação.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível enviar a avaliação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitReview = (data: { rating: string; comment: string }) => {
    createReviewMutation.mutate({
      rating: parseInt(data.rating),
      comment: data.comment,
    });
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${
            i <= rating 
              ? 'fill-yellow-400 text-yellow-400' 
              : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
          onClick={interactive && onRatingChange ? () => onRatingChange(i) : undefined}
        />
      );
    }
    return stars;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-64 bg-gray-200 rounded mb-6"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">Fornecedor não encontrado</h3>
            <p className="text-muted-foreground mb-4">O fornecedor que você está procurando não existe.</p>
            <Link href="/hub/fornecedores">
              <Button>Voltar aos Fornecedores</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum: number, review: SupplierReview) => sum + review.rating, 0) / reviews.length 
    : 0;

  const approvedReviews = reviews.filter((review: SupplierReview) => review.isApproved);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/hub/fornecedores">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{supplier.tradeName}</h1>
          <p className="text-muted-foreground">{supplier.corporateName}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações da Empresa</CardTitle>
                <div className="flex items-center gap-2">
                  {supplier.isVerified && (
                    <Badge className="bg-green-100 text-green-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  {supplier.categoryName && (
                    <Badge variant="outline">{supplier.categoryName}</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {supplier.description && (
                <div>
                  <h4 className="font-medium mb-2">Descrição</h4>
                  <p className="text-muted-foreground">{supplier.description}</p>
                </div>
              )}

              {/* Avaliações */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-1">
                  {renderStars(Math.round(averageRating))}
                  <span className="ml-2 font-medium">{averageRating.toFixed(1)}</span>
                </div>
                <span className="text-muted-foreground">
                  {approvedReviews.length} avaliação{approvedReviews.length !== 1 ? 'ões' : ''}
                </span>
                <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Avaliar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Avaliar Fornecedor</DialogTitle>
                      <DialogDescription>
                        Compartilhe sua experiência com {supplier.tradeName}
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleSubmitReview)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Avaliação</FormLabel>
                              <FormControl>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5].map((rating) => (
                                    <Star
                                      key={rating}
                                      className={`h-8 w-8 cursor-pointer ${
                                        rating <= parseInt(field.value || "0")
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300 hover:text-yellow-400'
                                      }`}
                                      onClick={() => field.onChange(rating.toString())}
                                    />
                                  ))}
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Comentário</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Conte sobre sua experiência com este fornecedor..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex gap-2">
                          <Button 
                            type="submit" 
                            disabled={createReviewMutation.isPending}
                          >
                            {createReviewMutation.isPending ? "Enviando..." : "Enviar Avaliação"}
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => setIsReviewDialogOpen(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliações ({approvedReviews.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {approvedReviews.length > 0 ? (
                <div className="space-y-4">
                  {approvedReviews.map((review: SupplierReview) => (
                    <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{review.userName}</span>
                            <div className="flex items-center gap-1">
                              {renderStars(review.rating)}
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-muted-foreground">Ainda não há avaliações para este fornecedor.</p>
                  <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a avaliar!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {supplier.commercialEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">E-mail Comercial</p>
                    <a 
                      href={`mailto:${supplier.commercialEmail}`} 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {supplier.commercialEmail}
                    </a>
                  </div>
                </div>
              )}

              {supplier.supportEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">E-mail Suporte</p>
                    <a 
                      href={`mailto:${supplier.supportEmail}`} 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {supplier.supportEmail}
                    </a>
                  </div>
                </div>
              )}

              {supplier.phone0800Sales && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Vendas</p>
                    <a 
                      href={`tel:${supplier.phone0800Sales}`} 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {supplier.phone0800Sales}
                    </a>
                  </div>
                </div>
              )}

              {supplier.phone0800Support && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Suporte</p>
                    <a 
                      href={`tel:${supplier.phone0800Support}`} 
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {supplier.phone0800Support}
                    </a>
                  </div>
                </div>
              )}

              {supplier.website && (
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Website</p>
                    <a 
                      href={supplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Visitar site
                    </a>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Social Media */}
          {(supplier.linkedin || supplier.instagram || supplier.youtube) && (
            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.linkedin && (
                  <a 
                    href={supplier.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-blue-600 hover:underline"
                  >
                    <Linkedin className="h-4 w-4" />
                    <span className="text-sm">LinkedIn</span>
                  </a>
                )}

                {supplier.instagram && (
                  <a 
                    href={supplier.instagram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-pink-600 hover:underline"
                  >
                    <Instagram className="h-4 w-4" />
                    <span className="text-sm">Instagram</span>
                  </a>
                )}

                {supplier.youtube && (
                  <a 
                    href={supplier.youtube} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-red-600 hover:underline"
                  >
                    <Youtube className="h-4 w-4" />
                    <span className="text-sm">YouTube</span>
                  </a>
                )}
              </CardContent>
            </Card>
          )}

          {/* Additional Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Adicionais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Cadastrado em</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(supplier.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {supplier.notes && (
                <div className="flex items-start gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Observações</p>
                    <p className="text-sm text-muted-foreground">{supplier.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupplierDetail;