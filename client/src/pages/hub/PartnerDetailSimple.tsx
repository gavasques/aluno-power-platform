import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePartners } from '@/contexts/PartnersContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PartnerFiles } from '@/components/hub/PartnerFiles';
import { PartnerReviews } from '@/components/hub/PartnerReviews';
import {
  Star,
  Shield,
  Phone,
  Mail,
  Globe,
  Instagram,
  Linkedin,
  ArrowLeft,
  FileText,
  MessageSquare
} from 'lucide-react';
import type { PartnerType } from '@shared/schema';

const PartnerDetailSimple = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPartnerById } = usePartners();

  const partner = id ? getPartnerById(parseInt(id)) : null;

  // Get partner type info
  const { data: partnerTypes = [] } = useQuery<PartnerType[]>({
    queryKey: ['/api/partner-types'],
    queryFn: async () => {
      const response = await fetch('/api/partner-types');
      if (!response.ok) throw new Error('Failed to fetch partner types');
      return response.json();
    }
  });

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

  const partnerType = partnerTypes.find(type => type.id === partner.partnerTypeId);

  return (
    <div className="w-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/hub/parceiros')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar aos Parceiros
        </Button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {partner.logo && (
              <div className="w-24 h-24 bg-white rounded-lg p-2 flex items-center justify-center">
                <img 
                  src={partner.logo} 
                  alt={partner.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2">{partner.name}</h1>
              {partner.isVerified && (
                <div className="flex items-center mb-2">
                  <Shield className="h-5 w-5 mr-2 text-green-300" />
                  <span className="text-green-300">Parceiro Verificado</span>
                </div>
              )}
              {partnerType && (
                <Badge variant="secondary" className="mb-4 text-base px-3 py-1">
                  {partnerType.name}
                </Badge>
              )}
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                const reviewsSection = document.getElementById('reviews-section');
                reviewsSection?.scrollIntoView({ behavior: 'smooth' });
              }}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-6 w-6 ${
                      i < Math.floor(parseFloat(partner.averageRating || '0'))
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-3 text-lg">
                  {parseFloat(partner.averageRating || '0').toFixed(1)} ({partner.totalReviews} avaliações)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-8">
          {/* Description */}
          {partner.description && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-2xl">Sobre o Parceiro</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-line">
                  {partner.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Specialties */}
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

          {/* Contact Information */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {partner.phone && (
                <div className="flex items-center">
                  <Phone className="h-5 w-5 mr-3 text-gray-500" />
                  <span className="text-gray-700">{partner.phone}</span>
                </div>
              )}
              
              {partner.email && (
                <div className="flex items-center">
                  <Mail className="h-5 w-5 mr-3 text-gray-500" />
                  <span className="text-gray-700">{partner.email}</span>
                </div>
              )}
              
              {partner.website && (
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-3 text-gray-500" />
                  <a 
                    href={partner.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}
              
              {partner.instagram && (
                <div className="flex items-center">
                  <Instagram className="h-5 w-5 mr-3 text-gray-500" />
                  <a 
                    href={`https://instagram.com/${partner.instagram.replace('@', '')}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {partner.instagram}
                  </a>
                </div>
              )}
              
              {partner.linkedin && (
                <div className="flex items-center">
                  <Linkedin className="h-5 w-5 mr-3 text-gray-500" />
                  <a 
                    href={partner.linkedin}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    LinkedIn
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Files and Documents */}
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

          {/* Reviews and Ratings */}
          <Card className="shadow-sm" id="reviews-section">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <MessageSquare className="h-6 w-6 mr-2" />
                Avaliações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PartnerReviews partnerId={partner.id} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Additional Information */}
        <div className="space-y-6">
          {/* Can add additional sidebar content here if needed */}
        </div>
      </div>
    </div>
  );
};

export default PartnerDetailSimple;