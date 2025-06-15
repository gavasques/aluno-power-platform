
import React, { useState } from 'react';
import { usePartners } from '@/contexts/PartnersContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Star,
  Shield,
  MapPin,
  Phone,
  Mail,
  Globe,
  Instagram,
  Linkedin,
  Calendar,
  DollarSign,
} from 'lucide-react';
import ReviewModal from './ReviewModal';

interface PartnerDetailModalProps {
  partnerId: string;
  onClose: () => void;
}

const PartnerDetailModal: React.FC<PartnerDetailModalProps> = ({ partnerId, onClose }) => {
  const { getPartnerById } = usePartners();
  const [showReviewModal, setShowReviewModal] = useState(false);
  const partner = getPartnerById(partnerId);

  if (!partner) {
    return null;
  }

  const approvedReviews = partner.reviews.filter(review => review.isApproved);

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <DialogTitle className="text-2xl">{partner.name}</DialogTitle>
                  {partner.isVerified && (
                    <Badge variant="default" className="bg-green-500">
                      <Shield className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                </div>
                <Badge variant="secondary">{partner.category.name}</Badge>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(partner.averageRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-500">
                  {partner.averageRating.toFixed(1)} ({partner.totalReviews} avaliações)
                </p>
              </div>
            </div>
          </DialogHeader>

          <Tabs defaultValue="about" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="about">Sobre</TabsTrigger>
              <TabsTrigger value="services">Serviços</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="contact">Contato</TabsTrigger>
              <TabsTrigger value="reviews">Avaliações</TabsTrigger>
            </TabsList>

            <TabsContent value="about" className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Sobre</h3>
                <p className="text-gray-700">{partner.about}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Especialidades</h3>
                <div className="flex flex-wrap gap-2">
                  {partner.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Certificações</h3>
                <div className="space-y-1">
                  {partner.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{cert}</span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <h3 className="text-lg font-semibold">Serviços Oferecidos</h3>
              <div className="grid gap-4">
                {partner.services.map((service) => (
                  <div key={service.id} className="border rounded-lg p-4">
                    <h4 className="font-semibold">{service.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      {service.price && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{service.price}</span>
                        </div>
                      )}
                      {service.duration && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{service.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-4">
              <h3 className="text-lg font-semibold">Portfolio</h3>
              {partner.portfolio.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {partner.portfolio.map((item) => (
                    <div key={item.id} className="border rounded-lg overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        <Badge variant="outline" className="mt-2">
                          {item.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhum item no portfolio disponível.
                </p>
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <h3 className="text-lg font-semibold">Informações de Contato</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {partner.address.street}, {partner.address.city} - {partner.address.state}, {partner.address.zipCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>{partner.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{partner.email}</span>
                </div>
                {partner.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {partner.website}
                    </a>
                  </div>
                )}
                {partner.instagram && (
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4" />
                    <span>{partner.instagram}</span>
                  </div>
                )}
                {partner.linkedin && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4" />
                    <span>{partner.linkedin}</span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Avaliações</h3>
                <Button onClick={() => setShowReviewModal(true)}>
                  Deixar Avaliação
                </Button>
              </div>
              
              {approvedReviews.length > 0 ? (
                <div className="space-y-4">
                  {approvedReviews.map((review) => (
                    <div key={review.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{review.userName}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700">{review.comment}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma avaliação disponível. Seja o primeiro a avaliar!
                </p>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {showReviewModal && (
        <ReviewModal
          partnerId={partnerId}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </>
  );
};

export default PartnerDetailModal;
