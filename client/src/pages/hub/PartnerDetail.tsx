
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  Star,
  Shield,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Linkedin,
  ArrowLeft,
  MessageSquare,
  FileText,
  Download
} from 'lucide-react';

const PartnerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: partner, isLoading } = useQuery({
    queryKey: ['/api/partners', id],
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="w-full p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando parceiro...</p>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="w-full p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Parceiro não encontrado</h1>
          <Button onClick={() => navigate('/hub/parceiros')}>
            Voltar aos Parceiros
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
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
      // TODO: Implement review submission API
      toast({
        title: "Avaliação enviada!",
        description: "Sua avaliação foi enviada com sucesso.",
      });

      setShowReviewForm(false);
      setRating(0);
      setComment('');
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

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const partnerData = partner as any;

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/hub/parceiros')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Parceiros
          </Button>
          
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-4xl font-bold">{partnerData.name}</h1>
                  {partnerData.isVerified && (
                    <Badge variant="default" className="bg-green-500 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="mb-4 text-base px-3 py-1">
                  {partnerData.specialties || 'Serviços gerais'}
                </Badge>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(parseFloat(partnerData.averageRating || '0'))
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-3 text-lg text-gray-600">
                    {partnerData.averageRating ? parseFloat(partnerData.averageRating).toFixed(1) : '0.0'} ({partnerData.totalReviews || 0} avaliações)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Coluna Principal - 3/4 da largura */}
          <div className="xl:col-span-3 space-y-8">
            {/* Sobre */}
            {partnerData.about && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Sobre</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg leading-relaxed">{partnerData.about}</p>
                </CardContent>
              </Card>
            )}

            {/* Descrição */}
            {partnerData.description && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Descrição</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg leading-relaxed">{partnerData.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Especialidades */}
            {partnerData.specialties && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Especialidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg leading-relaxed">{partnerData.specialties}</p>
                </CardContent>
              </Card>
            )}

            {/* Serviços */}
            {partnerData.services && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Serviços</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-lg leading-relaxed">{partnerData.services}</p>
                </CardContent>
              </Card>
            )}

            {/* Avaliações */}
            <Card className="shadow-sm">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">Avaliações</CardTitle>
                  <Button 
                    onClick={() => setShowReviewForm(true)}
                    disabled={showReviewForm}
                    size="lg"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Deixar Avaliação
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Formulário de Avaliação */}
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="space-y-6 p-6 border rounded-lg bg-gray-50">
                    <div>
                      <label className="block text-base font-medium mb-3">
                        Sua avaliação
                      </label>
                      <div className="flex gap-2">
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
                              className={`h-10 w-10 transition-colors ${
                                value <= (hoveredRating || rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300 hover:text-yellow-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-base font-medium mb-3">
                        Comentário
                      </label>
                      <Textarea
                        placeholder="Conte sua experiência com este parceiro..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        required
                        minLength={10}
                        className="text-base"
                      />
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowReviewForm(false)}
                        size="lg"
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting} size="lg">
                        {isSubmitting ? 'Enviando...' : 'Enviar Avaliação'}
                      </Button>
                    </div>
                  </form>
                )}

                {/* Lista de Avaliações */}
                <p className="text-gray-500 text-center py-12 text-lg">
                  Nenhuma avaliação disponível. Seja o primeiro a avaliar!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - 1/4 da largura */}
          <div className="xl:col-span-1 space-y-8">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Contato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                {partnerData.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-base font-medium">Email</p>
                      <p className="text-base text-gray-600">{partnerData.email}</p>
                    </div>
                  </div>
                )}

                {/* Telefone */}
                {partnerData.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-base font-medium">Telefone</p>
                      <p className="text-base text-gray-600">{partnerData.phone}</p>
                    </div>
                  </div>
                )}

                {/* Website */}
                {partnerData.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-base font-medium">Website</p>
                      <a 
                        href={partnerData.website} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-base text-blue-600 hover:underline"
                      >
                        {partnerData.website}
                      </a>
                    </div>
                  </div>
                )}

                {/* Instagram */}
                {partnerData.instagram && (
                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-base font-medium">Instagram</p>
                      <span className="text-base text-gray-600">{partnerData.instagram}</span>
                    </div>
                  </div>
                )}

                {/* LinkedIn */}
                {partnerData.linkedin && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="text-base font-medium">LinkedIn</p>
                      <span className="text-base text-gray-600">{partnerData.linkedin}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetail;
