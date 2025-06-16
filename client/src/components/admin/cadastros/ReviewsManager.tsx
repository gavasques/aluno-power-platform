
import React from 'react';
import { usePartners } from '@/contexts/PartnersContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Star,
  CheckCircle,
  XCircle,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReviewsManagerProps {
  partnerId: string;
  onClose: () => void;
}

const ReviewsManager: React.FC<ReviewsManagerProps> = ({ partnerId, onClose }) => {
  const { getPartnerById, approveReview } = usePartners();
  const { toast } = useToast();
  const partner = getPartnerById(partnerId);

  if (!partner) {
    return null;
  }

  const handleApprove = (reviewId: string) => {
    approveReview(partnerId, reviewId);
    toast({
      title: 'Avaliação aprovada',
      description: 'A avaliação foi aprovada com sucesso.',
    });
  };

  const pendingReviews = partner.reviews.filter(review => !review.isApproved);
  const approvedReviews = partner.reviews.filter(review => review.isApproved);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            Gerenciar Avaliações - {partner.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-slate-100">{partner.totalReviews}</div>
              <p className="text-slate-400 text-sm">Avaliações Aprovadas</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{pendingReviews.length}</div>
              <p className="text-slate-400 text-sm">Aguardando Aprovação</p>
            </div>
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{partner.averageRating.toFixed(1)}</div>
              <p className="text-slate-400 text-sm">Média de Avaliação</p>
            </div>
          </div>

          {/* Pending Reviews */}
          {pendingReviews.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-4">
                Avaliações Pendentes ({pendingReviews.length})
              </h3>
              <div className="border border-slate-600 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-600">
                      <TableHead className="text-slate-300">Usuário</TableHead>
                      <TableHead className="text-slate-300">Avaliação</TableHead>
                      <TableHead className="text-slate-300">Comentário</TableHead>
                      <TableHead className="text-slate-300">Data</TableHead>
                      <TableHead className="text-slate-300">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReviews.map((review) => (
                      <TableRow key={review.id} className="border-slate-600">
                        <TableCell className="text-slate-100">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-slate-400" />
                            {review.userName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                            <span className="ml-1 text-slate-300">({review.rating})</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300 max-w-xs">
                          <p className="line-clamp-2">{review.comment}</p>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(review.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Rejeitar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Approved Reviews */}
          <div>
            <h3 className="text-lg font-semibold text-slate-100 mb-4">
              Avaliações Aprovadas ({approvedReviews.length})
            </h3>
            {approvedReviews.length > 0 ? (
              <div className="space-y-4 max-h-60 overflow-y-auto">
                {approvedReviews.map((review) => (
                  <div key={review.id} className="bg-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="font-semibold text-slate-100">{review.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <Badge className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Aprovada
                        </Badge>
                      </div>
                    </div>
                    <p className="text-slate-300">{review.comment}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-center py-4">
                Nenhuma avaliação aprovada ainda.
              </p>
            )}
          </div>

          {pendingReviews.length === 0 && approvedReviews.length === 0 && (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Nenhuma avaliação encontrada
              </h3>
              <p className="text-slate-400">
                Este parceiro ainda não recebeu nenhuma avaliação.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReviewsManager;
