
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePartners } from '@/contexts/PartnersContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PartnerFiles } from '@/components/hub/PartnerFiles';
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
  const { getPartnerById } = usePartners();
  const { toast } = useToast();
  
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const partner = id ? getPartnerById(parseInt(id)) : null;

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
      addReview(partner.id, {
        partnerId: partner.id,
        userId: 'current-user',
        userName: 'Usuário Atual',
        rating,
        comment: comment.trim(),
      });

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

  const approvedReviews = partner.reviews.filter(review => review.isApproved);

  const getContactIcon = (type: string) => {
    switch (type) {
      case 'phone':
      case 'whatsapp':
        return <Phone className="h-4 w-4" />;
      case 'email':
        return <Mail className="h-4 w-4" />;
      case 'website':
        return <Globe className="h-4 w-4" />;
      default:
        return <Phone className="h-4 w-4" />;
    }
  };

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
                  <h1 className="text-4xl font-bold">{partner.name}</h1>
                  {partner.isVerified && (
                    <Badge variant="default" className="bg-green-500 text-white">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary" className="mb-4 text-base px-3 py-1">
                  {partner.category.name}
                </Badge>
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-6 w-6 ${
                        i < Math.floor(partner.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-3 text-lg text-gray-600">
                    {partner.averageRating.toFixed(1)} ({partner.totalReviews} avaliações)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Coluna Principal - 3/4 da largura */}
          <div className="xl:col-span-3 space-y-8">
            {/* Descrição/Detalhes */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Sobre o Parceiro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">{partner.description}</p>
              </CardContent>
            </Card>

            {/* Especialidades */}
            {partner.specialties && Array.isArray(partner.specialties) && partner.specialties.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Especialidades</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {partner.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-lg">{specialty}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Arquivos e Documentos */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center">
                  <FileText className="h-6 w-6 mr-2" />
                  Arquivos e Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PartnerFiles partnerId={partner.id} />
              </CardContent>
            </Card>

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
                {approvedReviews.length > 0 ? (
                  <div className="space-y-6">
                    {approvedReviews.map((review) => (
                      <div key={review.id} className="border rounded-lg p-6 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <span className="font-semibold text-lg">{review.userName}</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-700 text-base leading-relaxed">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-3">
                          {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-12 text-lg">
                    Nenhuma avaliação disponível. Seja o primeiro a avaliar!
                  </p>
                )}
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
                {/* Endereço */}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-1 text-gray-600" />
                  <div>
                    <p className="text-base font-medium">
                      {partner.address.street}
                    </p>
                    <p className="text-base">
                      {partner.address.city} - {partner.address.state}
                    </p>
                    <p className="text-base">
                      CEP: {partner.address.zipCode}
                    </p>
                  </div>
                </div>

                {/* Contatos */}
                {partner.contacts.map((contact) => (
                  <div key={contact.id} className="flex items-center gap-3">
                    {getContactIcon(contact.type)}
                    <div>
                      <p className="text-base font-medium">{contact.label}</p>
                      <p className="text-base text-gray-600">{contact.value}</p>
                    </div>
                  </div>
                ))}

                {/* Redes Sociais */}
                {partner.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-gray-600" />
                    <a 
                      href={partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-base text-blue-600 hover:underline"
                    >
                      Website
                    </a>
                  </div>
                )}

                {partner.instagram && (
                  <div className="flex items-center gap-3">
                    <Instagram className="h-5 w-5 text-gray-600" />
                    <span className="text-base">{partner.instagram}</span>
                  </div>
                )}

                {partner.linkedin && (
                  <div className="flex items-center gap-3">
                    <Linkedin className="h-5 w-5 text-gray-600" />
                    <span className="text-base">{partner.linkedin}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Materiais - Apenas visualização */}
            {partner.materials.length > 0 && (
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl">Materiais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {partner.materials.map((material) => (
                      <div key={material.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                        <FileText className="h-5 w-5 text-blue-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{material.name}</p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(material.fileSize)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(material.fileUrl, '_blank')}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDetail;
