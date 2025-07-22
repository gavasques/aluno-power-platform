import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { Supplier, Department } from '@shared/schema';

interface SupplierInfoFormProps {
  supplier: Supplier;
  editForm: Partial<Supplier>;
  onFormChange: (updates: Partial<Supplier>) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const COUNTRIES = [
  'Brasil', 'China', 'Taiwan', 'Hong Kong', 'Índia', 
  'Turquia', 'Argentina', 'Paraguai', 'Outro'
];

const SUPPLIER_TYPES = [
  'distribuidora', 'importadora', 'fabricante', 'indústria', 'representante'
];

export const SupplierInfoForm: React.FC<SupplierInfoFormProps> = ({
  supplier,
  editForm,
  onFormChange,
  onSave,
  onCancel,
  isLoading = false
}) => {
  // Carregar departamentos para o dropdown
  const { data: departments = [], isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });
  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleCNPJChange = (value: string) => {
    const formatted = formatCNPJ(value);
    onFormChange({ cnpj: formatted });
  };

  const handleCEPChange = (value: string) => {
    const formatted = formatCEP(value);
    onFormChange({ cep: formatted });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Informações Básicas
          </h4>
          
          <div>
            <Label htmlFor="tradeName">Nome Fantasia *</Label>
            <Input
              id="tradeName"
              value={editForm.tradeName || supplier.tradeName || ''}
              onChange={(e) => onFormChange({ tradeName: e.target.value })}
              placeholder="Nome fantasia do fornecedor"
            />
          </div>

          <div>
            <Label htmlFor="corporateName">Razão Social *</Label>
            <Input
              id="corporateName"
              value={editForm.corporateName || supplier.corporateName || ''}
              onChange={(e) => onFormChange({ corporateName: e.target.value })}
              placeholder="Razão social completa"
            />
          </div>

          <div>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input
              id="cnpj"
              value={editForm.cnpj || supplier.cnpj || ''}
              onChange={(e) => handleCNPJChange(e.target.value)}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>

          <div>
            <Label htmlFor="categoryId">Categoria Principal do Fornecedor</Label>
            <Select
              value={editForm.categoryId?.toString() || supplier.categoryId?.toString() || ''}
              onValueChange={(value) => onFormChange({ categoryId: value ? parseInt(value) : null })}
              disabled={departmentsLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={departmentsLoading ? "Carregando..." : "Selecione uma categoria"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem categoria</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id.toString()}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="supplierType">Tipo de Fornecedor</Label>
            <Select
              value={editForm.supplierType || supplier.supplierType || ''}
              onValueChange={(value) => onFormChange({ supplierType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
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
            <Label htmlFor="stateRegistration">Inscrição Estadual</Label>
            <Input
              id="stateRegistration"
              value={editForm.stateRegistration || supplier.stateRegistration || ''}
              onChange={(e) => onFormChange({ stateRegistration: e.target.value })}
              placeholder="Inscrição estadual"
            />
          </div>

          <div>
            <Label htmlFor="municipalRegistration">Inscrição Municipal</Label>
            <Input
              id="municipalRegistration"
              value={editForm.municipalRegistration || supplier.municipalRegistration || ''}
              onChange={(e) => onFormChange({ municipalRegistration: e.target.value })}
              placeholder="Inscrição municipal"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
            Localização
          </h4>

          <div>
            <Label htmlFor="country">País</Label>
            <Select
              value={editForm.country || supplier.country || ''}
              onValueChange={(value) => onFormChange({ country: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o país" />
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="state">Estado</Label>
              <Input
                id="state"
                value={editForm.state || supplier.state || ''}
                onChange={(e) => onFormChange({ state: e.target.value })}
                placeholder="Estado"
              />
            </div>
            <div>
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={editForm.city || supplier.city || ''}
                onChange={(e) => onFormChange({ city: e.target.value })}
                placeholder="Cidade"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              value={editForm.cep || supplier.cep || ''}
              onChange={(e) => handleCEPChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>

          <div>
            <Label htmlFor="address">Endereço Completo</Label>
            <Textarea
              id="address"
              value={editForm.address || supplier.address || ''}
              onChange={(e) => onFormChange({ address: e.target.value })}
              placeholder="Rua, número, complemento, bairro"
              rows={3}
            />
          </div>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={editForm.description || supplier.description || ''}
          onChange={(e) => onFormChange({ description: e.target.value })}
          placeholder="Descrição detalhada do fornecedor, produtos e serviços"
          rows={4}
        />
      </div>

      <div>
        <Label htmlFor="additionalInfo">Informações Adicionais</Label>
        <Textarea
          id="additionalInfo"
          value={editForm.additionalInfo || supplier.additionalInfo || ''}
          onChange={(e) => onFormChange({ additionalInfo: e.target.value })}
          placeholder="Informações adicionais livres sobre o fornecedor (observações, histórico, notas especiais, etc.)"
          rows={4}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button 
          type="button" 
          onClick={onSave}
          disabled={isLoading}
        >
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
};