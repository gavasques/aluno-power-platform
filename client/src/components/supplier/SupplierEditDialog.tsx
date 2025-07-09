import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import type { Department } from '@shared/schema';

interface SupplierEditDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (supplier: any) => Promise<unknown>;
  supplier: any;
  isLoading?: boolean;
}

export const SupplierEditDialog: React.FC<SupplierEditDialogProps> = ({
  open,
  onClose,
  onSave,
  supplier,
  isLoading = false
}) => {
  const { toast } = useToast();
  
  // Carregar departamentos para o dropdown
  const { data: departments = [], isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });
  const [formData, setFormData] = useState({
    tradeName: '',
    corporateName: '',
    cnpj: '',
    categoryId: null as number | null,
    country: '',
    state: '',
    city: '',
    cep: '',
    address: '',
    stateRegistration: '',
    municipalRegistration: '',
    supplierType: '',
    description: '',
    additionalInfo: ''
  });

  const COUNTRIES = [
    'Brasil', 'China', 'Taiwan', 'Hong Kong', 'Índia', 
    'Turquia', 'Argentina', 'Paraguai', 'Outro'
  ];

  const SUPPLIER_TYPES = [
    'distribuidora', 'importadora', 'fabricante', 'indústria', 'representante'
  ];

  useEffect(() => {
    if (supplier && open) {
      console.log('🔥 SupplierEditDialog: Loading data for supplier:', supplier.tradeName);
      setFormData({
        tradeName: supplier.tradeName || '',
        corporateName: supplier.corporateName || '',
        cnpj: supplier.cnpj || '',
        categoryId: supplier.categoryId || null,
        country: supplier.country || '',
        state: supplier.state || '',
        city: supplier.city || '',
        cep: supplier.cep || '',
        address: supplier.address || '',
        stateRegistration: supplier.stateRegistration || '',
        municipalRegistration: supplier.municipalRegistration || '',
        supplierType: supplier.supplierType || '',
        description: supplier.description || '',
        additionalInfo: supplier.additionalInfo || ''
      });
    }
  }, [supplier, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔥 SupplierEditDialog: Submitting form data:', formData);
    
    try {
      await onSave(formData);
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso!",
      });
      onClose();
    } catch (error) {
      console.error('Error updating supplier:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar fornecedor. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Fornecedor</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tradeName">Nome Fantasia *</Label>
              <Input
                id="tradeName"
                value={formData.tradeName}
                onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="corporateName">Razão Social</Label>
              <Input
                id="corporateName"
                value={formData.corporateName}
                onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <Label htmlFor="categoryId">Categoria Principal</Label>
              <Select 
                value={formData.categoryId ? String(formData.categoryId) : ""} 
                onValueChange={(value) => setFormData({ ...formData, categoryId: value ? Number(value) : null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={departmentsLoading ? "Carregando..." : "Selecionar categoria"} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierType">Tipo de Fornecedor</Label>
              <Select value={formData.supplierType} onValueChange={(value) => setFormData({ ...formData, supplierType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {SUPPLIER_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="country">País</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar país" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                value={formData.cep}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                placeholder="00000-000"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
              <Input
                id="stateRegistration"
                value={formData.stateRegistration}
                onChange={(e) => setFormData({ ...formData, stateRegistration: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="municipalRegistration">Inscrição Municipal</Label>
              <Input
                id="municipalRegistration"
                value={formData.municipalRegistration}
                onChange={(e) => setFormData({ ...formData, municipalRegistration: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição detalhada do fornecedor, produtos e serviços"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="additionalInfo">Informações Adicionais</Label>
            <Textarea
              id="additionalInfo"
              value={formData.additionalInfo}
              onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
              placeholder="Informações adicionais livres sobre o fornecedor (observações, histórico, notas especiais, etc.)"
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};