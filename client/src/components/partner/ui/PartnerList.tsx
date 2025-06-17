import React from 'react';
import { PartnerCard } from './PartnerCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Filter } from 'lucide-react';
import type { Partner, PartnerType } from '@shared/schema';

interface PartnerListProps {
  partners: Partner[];
  partnerTypes: PartnerType[];
  isLoading?: boolean;
  searchQuery?: string;
  selectedType?: string;
  variant?: 'user' | 'admin';
  onSearchChange?: (query: string) => void;
  onTypeChange?: (typeId: string) => void;
  onPartnerView?: (partnerId: number) => void;
  onPartnerEdit?: (partnerId: number) => void;
  onPartnerCreate?: () => void;
}

export const PartnerList: React.FC<PartnerListProps> = ({
  partners,
  partnerTypes,
  isLoading = false,
  searchQuery = '',
  selectedType = '',
  variant = 'user',
  onSearchChange,
  onTypeChange,
  onPartnerView,
  onPartnerEdit,
  onPartnerCreate
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search */}
          {onSearchChange && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar parceiros..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {/* Type Filter */}
          {onTypeChange && (
            <Select value={selectedType} onValueChange={onTypeChange}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                {partnerTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Create Button (Admin only) */}
        {variant === 'admin' && onPartnerCreate && (
          <Button onClick={onPartnerCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Parceiro
          </Button>
        )}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {partners.length} parceiro{partners.length !== 1 ? 's' : ''} encontrado{partners.length !== 1 ? 's' : ''}
      </div>

      {/* Partner Grid */}
      {partners.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Nenhum parceiro encontrado</div>
          <p className="text-gray-500">
            {searchQuery || selectedType 
              ? 'Tente ajustar os filtros para encontrar parceiros'
              : 'Não há parceiros cadastrados no momento'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {partners.map((partner) => (
            <PartnerCard
              key={partner.id}
              partner={partner}
              partnerType={partnerTypes.find(type => type.id === partner.partnerTypeId)}
              onView={onPartnerView}
              onEdit={onPartnerEdit}
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  );
};