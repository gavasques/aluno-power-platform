import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { PartnerList } from '@/components/partner/ui/PartnerList';
import { usePartners } from '@/lib/hooks/partner/usePartner';
import { useQuery } from '@tanstack/react-query';
import type { PartnerType } from '@shared/schema';

interface PartnerManagementProps {
  variant?: 'user' | 'admin';
}

export const PartnerManagementRefactored: React.FC<PartnerManagementProps> = ({
  variant = 'user'
}) => {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Fetch partners and partner types
  const { data: partners = [], isLoading: partnersLoading } = usePartners();
  
  const { data: partnerTypes = [] } = useQuery<PartnerType[]>({
    queryKey: ['/api/partner-types'],
    queryFn: async () => {
      const response = await fetch('/api/partner-types');
      if (!response.ok) throw new Error('Failed to fetch partner types');
      return response.json();
    }
  });

  // Filter partners based on search and type
  const filteredPartners = React.useMemo(() => {
    return partners.filter(partner => {
      const matchesSearch = !searchQuery || 
        partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.specialties?.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = !selectedType || 
        partner.partnerTypeId?.toString() === selectedType;

      return matchesSearch && matchesType;
    });
  }, [partners, searchQuery, selectedType]);

  const handlePartnerView = (partnerId: number) => {
    if (variant === 'admin') {
      setLocation(`/admin/cadastros/parceiros/${partnerId}`);
    } else {
      setLocation(`/hub/parceiros/${partnerId}`);
    }
  };

  const handlePartnerEdit = (partnerId: number) => {
    if (variant === 'admin') {
      setLocation(`/admin/cadastros/parceiros/${partnerId}/edit`);
    }
  };

  const handlePartnerCreate = () => {
    if (variant === 'admin') {
      setLocation('/admin/cadastros/parceiros/novo');
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          {variant === 'admin' ? 'Gerenciar Parceiros' : 'Nossos Parceiros'}
        </h1>
        <p className="text-gray-600 mt-2">
          {variant === 'admin' 
            ? 'Administre a rede de parceiros da plataforma'
            : 'Encontre parceiros especializados para suas necessidades'
          }
        </p>
      </div>

      <PartnerList
        partners={filteredPartners}
        partnerTypes={partnerTypes}
        isLoading={partnersLoading}
        searchQuery={searchQuery}
        selectedType={selectedType}
        variant={variant}
        onSearchChange={setSearchQuery}
        onTypeChange={setSelectedType}
        onPartnerView={handlePartnerView}
        onPartnerEdit={variant === 'admin' ? handlePartnerEdit : undefined}
        onPartnerCreate={variant === 'admin' ? handlePartnerCreate : undefined}
      />
    </div>
  );
};