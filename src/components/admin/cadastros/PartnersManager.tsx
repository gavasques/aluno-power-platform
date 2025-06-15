
import React, { useState } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Shield,
  Eye,
  MessageSquare,
  CheckCircle,
  XCircle,
  FileText,
} from 'lucide-react';
import { Partner } from '@/types/partner';
import PartnerForm from './PartnerForm';
import ReviewsManager from './ReviewsManager';
import PartnerMaterialsManager from './PartnerMaterialsManager';

const PartnersManager = () => {
  const { partners, loading, deletePartner, searchPartners } = usePartners();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showReviews, setShowReviews] = useState<string | null>(null);
  const [showMaterials, setShowMaterials] = useState<Partner | null>(null);

  const filteredPartners = searchQuery ? searchPartners(searchQuery) : partners;

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este parceiro?')) {
      deletePartner(id);
    }
  };

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowForm(true);
  };

  const handleAdd = () => {
    setSelectedPartner(null);
    setShowForm(true);
  };

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
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar parceiros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-foreground">{partners.length}</div>
                  <p className="text-muted-foreground text-sm">Total de Parceiros</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {partners.filter(p => p.isVerified).length}
                  </div>
                  <p className="text-muted-foreground text-sm">Verificados</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {partners.reduce((acc, p) => acc + p.totalReviews, 0)}
                  </div>
                  <p className="text-muted-foreground text-sm">Total de Avaliações</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {partners.reduce((acc, p) => acc + p.materials.length, 0)}
                  </div>
                  <p className="text-muted-foreground text-sm">Total de Materiais</p>
                </CardContent>
              </Card>
            </div>

            {/* Partners Table */}
            <div className="border border-border rounded-lg overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/50">
                    <TableHead className="text-foreground font-medium">Nome</TableHead>
                    <TableHead className="text-foreground font-medium">Categoria</TableHead>
                    <TableHead className="text-foreground font-medium">Status</TableHead>
                    <TableHead className="text-foreground font-medium">Avaliações</TableHead>
                    <TableHead className="text-foreground font-medium">Materiais</TableHead>
                    <TableHead className="text-foreground font-medium">Localização</TableHead>
                    <TableHead className="text-foreground font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => {
                    const pendingReviews = partner.reviews.filter(r => !r.isApproved).length;
                    return (
                      <TableRow key={partner.id} className="border-border hover:bg-muted/50">
                        <TableCell className="text-foreground">
                          <div>
                            <div className="font-medium">{partner.name}</div>
                            <div className="text-sm text-muted-foreground">{partner.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          <Badge variant="outline" className="border-border text-foreground">
                            {partner.category.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {partner.isVerified ? (
                            <Badge className="bg-green-100 text-green-800 border-green-200">
                              <Shield className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-600">
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{partner.averageRating.toFixed(1)}</span>
                            </div>
                            <span>({partner.totalReviews})</span>
                            {pendingReviews > 0 && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                                {pendingReviews} pendentes
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>{partner.materials.length}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {partner.address.city}, {partner.address.state}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowMaterials(partner)}
                              className="text-foreground hover:text-primary hover:bg-primary/10"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowReviews(partner.id)}
                              className="text-foreground hover:text-primary hover:bg-primary/10"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(partner)}
                              className="text-foreground hover:text-primary hover:bg-primary/10"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(partner.id)}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {filteredPartners.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum parceiro encontrado.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Partner Form Modal */}
      {showForm && (
        <PartnerForm
          partner={selectedPartner}
          onClose={() => {
            setShowForm(false);
            setSelectedPartner(null);
          }}
        />
      )}

      {/* Reviews Manager Modal */}
      {showReviews && (
        <ReviewsManager
          partnerId={showReviews}
          onClose={() => setShowReviews(null)}
        />
      )}

      {/* Materials Manager Modal */}
      {showMaterials && (
        <PartnerMaterialsManager
          partner={showMaterials}
          onClose={() => setShowMaterials(null)}
        />
      )}
    </div>
  );
};

export default PartnersManager;
