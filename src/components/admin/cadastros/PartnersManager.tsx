
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
} from 'lucide-react';
import { Partner } from '@/types/partner';
import PartnerForm from './PartnerForm';
import ReviewsManager from './ReviewsManager';

const PartnersManager = () => {
  const { partners, loading, deletePartner, searchPartners } = usePartners();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showReviews, setShowReviews] = useState<string | null>(null);

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
        <p className="mt-2 text-slate-400">Carregando parceiros...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-slate-100">Gerenciar Parceiros</CardTitle>
              <CardDescription className="text-slate-400">
                Administre os parceiros verificados da plataforma
              </CardDescription>
            </div>
            <Button onClick={handleAdd} className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Parceiro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Buscar parceiros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-slate-100">{partners.length}</div>
                  <p className="text-slate-400 text-sm">Total de Parceiros</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-400">
                    {partners.filter(p => p.isVerified).length}
                  </div>
                  <p className="text-slate-400 text-sm">Verificados</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-400">
                    {partners.reduce((acc, p) => acc + p.totalReviews, 0)}
                  </div>
                  <p className="text-slate-400 text-sm">Total de Avaliações</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-700 border-slate-600">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-400">
                    {partners.reduce((acc, p) => acc + p.reviews.filter(r => !r.isApproved).length, 0)}
                  </div>
                  <p className="text-slate-400 text-sm">Avaliações Pendentes</p>
                </CardContent>
              </Card>
            </div>

            {/* Partners Table */}
            <div className="border border-slate-600 rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-600">
                    <TableHead className="text-slate-300">Nome</TableHead>
                    <TableHead className="text-slate-300">Categoria</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Avaliações</TableHead>
                    <TableHead className="text-slate-300">Localização</TableHead>
                    <TableHead className="text-slate-300">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPartners.map((partner) => {
                    const pendingReviews = partner.reviews.filter(r => !r.isApproved).length;
                    return (
                      <TableRow key={partner.id} className="border-slate-600">
                        <TableCell className="text-slate-100">
                          <div>
                            <div className="font-medium">{partner.name}</div>
                            <div className="text-sm text-slate-400">{partner.email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <Badge variant="outline" className="border-slate-500 text-slate-300">
                            {partner.category.name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {partner.isVerified ? (
                            <Badge className="bg-green-600 text-white">
                              <Shield className="h-3 w-3 mr-1" />
                              Verificado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span>{partner.averageRating.toFixed(1)}</span>
                            </div>
                            <span>({partner.totalReviews})</span>
                            {pendingReviews > 0 && (
                              <Badge variant="secondary" className="bg-orange-600 text-white">
                                {pendingReviews} pendentes
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {partner.address.city}, {partner.address.state}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowReviews(partner.id)}
                              className="text-slate-300 hover:text-white hover:bg-slate-700"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(partner)}
                              className="text-slate-300 hover:text-white hover:bg-slate-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(partner.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
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
                <p className="text-slate-400">Nenhum parceiro encontrado.</p>
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
    </div>
  );
};

export default PartnersManager;
