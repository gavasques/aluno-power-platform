
import React, { useState } from 'react';
import { usePartners } from '@/contexts/PartnersContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewModalProps {
  partnerId: string;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ partnerId, onClose }) => {
  const { addReview, getPartnerById } = usePartners();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const partner = getPartnerById(partnerId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma avaliação.",
        variant: "destructive",
      });
      return;
    }

    if (comment.trim().length < 10) {
      toast({
        title: "Erro",
        description: "O comentário deve ter pelo menos 10 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      addReview(partnerId, {
        partnerId,
        userId: 'current-user', // Em um app real, isso viria do contexto de autenticação
        userName: 'Usuário Atual', // Em um app real, isso viria do contexto de autenticação
        rating,
        comment: comment.trim(),
      });

      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação foi enviada e está aguardando aprovação.",
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar sua avaliação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!partner) {
    return null;
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Avaliar {partner.name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Sua avaliação
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(value)}
                >
                  <Star
                    className={`h-8 w-8 transition-colors ${
                      value <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 hover:text-yellow-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {rating === 1 && "Muito insatisfeito"}
                {rating === 2 && "Insatisfeito"}
                {rating === 3 && "Neutro"}
                {rating === 4 && "Satisfeito"}
                {rating === 5 && "Muito satisfeito"}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Comentário
            </label>
            <Textarea
              placeholder="Conte sua experiência com este parceiro..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              required
              minLength={10}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo de 10 caracteres
            </p>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewModal;
