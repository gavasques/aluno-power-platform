import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";
import type { Supplier, SupplierFormData } from '@/types/supplier';

interface SupplierEditDialogProps {
  isOpen: boolean;
  supplier: Supplier;
  onClose: () => void;
}

export const SupplierEditDialog: React.FC<SupplierEditDialogProps> = ({
  isOpen,
  supplier,
  onClose
}) => {
  const [formData, setFormData] = useState<SupplierFormData>({
    corporateName: '',
    tradeName: '',
    email: '',
    phone: '',
    website: '',
    country: '',
    state: '',
    city: '',
    address: '',
    postalCode: '',
    supplierType: '',
    status: '',
    averageRating: 0,
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (supplier) {
      setFormData({
        corporateName: supplier.name,
        tradeName: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        website: supplier.website || '',
        country: supplier.country,
        state: '',
        city: supplier.city,
        address: '',
        postalCode: '',
        supplierType: 'fabricante',
        status: supplier.status === 'active' ? 'ativo' : 'inativo',
        averageRating: supplier.rating,
        description: supplier.description || ''
      });
    }
  }, [supplier]);

  const handleInputChange = (field: keyof SupplierFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implementar update do fornecedor
      console.log('Update supplier:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular API call
      onClose();
    } catch (error) {
      console.error('Erro ao salvar fornecedor:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Fornecedor</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="corporateName">Razão Social *</Label>
              <Input
                id="corporateName"
                value={formData.corporateName}
                onChange={(e) => handleInputChange('corporateName', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="tradeName">Nome Fantasia</Label>
              <Input
                id="tradeName"
                value={formData.tradeName}
                onChange={(e) => handleInputChange('tradeName', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierType">Tipo de Fornecedor</Label>
              <Select
                value={formData.supplierType}
                onValueChange={(value) => handleInputChange('supplierType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fabricante">Fabricante</SelectItem>
                  <SelectItem value="trading">Trading</SelectItem>
                  <SelectItem value="despachante">Despachante</SelectItem>
                  <SelectItem value="agente_cargas">Agente de Cargas</SelectItem>
                  <SelectItem value="distribuidora">Distribuidora</SelectItem>
                  <SelectItem value="importadora">Importadora</SelectItem>
                  <SelectItem value="industria">Indústria</SelectItem>
                  <SelectItem value="representante">Representante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};