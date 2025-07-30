/**
 * PARTNERS MANAGER OPTIMIZED - EXEMPLO DE PERFORMANCE
 * Demonstração de todas as otimizações identificadas na análise
 * 
 * OTIMIZAÇÕES IMPLEMENTADAS:
 * ✅ React.memo() com custom equality function
 * ✅ useCallback() para todos os event handlers  
 * ✅ useMemo() para cálculos pesados e filtros
 * ✅ Debounced search para performance
 * ✅ Virtualização de lista para grandes datasets
 * ✅ Lazy loading de imagens
 * ✅ Separação de componentes para melhor memoização
 */

import React, { useState, useCallback, useMemo, memo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { usePartners } from '@/contexts/PartnersContext';
import { useDebounce } from '@/hooks/useDebounce';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Shield,
  Image,
} from 'lucide-react';
import type { Partner as DbPartner } from '@shared/schema';
import PartnerForm from './PartnerForm';

// ===== OTIMIZAÇÃO 1: MEMOIZED CATEGORY MAP =====
const CATEGORIES_MAP = new Map([
  [1, 'Contadores'],
  [2, 'Advogados'],
  [3, 'Fotógrafos'],
  [4, 'Prep Centers'],
  [5, 'Designers'],
  [6, 'Consultores'],
]);

// ===== OTIMIZAÇÃO 2: OPTIMIZED IMAGE COMPONENT =====
interface OptimizedImageProps {
  src?: string;
  alt: string;
  className?: string;
}

const OptimizedImage = memo<OptimizedImageProps>(({ src, alt, className }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  if (!src) {
    return (
      <div className={`w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center ${className}`}>
        <Image className="w-4 h-4 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-contain transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Image className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
});
OptimizedImage.displayName = 'OptimizedImage';

// ===== OTIMIZAÇÃO 3: MEMOIZED PARTNER ROW =====
interface PartnerRowProps {
  partner: DbPartner;
  onEdit: (partner: DbPartner) => void;
  onDelete: (id: number) => void;
  style?: React.CSSProperties;
}

const PartnerRow = memo<PartnerRowProps>(({ partner, onEdit, onDelete, style }) => {
  // ===== MEMOIZED CALCULATIONS =====
  const categoryName = useMemo(() => {
    return CATEGORIES_MAP.get(partner.partnerTypeId) || 'Não definida';
  }, [partner.partnerTypeId]);

  const averageRating = useMemo(() => {
    return partner.averageRating ? Number(partner.averageRating).toFixed(1) : '0.0';
  }, [partner.averageRating]);

  // ===== MEMOIZED HANDLERS =====
  const handleEdit = useCallback(() => {
    onEdit(partner);
  }, [onEdit, partner]);

  const handleDelete = useCallback(() => {
    onDelete(partner.id);
  }, [onDelete, partner.id]);

  return (
    <div
      style={style}
      className="flex items-center border-b border-border px-4 py-3 hover:bg-muted/50"
    >
      {/* Logo */}
      <div className="w-16 flex justify-center">
        <OptimizedImage
          src={partner.logo || undefined}
          alt={`${partner.name} logo`}
        />
      </div>

      {/* Name */}
      <div className="flex-1 px-4">
        <span className="font-medium">{partner.name}</span>
      </div>

      {/* Email */}
      <div className="flex-1 px-4">
        <span className="text-sm text-muted-foreground">
          {partner.email || 'Não informado'}
        </span>
      </div>

      {/* Category */}
      <div className="w-32 px-4">
        <Badge variant="secondary">{categoryName}</Badge>
      </div>

      {/* Status */}
      <div className="w-32 px-4">
        {partner.isVerified ? (
          <Badge variant="default" className="bg-green-500">
            <Shield className="h-3 w-3 mr-1" />
            Verificado
          </Badge>
        ) : (
          <Badge variant="outline">Pendente</Badge>
        )}
      </div>

      {/* Rating */}
      <div className="w-24 px-4">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium text-sm">{averageRating}</span>
          <span className="text-muted-foreground text-xs">
            ({partner.totalReviews || 0})
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="w-24 px-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom equality function para evitar re-renders desnecessários
  return (
    prevProps.partner.id === nextProps.partner.id &&
    prevProps.partner.name === nextProps.partner.name &&
    prevProps.partner.email === nextProps.partner.email &&
    prevProps.partner.partnerTypeId === nextProps.partner.partnerTypeId &&
    prevProps.partner.isVerified === nextProps.partner.isVerified &&
    prevProps.partner.averageRating === nextProps.partner.averageRating &&
    prevProps.partner.totalReviews === nextProps.partner.totalReviews &&
    prevProps.partner.logo === nextProps.partner.logo
  );
});
PartnerRow.displayName = 'PartnerRow';

// ===== OTIMIZAÇÃO 4: VIRTUALIZED LIST =====
interface VirtualizedPartnersListProps {
  partners: DbPartner[];
  onEdit: (partner: DbPartner) => void;
  onDelete: (id: number) => void;
}

const VirtualizedPartnersList = memo<VirtualizedPartnersListProps>(({
  partners,
  onEdit,
  onDelete
}) => {
  const Row = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const partner = partners[index];
    return (
      <PartnerRow
        key={partner.id}
        partner={partner}
        onEdit={onEdit}
        onDelete={onDelete}
        style={style}
      />
    );
  }, [partners, onEdit, onDelete]);

  if (partners.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum parceiro encontrado
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      {/* Header */}
      <div className="flex items-center border-b border-border px-4 py-3 bg-muted/50 font-medium text-sm">
        <div className="w-16 text-center">Logo</div>
        <div className="flex-1 px-4">Nome</div>
        <div className="flex-1 px-4">Email</div>
        <div className="w-32 px-4">Categoria</div>
        <div className="w-32 px-4">Status</div>
        <div className="w-24 px-4">Avaliação</div>
        <div className="w-24 px-4">Ações</div>
      </div>

      {/* Virtualized List */}
      <List
        height={Math.min(600, partners.length * 60)} // Max 600px height
        itemCount={partners.length}
        itemSize={60}
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
});
VirtualizedPartnersList.displayName = 'VirtualizedPartnersList';

// ===== MAIN COMPONENT =====
const PartnersManagerOptimized = memo(() => {
  const { partners, loading, deletePartner, searchPartners } = usePartners();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<DbPartner | null>(null);
  const [showForm, setShowForm] = useState(false);

  // ===== OTIMIZAÇÃO 5: DEBOUNCED SEARCH =====
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // ===== OTIMIZAÇÃO 6: MEMOIZED FILTERED PARTNERS =====
  const filteredPartners = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return partners || [];
    }
    return searchPartners(debouncedSearchQuery);
  }, [debouncedSearchQuery, partners, searchPartners]);

  // ===== OTIMIZAÇÃO 7: MEMOIZED HANDLERS =====
  const handleDelete = useCallback((id: number) => {
    if (confirm('Tem certeza que deseja excluir este parceiro?')) {
      deletePartner(id);
    }
  }, [deletePartner]);

  const handleEdit = useCallback((partner: DbPartner) => {
    setSelectedPartner(partner);
    setShowForm(true);
  }, []);

  const handleAdd = useCallback(() => {
    setSelectedPartner(null);
    setShowForm(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setShowForm(false);
    setSelectedPartner(null);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Carregando parceiros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">
                Gerenciar Parceiros (Otimizado)
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Administre os parceiros verificados da plataforma - Performance Optimized
              </CardDescription>
            </div>
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Parceiro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar parceiros..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Virtualized Partners List */}
            <VirtualizedPartnersList
              partners={filteredPartners}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Performance Stats */}
            <div className="text-xs text-muted-foreground border-t pt-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="font-medium">Total Partners:</span> {partners?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Filtered:</span> {filteredPartners.length}
                </div>
                <div>
                  <span className="font-medium">Rendered DOM Nodes:</span> ~{Math.min(10, filteredPartners.length)}
                  <span className="text-green-600 ml-1">
                    (vs {filteredPartners.length} without virtualization)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Form Modal */}
      {showForm && (
        <PartnerForm
          partner={selectedPartner}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
});

PartnersManagerOptimized.displayName = 'PartnersManagerOptimized';

export default PartnersManagerOptimized;