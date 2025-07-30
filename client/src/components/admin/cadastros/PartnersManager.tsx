import { useState, useCallback, useMemo, memo } from 'react';
import { usePartners } from '@/contexts/PartnersContext';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

const PartnersManager = memo(() => {
  const { partners, loading, deletePartner, searchPartners } = usePartners();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<DbPartner | null>(null);
  const [showForm, setShowForm] = useState(false);

  // ✅ OTIMIZAÇÃO 3: useMemo para cálculos pesados - Map para O(1) lookup vs O(n) find
  const categoriesMap = useMemo(() => {
    return new Map([
      [1, 'Contadores'],
      [2, 'Advogados'],
      [3, 'Fotógrafos'],
      [4, 'Prep Centers'],
      [5, 'Designers'],
      [6, 'Consultores'],
    ]);
  }, []);

  // ✅ OTIMIZAÇÃO 3: useCallback para função de categoria evita recalculação
  const getCategoryName = useCallback((categoryId: number | null) => {
    if (categoryId === null) return 'Não definida';
    return categoriesMap.get(categoryId) || 'Não definida';
  }, [categoriesMap]);

  // ✅ OTIMIZAÇÃO 3: useMemo para filtrar parceiros apenas quando necessário
  const filteredPartners = useMemo(() => {
    if (!partners) return [];
    return searchQuery ? searchPartners(searchQuery) : partners;
  }, [partners, searchQuery, searchPartners]);

  // ✅ OTIMIZAÇÃO 2: useCallback para event handlers evita re-renders
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
              <CardTitle className="text-foreground">Gerenciar Parceiros</CardTitle>
              <CardDescription className="text-muted-foreground">
                Administre os parceiros verificados da plataforma
              </CardDescription>
            </div>
            <Button onClick={handleAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Novo Parceiro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar parceiros..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Logo</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Avaliação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Nenhum parceiro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPartners.map((partner) => (
                      <TableRow key={partner.id}>
                        <TableCell>
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {partner.logo ? (
                              <img 
                                src={partner.logo} 
                                alt={`${partner.name} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  const img = e.target as HTMLImageElement;
                                  img.style.display = 'none';
                                  const parent = img.parentElement;
                                  if (parent) {
                                    parent.innerHTML = '<div class="text-gray-400 flex items-center justify-center w-full h-full"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                                  }
                                }}
                              />
                            ) : (
                              <Image className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{partner.name}</TableCell>
                        <TableCell>{partner.email || 'Não informado'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getCategoryName(partner.partnerTypeId)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {partner.isVerified ? (
                            <Badge variant="default" className="bg-green-500">
                              <Shield className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline">Pendente</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="font-medium">
                              {partner.averageRating ? Number(partner.averageRating).toFixed(1) : '0.0'}
                            </span>
                            <span className="text-muted-foreground">({partner.totalReviews || 0})</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(partner)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(partner.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {showForm && (
        <PartnerForm
          partner={selectedPartner}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
});

// ✅ OTIMIZAÇÃO 1: React.memo() implementado com display name para debugging
PartnersManager.displayName = 'PartnersManager';

export default PartnersManager;