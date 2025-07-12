/**
 * LogoHistoryModal Component - Display user's logo generation history
 * 
 * Features:
 * - Modal interface with logo gallery
 * - Search functionality
 * - Pagination
 * - Download functionality
 * - Professional design
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  History, 
  Search, 
  Download, 
  Calendar, 
  DollarSign, 
  Clock, 
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Palette
} from 'lucide-react';

interface LogoHistoryItem {
  id: number;
  brandName: string;
  businessDescription: string;
  logoUrls: string[];
  generatedImageUrl: string;
  status: string;
  cost: string;
  creditsUsed: string;
  duration: number;
  formattedDate: string;
  formattedCost: string;
  createdAt: string;
}

interface LogoHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LogoHistoryModal: React.FC<LogoHistoryModalProps> = ({ isOpen, onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Query logo history
  const { data: historyData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/picsart/logo-history', currentPage, debouncedSearch],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12'
      });
      
      if (debouncedSearch.trim()) {
        params.append('search', debouncedSearch.trim());
      }

      const response = await fetch(`/api/picsart/logo-history?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch logo history');
      }

      return response.json();
    },
    enabled: isOpen,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const logos = historyData?.data?.logos || [];
  const pagination = historyData?.data?.pagination || {};

  // Download logo function
  const handleDownloadLogo = async (logoUrl: string, brandName: string) => {
    try {
      const response = await fetch(logoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `logo_${brandName}_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <History className="w-5 h-5 text-purple-600" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              Histórico de Logomarcas
            </DialogTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* Search */}
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar por nome da marca..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            Atualizar
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                <p className="text-sm text-gray-600">Carregando histórico...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Erro ao carregar histórico</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => refetch()}>
                  Tentar novamente
                </Button>
              </div>
            </div>
          ) : logos.length === 0 ? (
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <Palette className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  {debouncedSearch ? 'Nenhuma logo encontrada' : 'Nenhuma logo gerada ainda'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {debouncedSearch ? 'Tente uma busca diferente' : 'Gere sua primeira logo para vê-la aqui'}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {logos.map((logo: LogoHistoryItem) => (
                <div key={logo.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Logo Display */}
                  <div className="aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {logo.logoUrls && logo.logoUrls.length > 0 ? (
                      <img
                        src={logo.logoUrls[0] || logo.generatedImageUrl}
                        alt={logo.brandName}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = logo.generatedImageUrl;
                        }}
                      />
                    ) : logo.generatedImageUrl ? (
                      <img
                        src={logo.generatedImageUrl}
                        alt={logo.brandName}
                        className="max-w-full max-h-full object-contain"
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                        <p className="text-xs">Imagem não disponível</p>
                      </div>
                    )}
                  </div>

                  {/* Brand Info */}
                  <div className="space-y-2">
                    <div>
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {logo.brandName}
                      </h4>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {logo.businessDescription}
                      </p>
                    </div>

                    {/* Status and Cost */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={logo.status === 'success' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {logo.status === 'success' ? 'Sucesso' : 'Falhou'}
                      </Badge>
                      {logo.status === 'success' && (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <DollarSign className="w-3 h-3" />
                          {logo.formattedCost} créditos
                        </div>
                      )}
                    </div>

                    {/* Date and Duration */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {logo.formattedDate}
                      </div>
                      {logo.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {Math.round(logo.duration / 1000)}s
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {logo.status === 'success' && (logo.logoUrls?.length > 0 || logo.generatedImageUrl) && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs"
                          onClick={() => handleDownloadLogo(
                            logo.logoUrls?.[0] || logo.generatedImageUrl,
                            logo.brandName
                          )}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                        {logo.logoUrls && logo.logoUrls.length > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            +{logo.logoUrls.length - 1}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-gray-600">
              Página {pagination.page} de {pagination.totalPages} 
              ({pagination.totalCount} {pagination.totalCount === 1 ? 'logo' : 'logos'})
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPrevious || isLoading}
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasMore || isLoading}
              >
                Próxima
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LogoHistoryModal;