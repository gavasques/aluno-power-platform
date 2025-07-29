/**
 * Componente de apresentação para visão geral do fornecedor
 * Exibe informações básicas, rating, status e métricas principais
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Star, 
  TrendingUp,
  Calendar,
  Save,
  X
} from "lucide-react";
import type { Supplier } from '../../types/supplier.types';

interface SupplierOverviewProps {
  supplier: Supplier;
  onUpdate: (data: Partial<Supplier>) => Promise<void>;
  isLoading?: boolean;
}

export const SupplierOverview = ({ supplier, onUpdate, isLoading = false }: SupplierOverviewProps) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: supplier.name,
    email: supplier.email || '',
    phone: supplier.phone || '',
    website: supplier.website || '',
    description: supplier.description || '',
    establishedYear: supplier.establishedYear || ''
  });

  const getStatusColor = (status: Supplier['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Supplier['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return 'Desconhecido';
    }
  };

  const handleSave = async () => {
    await onUpdate({
      name: editForm.name,
      email: editForm.email || undefined,
      phone: editForm.phone || undefined,
      website: editForm.website || undefined,
      description: editForm.description || undefined,
      establishedYear: editForm.establishedYear ? parseInt(editForm.establishedYear.toString()) : undefined
    });
    setIsEditModalOpen(false);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-gray-500" />
              <CardTitle className="text-2xl">{supplier.name}</CardTitle>
              <Badge className={getStatusColor(supplier.status)}>
                {getStatusText(supplier.status)}
              </Badge>
            </div>
            <CardDescription className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{supplier.city}, {supplier.country}</span>
              </span>
              <span className="flex items-center space-x-1">
                <div className="flex">{renderStars(supplier.rating)}</div>
                <span className="text-sm text-gray-600">({supplier.rating}/5)</span>
              </span>
            </CardDescription>
          </div>
          
          <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Editar Fornecedor</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Nome do fornecedor"
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="+55 11 99999-9999"
                  />
                </div>
                
                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                    placeholder="https://exemplo.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="establishedYear">Ano de Fundação</Label>
                  <Input
                    id="establishedYear"
                    type="number"
                    value={editForm.establishedYear}
                    onChange={(e) => setEditForm({ ...editForm, establishedYear: e.target.value })}
                    placeholder="2020"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Descrição do fornecedor..."
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} disabled={isLoading}>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Métricas */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Total de Pedidos</span>
              </div>
              <div className="text-2xl font-bold">{supplier.totalOrders}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Último Contato</span>
              </div>
              <div className="text-sm text-gray-600">
                {new Date(supplier.lastContact).toLocaleDateString('pt-BR')}
              </div>
            </div>
            
            {supplier.establishedYear && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Fundado em</span>
                </div>
                <div className="text-2xl font-bold">{supplier.establishedYear}</div>
              </div>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium">Categoria</span>
              </div>
              <Badge variant="secondary">{supplier.category}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações de Contato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {supplier.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Email</div>
                  <a 
                    href={`mailto:${supplier.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {supplier.email}
                  </a>
                </div>
              </div>
            )}
            
            {supplier.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Telefone</div>
                  <a 
                    href={`tel:${supplier.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {supplier.phone}
                  </a>
                </div>
              </div>
            )}
            
            {supplier.website && (
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="font-medium">Website</div>
                  <a 
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {supplier.website}
                  </a>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium">Localização</div>
                <div className="text-gray-600">{supplier.city}, {supplier.country}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      {supplier.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descrição</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{supplier.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};