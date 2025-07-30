import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Reply, Trash2, User } from 'lucide-react';
import { useAuth } from '@/contexts/UserContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import type { ToolReviewWithUser, InsertToolReview, InsertToolReviewReply } from '@shared/schema';

interface ToolReviewsProps {
  toolId: number;
}

export const ToolReviews: React.FC<ToolReviewsProps> = ({ toolId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });
  const [replyData, setReplyData] = useState<{ [key: string]: string }>({});
  const [showReplyDialog, setShowReplyDialog] = useState<number | null>(null);

  // Fetch reviews
  const { data: reviews = [], isLoading } = useQuery<ToolReviewWithUser[]>({
    queryKey: ['/api/tools', toolId, 'reviews'],
    queryFn: () => apiRequest(`/api/tools/${toolId}/reviews`),
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: (review: InsertToolReview) =>
      apiRequest(`/api/tools/${toolId}/reviews`, {
        method: 'POST',
        body: JSON.stringify(review),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'reviews'] });
      setReviewData({ rating: 5, comment: '' });
      toast({
        title: 'Sucesso!',
        description: 'Sua avaliação foi enviada.',
      });
    },
  });

  // Add reply mutation
  const addReplyMutation = useMutation({
    mutationFn: ({ reviewId, reply }: { reviewId: number; reply: InsertToolReviewReply }) =>
      apiRequest(`/api/tools/reviews/${reviewId}/replies`, {
        method: 'POST',
        body: JSON.stringify(reply),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'reviews'] });
      setReplyData({});
      setShowReplyDialog(null);
      toast({
        title: 'Sucesso!',
        description: 'Sua resposta foi enviada.',
      });
    },
  });

  // Delete review mutation
  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: number) =>
      apiRequest(`/api/tools/reviews/${reviewId}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools', toolId, 'reviews'] });
      toast({
        title: 'Sucesso!',
        description: 'Avaliação removida.',
      });
    },
  });

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 ${
          i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={() => interactive && onRatingChange && onRatingChange(i + 1)}
      />
    ));
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reviewData.comment.trim()) return;

    const review: InsertToolReview = {
      toolId,
      userId: user.id,
      rating: reviewData.rating,
      comment: reviewData.comment.trim(),
      photos: [],
    };

    addReviewMutation.mutate(review);
  };

  const handleSubmitReply = (reviewId: number) => {
    if (!user || !replyData[reviewId]?.trim()) return;

    const reply: InsertToolReviewReply = {
      reviewId,
      userId: user.id,
      comment: replyData[reviewId].trim(),
    };

    addReplyMutation.mutate({ reviewId, reply });
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Review Form */}
      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sua Nota</label>
                <div className="flex gap-1">
                  {renderStars(reviewData.rating, true, (rating) =>
                    setReviewData(prev => ({ ...prev, rating }))
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Comentário</label>
                <Textarea
                  value={reviewData.comment}
                  onChange={(e) => setReviewData(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Compartilhe sua experiência com esta ferramenta..."
                  rows={4}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                disabled={addReviewMutation.isPending || !reviewData.comment.trim()}
              >
                {addReviewMutation.isPending ? 'Enviando...' : 'Enviar Avaliação'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">Nenhuma avaliação ainda. Seja o primeiro a avaliar!</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{review.user.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">{renderStars(review.rating)}</div>
                          <span className="text-sm text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      {user && user.id === review.userId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteReviewMutation.mutate(review.id)}
                          disabled={deleteReviewMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    
                    {/* Replies */}
                    {review.replies && review.replies.length > 0 && (
                      <div className="border-l-2 border-gray-200 pl-4 ml-4 space-y-3">
                        {review.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-500" />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{reply.user.name}</span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(reply.createdAt)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{reply.comment}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Reply Button and Form */}
                    {user && (
                      <div className="mt-4 flex items-center gap-2">
                        {showReplyDialog === review.id ? (
                          <div className="flex-1 flex gap-2">
                            <Textarea
                              value={replyData[review.id] || ''}
                              onChange={(e) => setReplyData(prev => ({ 
                                ...prev, 
                                [review.id]: e.target.value 
                              }))}
                              placeholder="Escreva sua resposta..."
                              rows={2}
                              className="flex-1"
                            />
                            <div className="flex flex-col gap-1">
                              <Button
                                size="sm"
                                onClick={() => handleSubmitReply(review.id)}
                                disabled={addReplyMutation.isPending || !replyData[review.id]?.trim()}
                              >
                                Enviar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setShowReplyDialog(null);
                                  setReplyData(prev => ({ ...prev, [review.id]: '' }));
                                }}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowReplyDialog(review.id)}
                            className="flex items-center gap-2"
                          >
                            <Reply className="h-4 w-4" />
                            Responder
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};