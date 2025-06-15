
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Partner, Review, PartnerContact } from '@/types/partner';

interface PartnersContextType {
  partners: Partner[];
  loading: boolean;
  error: string | null;
  addPartner: (partner: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews' | 'reviews'>) => void;
  updatePartner: (id: string, partner: Partial<Partner>) => void;
  deletePartner: (id: string) => void;
  addReview: (partnerId: string, review: Omit<Review, 'id' | 'createdAt' | 'isApproved'>) => void;
  approveReview: (partnerId: string, reviewId: string) => void;
  getPartnerById: (id: string) => Partner | undefined;
  getPartnersByCategory: (categoryId: string) => Partner[];
  searchPartners: (query: string) => Partner[];
}

const PartnersContext = createContext<PartnersContextType | undefined>(undefined);

export function PartnersProvider({ children }: { children: React.ReactNode }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data para demonstração
  useEffect(() => {
    const mockPartners: Partner[] = [
      {
        id: '1',
        name: 'Contabilidade Silva & Associados',
        email: 'contato@silvacontabil.com.br',
        phone: '(11) 99999-9999',
        category: { id: '1', name: 'Contadores', icon: 'Calculator', description: 'Serviços de contabilidade e consultoria fiscal' },
        specialties: 'Simples Nacional, Lucro Presumido, Importação, E-commerce',
        description: 'Escritório de contabilidade especializado em e-commerce',
        about: 'Com mais de 15 anos de experiência no mercado, oferecemos soluções completas em contabilidade para empresas de todos os portes, com foco especial em negócios digitais e e-commerce.',
        services: 'Abertura de empresa, Contabilidade mensal, Consultoria fiscal, Planejamento tributário, Declaração de Imposto de Renda',
        contacts: [
          { id: '1', type: 'phone', value: '(11) 99999-9999', label: 'Telefone principal' },
          { id: '2', type: 'email', value: 'contato@silvacontabil.com.br', label: 'E-mail comercial' },
          { id: '3', type: 'whatsapp', value: '(11) 98888-8888', label: 'WhatsApp' }
        ],
        address: {
          street: 'Rua das Flores, 123',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567'
        },
        website: 'https://silvacontabil.com.br',
        instagram: '@silvacontabil',
        linkedin: 'silva-contabilidade',
        certifications: ['CRC-SP 123456', 'Certificação Digital'],
        isVerified: true,
        averageRating: 4.8,
        totalReviews: 24,
        reviews: [
          {
            id: '1',
            partnerId: '1',
            userId: 'user1',
            userName: 'João Silva',
            rating: 5,
            comment: 'Excelente atendimento e profissionalismo! Recomendo muito.',
            createdAt: '2024-01-15',
            isApproved: true
          }
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        name: 'Advocacia Empresarial Machado',
        email: 'contato@machadoadvocacia.com.br',
        phone: '(11) 88888-8888',
        category: { id: '2', name: 'Advogados', icon: 'Scales', description: 'Consultoria jurídica empresarial' },
        specialties: 'Direito Empresarial, Contratos, Propriedade Intelectual, Direito Digital',
        description: 'Escritório especializado em direito empresarial e e-commerce',
        about: 'Atuamos há 10 anos no mercado jurídico, com foco em empresas digitais e e-commerce. Nossa equipe é especializada em questões jurídicas do mundo digital.',
        services: 'Revisão de contratos, Registro de marca, Consultoria jurídica, Defesa em processos',
        contacts: [
          { id: '1', type: 'phone', value: '(11) 88888-8888', label: 'Telefone comercial' },
          { id: '2', type: 'email', value: 'contato@machadoadvocacia.com.br', label: 'E-mail principal' }
        ],
        address: {
          street: 'Av. Paulista, 456',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-890'
        },
        website: 'https://machadoadvocacia.com.br',
        certifications: ['OAB-SP 123456'],
        isVerified: true,
        averageRating: 4.6,
        totalReviews: 18,
        reviews: [],
        createdAt: '2024-01-05',
        updatedAt: '2024-01-10'
      }
    ];

    setTimeout(() => {
      setPartners(mockPartners);
      setLoading(false);
    }, 1000);
  }, []);

  const addPartner = (partnerData: Omit<Partner, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews' | 'reviews'>) => {
    const newPartner: Partner = {
      ...partnerData,
      id: Date.now().toString(),
      averageRating: 0,
      totalReviews: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setPartners(prev => [...prev, newPartner]);
  };

  const updatePartner = (id: string, updates: Partial<Partner>) => {
    setPartners(prev => prev.map(partner => 
      partner.id === id 
        ? { ...partner, ...updates, updatedAt: new Date().toISOString() }
        : partner
    ));
  };

  const deletePartner = (id: string) => {
    setPartners(prev => prev.filter(partner => partner.id !== id));
  };

  const addReview = (partnerId: string, reviewData: Omit<Review, 'id' | 'createdAt' | 'isApproved'>) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isApproved: true, // Aprova automaticamente para demonstração
    };

    setPartners(prev => prev.map(partner => {
      if (partner.id === partnerId) {
        const updatedReviews = [...partner.reviews, newReview];
        const approvedReviews = updatedReviews.filter(r => r.isApproved);
        const averageRating = approvedReviews.length > 0 
          ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length 
          : 0;
        
        return {
          ...partner,
          reviews: updatedReviews,
          averageRating,
          totalReviews: approvedReviews.length,
          updatedAt: new Date().toISOString()
        };
      }
      return partner;
    }));
  };

  const approveReview = (partnerId: string, reviewId: string) => {
    setPartners(prev => prev.map(partner => {
      if (partner.id === partnerId) {
        const updatedReviews = partner.reviews.map(review => 
          review.id === reviewId ? { ...review, isApproved: true } : review
        );
        const approvedReviews = updatedReviews.filter(r => r.isApproved);
        const averageRating = approvedReviews.length > 0 
          ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length 
          : 0;
        
        return {
          ...partner,
          reviews: updatedReviews,
          averageRating,
          totalReviews: approvedReviews.length,
          updatedAt: new Date().toISOString()
        };
      }
      return partner;
    }));
  };

  const getPartnerById = (id: string) => {
    return partners.find(partner => partner.id === id);
  };

  const getPartnersByCategory = (categoryId: string) => {
    return partners.filter(partner => partner.category.id === categoryId);
  };

  const searchPartners = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return partners.filter(partner => 
      partner.name.toLowerCase().includes(lowercaseQuery) ||
      partner.description.toLowerCase().includes(lowercaseQuery) ||
      partner.specialties.toLowerCase().includes(lowercaseQuery) ||
      partner.category.name.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <PartnersContext.Provider value={{
      partners,
      loading,
      error,
      addPartner,
      updatePartner,
      deletePartner,
      addReview,
      approveReview,
      getPartnerById,
      getPartnersByCategory,
      searchPartners,
    }}>
      {children}
    </PartnersContext.Provider>
  );
}

export function usePartners() {
  const context = useContext(PartnersContext);
  if (context === undefined) {
    throw new Error('usePartners must be used within a PartnersProvider');
  }
  return context;
}
