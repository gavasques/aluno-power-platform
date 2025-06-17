import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { Star, MessageSquare, Reply, Send } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PartnerReviewWithUser } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface PartnerReviewsProps {
  partnerId: number;
}

const StarRating: React.FC<{
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}> = ({ rating, onRatingChange, readonly = false, size = 'md' }) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} cursor-pointer transition-colors ${
            star <= (hoveredRating || rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300 hover:text-yellow-300'
          }`}
          onClick={() => !readonly && onRatingChange?.(star)}
          onMouseEnter={() => !readonly && setHoveredRating(star)}
          onMouseLeave={() => !readonly && setHoveredRating(0)}
        />
      ))}
    </div>
  );
};

const ReviewForm: React.FC<{
  partnerId: number;
  onSuccess: () => void;
}> = ({ partnerId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Avaliação obrigatória",
        description: "Por favor, selecione uma classificação de 1 a 5 estrelas.",
        variant: "destructive",
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Comentário muito curto",
        description: "Por favor, escreva pelo menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiRequest(`/api/partners/${partnerId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({
          rating,
          comment: comment.trim(),
        }),
      });

      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação foi enviada para aprovação.",
      });

      setRating(0);
      setComment('');
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro ao enviar avaliação",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg">Avaliar Parceiro</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Classificação *
            </label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Comentário *
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Compartilhe sua experiência com este parceiro..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {comment.length}/500 caracteres
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={isSubmitting || rating === 0 || comment.trim().length < 10}
            className="w-full"
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ReplyForm: React.FC<{
  reviewId: number;
  onSuccess: () => void;
  onCancel: () => void;
}> = ({ reviewId, onSuccess, onCancel }) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim().length < 5) {
      toast({
        title: "Resposta muito curta",
        description: "Por favor, escreva pelo menos 5 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await apiRequest(`/api/partner-reviews/${reviewId}/replies`, {
        method: 'POST',
        body: JSON.stringify({
          content: content.trim(),
        }),
      });

      toast({
        title: "Resposta enviada!",
        description: "Sua resposta foi publicada.",
      });

      setContent('');
      onSuccess();
    } catch (error) {
      toast({
        title: "Erro ao enviar resposta",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-gray-50 p-4 rounded-lg">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva sua resposta..."
        className="min-h-[80px]"
        maxLength={300}
      />
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">
          {content.length}/300 caracteres
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            size="sm"
            disabled={isSubmitting || content.trim().length < 5}
          >
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting ? 'Enviando...' : 'Responder'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export const PartnerReviews: React.FC<PartnerReviewsProps> = ({ partnerId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery<PartnerReviewWithUser[]>({
    queryKey: ['/api/partners', partnerId, 'reviews'],
    queryFn: async () => {
      const response = await fetch(`/api/partners/${partnerId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch reviews');
      return response.json();
    },
    enabled: !!partnerId
  });

  const handleReviewSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'reviews'] });
    setShowReviewForm(false);
  };

  const handleReplySuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/partners', partnerId, 'reviews'] });
    setReplyingTo(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-500">Carregando avaliações...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Form Toggle */}
      {!showReviewForm ? (
        <div className="text-center">
          <Button 
            onClick={() => setShowReviewForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Star className="h-4 w-4 mr-2" />
            Avaliar Parceiro
          </Button>
        </div>
      ) : (
        <ReviewForm 
          partnerId={partnerId} 
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhuma avaliação ainda</p>
          <p className="text-sm text-gray-400">Seja o primeiro a avaliar este parceiro!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {review.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold">{review.user.name}</p>
                      <div className="flex items-center space-x-2">
                        <StarRating rating={review.rating} readonly size="sm" />
                        <span className="text-sm text-gray-500">
                          {format(new Date(review.createdAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4 whitespace-pre-line">
                  {review.comment}
                </p>
                
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(replyingTo === review.id ? null : review.id)}
                  >
                    <Reply className="h-4 w-4 mr-1" />
                    {replyingTo === review.id ? 'Cancelar' : 'Responder'}
                  </Button>
                </div>
                
                {/* Reply Form */}
                {replyingTo === review.id && (
                  <div className="mt-4">
                    <ReplyForm
                      reviewId={review.id}
                      onSuccess={handleReplySuccess}
                      onCancel={() => setReplyingTo(null)}
                    />
                  </div>
                )}
                
                {/* Replies */}
                {review.replies && review.replies.length > 0 && (
                  <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-200">
                    {review.replies.map((reply) => (
                      <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {reply.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{reply.user.name}</span>
                          <span className="text-xs text-gray-500">
                            {format(new Date(reply.createdAt), "d 'de' MMM", { locale: ptBR })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line">
                          {reply.content}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};