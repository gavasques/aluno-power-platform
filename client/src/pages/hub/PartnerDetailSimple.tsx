import React from 'react';
import { useRoute, useLocation } from 'wouter';
import { usePartners } from '@/contexts/PartnersContext';
import { useAuth } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PartnerFiles } from '@/components/hub/PartnerFiles';
import { PartnerReviews } from '@/components/hub/PartnerReviews';
import PartnerRatingDisplay from '@/components/hub/PartnerRatingDisplay';
import { YouTubePlayer } from '@/components/ui/youtube-player';
import {
  Star,
  Shield,
  Phone,
  Mail,
  Globe,
  Instagram,
  Linkedin,
  Youtube,
  ArrowLeft,
  FileText,
  MessageSquare,
  User
} from 'lucide-react';
import type { PartnerType, PartnerContact } from '@shared/schema';

const PartnerDetailSimple = () => {
  const [, params] = useRoute("/hub/parceiros/:id");
  const [, setLocation] = useLocation();
  const id = params?.id;
  const { getPartnerById } = usePartners();
  const { user } = useAuth();

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

  // Get partner contacts
  const { data: partnerContacts = [] } = useQuery<PartnerContact[]>({
    queryKey: ['/api/partners', id, 'contacts'],
    queryFn: async () => {
      const response = await fetch(`/api/partners/${id}/contacts`);
      if (!response.ok) throw new Error('Failed to fetch partner contacts');
      return response.json();
    },
    enabled: !!id
  });

  if (!partner) {
    return (
      <div className="w-full p-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Parceiro não encontrado</h2>
          <p className="mt-2 text-gray-600">O parceiro que você está procurando não existe.</p>
          <Button
            onClick={() => setLocation('/hub/parceiros')}
            className="mt-4"
          >
            Voltar aos Parceiros
          </Button>
        </div>
      </div>
    );
  }

  const partnerType = partnerTypes.find(type => type.id === partner.partnerTypeId);

  // Função para gerar link do WhatsApp
  const generateWhatsAppLink = (phoneNumber: string) => {
    if (!phoneNumber || !user?.name) return '#';
    
    // Remove todos os caracteres não numéricos e adiciona + se não tiver
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;
    
    // Cria a mensagem personalizada
    const message = `Olá, sou ${user.name}, e vim através do Guilherme Vasques. Tudo bem?`;
    const encodedMessage = encodeURIComponent(message);
    
    return `https://wa.me/${formattedPhone}/?text=${encodedMessage}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/hub/parceiros')}
            className="mb-6 hover:bg-gray-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar aos Parceiros
          </Button>
          
          {/* Partner Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <div className="flex items-start gap-6">
              {/* Logo Display */}
              <div className="bg-white rounded-xl p-4 flex-shrink-0 w-20 h-20 flex items-center justify-center">
                {partner.logo ? (
                  <img 
                    src={partner.logo} 
                    alt={partner.name}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="text-2xl font-bold text-blue-600">
                    {partner.name.split(' ').map(word => word[0]).join('').slice(0, 2)}
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h1 className="text-3xl font-bold">{partner.name}</h1>
                  {partner.isVerified && (
                    <div className="flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                      <Shield className="h-4 w-4" />
                      Verificado
                    </div>
                  )}
                </div>
                
                {partnerType && (
                  <div className="mb-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {partnerType.name}
                    </Badge>
                  </div>
                )}
                
                {/* Rating Display - Using real data from PartnerReviews */}
                <PartnerRatingDisplay partnerId={partner.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            {partner.description && (
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">Sobre o Parceiro</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 leading-relaxed">{partner.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Specialties */}
            {partner.specialties && partner.specialties.length > 0 && (
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-semibold text-gray-900">Especialidades</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 gap-3">
                    {partner.specialties.map((specialty, index) => (
                      <div key={index} className="flex items-center bg-gray-50 rounded-lg p-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3 flex-shrink-0"></div>
                        <span className="text-gray-700 font-medium">{specialty}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* YouTube Videos Section */}
            {(partner.presentationVideoUrl || partner.guilhermeVideoUrl) && (
              <div className="space-y-6">
                {partner.presentationVideoUrl && (
                  <YouTubePlayer 
                    url={partner.presentationVideoUrl}
                    title="Vídeo de Apresentação"
                    className="shadow-sm border-0 bg-white"
                  />
                )}
                
                {partner.guilhermeVideoUrl && (
                  <YouTubePlayer 
                    url={partner.guilhermeVideoUrl}
                    title="Vídeo Guilherme"
                    className="shadow-sm border-0 bg-white"
                  />
                )}
              </div>
            )}

            {/* Files Section */}
            <Card className="shadow-sm border-0 bg-white" id="files-section">
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl font-semibold text-gray-900">Arquivos</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <PartnerFiles partnerId={partner.id} />
              </CardContent>
            </Card>

            {/* Reviews Section */}
            <Card className="shadow-sm border-0 bg-white" id="reviews-section">
              <CardHeader className="flex flex-row items-center gap-2 pb-4">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl font-semibold text-gray-900">Avaliações</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <PartnerReviews partnerId={partner.id} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Information */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-gray-900">Informações de Contato</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-6">
                {/* Partner Contacts from Admin */}
                {partnerContacts.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contatos da Empresa</h3>
                    <div className="space-y-4">
                      {partnerContacts.map((contact) => (
                        <div key={contact.id} className="bg-gray-50 rounded-xl p-4">
                          <div className="flex items-center mb-3">
                            <User className="h-5 w-5 mr-3 text-gray-500" />
                            <span className="font-medium text-gray-900">{contact.name}</span>
                            <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                              {contact.area}
                            </span>
                          </div>
                          <div className="space-y-2 ml-8">
                            {contact.phone && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                                  <span className="text-gray-700">{contact.phone}</span>
                                </div>
                                <a
                                  href={generateWhatsAppLink(contact.phone)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors duration-200"
                                >
                                  WhatsApp
                                </a>
                              </div>
                            )}
                            {contact.whatsapp && (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <Phone className="h-4 w-4 mr-2 text-green-500" />
                                  <span className="text-gray-700">{contact.whatsapp}</span>
                                  <span className="ml-2 text-xs text-green-600 font-medium">(WhatsApp)</span>
                                </div>
                                <a
                                  href={generateWhatsAppLink(contact.whatsapp)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-2 px-2 py-1 bg-green-500 hover:bg-green-600 text-white text-xs rounded transition-colors duration-200"
                                >
                                  Abrir
                                </a>
                              </div>
                            )}
                            {contact.email && (
                              <div className="flex items-center">
                                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="text-gray-700">{contact.email}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Partner General Contact Info */}
                {(partner.phone || partner.email || partner.website || partner.instagram || partner.linkedin || partner.youtubeChannel) && (
                  <div>
                    {partnerContacts.length > 0 && (
                      <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Gerais</h3>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {partner.phone && (
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center">
                            <Phone className="h-5 w-5 mr-3 text-gray-500" />
                            <span className="text-gray-700">{partner.phone}</span>
                          </div>
                          <a
                            href={generateWhatsAppLink(partner.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-sm rounded-md transition-colors duration-200"
                          >
                            WhatsApp
                          </a>
                        </div>
                      )}
                      
                      {partner.email && (
                        <div className="flex items-center bg-gray-50 rounded-lg p-3">
                          <Mail className="h-5 w-5 mr-3 text-gray-500" />
                          <span className="text-gray-700">{partner.email}</span>
                        </div>
                      )}
                      
                      {partner.website && (
                        <div className="flex items-center bg-gray-50 rounded-lg p-3">
                          <Globe className="h-5 w-5 mr-3 text-gray-500" />
                          <a 
                            href={partner.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            Website
                          </a>
                        </div>
                      )}
                      
                      {partner.instagram && (
                        <div className="flex items-center bg-gray-50 rounded-lg p-3">
                          <Instagram className="h-5 w-5 mr-3 text-gray-500" />
                          <a 
                            href={`https://instagram.com/${partner.instagram.replace('@', '')}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {partner.instagram}
                          </a>
                        </div>
                      )}
                      
                      {partner.linkedin && (
                        <div className="flex items-center bg-gray-50 rounded-lg p-3">
                          <Linkedin className="h-5 w-5 mr-3 text-gray-500" />
                          <a 
                            href={partner.linkedin}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium"
                          >
                            LinkedIn
                          </a>
                        </div>
                      )}
                      
                      {partner.youtubeChannel && (
                        <div className="flex items-center bg-gray-50 rounded-lg p-3">
                          <Youtube className="h-5 w-5 mr-3 text-red-500" />
                          <a 
                            href={partner.youtubeChannel}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-red-600 hover:underline font-medium"
                          >
                            Canal do YouTube
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {partnerContacts.length === 0 && !partner.phone && !partner.email && !partner.website && !partner.instagram && !partner.linkedin && !partner.youtubeChannel && (
                  <div className="text-center py-12">
                    <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma informação de contato disponível</p>
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

export default PartnerDetailSimple;