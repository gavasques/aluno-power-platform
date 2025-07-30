import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X } from 'lucide-react';
import type { Supplier, Department } from '@shared/schema';
import { COUNTRIES, SUPPLIER_TYPES } from '../types';

interface BasicInfoSectionProps {
  supplier: Supplier;
  departments: Department[];
  isEditing: boolean;
  formData: any;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFormChange: (data: any) => void;
  isUpdating: boolean;
}

export const BasicInfoSection = memo<BasicInfoSectionProps>(({
  supplier,
  departments,
  isEditing,
  formData,
  onEdit,
  onSave,
  onCancel,
  onFormChange,
  isUpdating
}) => {
  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return null;
    const department = departments.find(d => d.id === categoryId);
    return department?.name || null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Informações Básicas</h3>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button size="sm" onClick={onSave} disabled={isUpdating}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {/* Trade Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Nome Fantasia</label>
            {isEditing ? (
              <Input
                value={formData.tradeName}
                onChange={(e) => onFormChange({ ...formData, tradeName: e.target.value })}
                placeholder="Nome fantasia"
              />
            ) : (
              <p className="text-sm text-gray-900">{supplier.tradeName || 'Não informado'}</p>
            )}
          </div>

          {/* Corporate Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Razão Social</label>
            {isEditing ? (
              <Input
                value={formData.corporateName}
                onChange={(e) => onFormChange({ ...formData, corporateName: e.target.value })}
                placeholder="Razão social"
              />
            ) : (
              <p className="text-sm text-gray-900">{supplier.corporateName || 'Não informado'}</p>
            )}
          </div>

          {/* CNPJ */}
          <div>
            <label className="text-sm font-medium text-gray-700">CNPJ</label>
            {isEditing ? (
              <Input
                value={formData.cnpj}
                onChange={(e) => onFormChange({ ...formData, cnpj: e.target.value })}
                placeholder="00.000.000/0000-00"
              />
            ) : (
              <p className="text-sm text-gray-900">{supplier.cnpj || 'Não informado'}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-700">Categoria</label>
            {isEditing ? (
              <Select 
                value={formData.categoryId?.toString()} 
                onValueChange={(value) => onFormChange({ ...formData, categoryId: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-900">{getCategoryName(supplier.categoryId) || 'Não informado'}</p>
            )}
          </div>

          {/* Supplier Type */}
          <div>
            <label className="text-sm font-medium text-gray-700">Tipo de Fornecedor</label>
            {isEditing ? (
              <Select 
                value={formData.supplierType} 
                onValueChange={(value) => onFormChange({ ...formData, supplierType: value })}
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
            ) : (
              <p className="text-sm text-gray-900">
                {supplier.supplierType ? supplier.supplierType.charAt(0).toUpperCase() + supplier.supplierType.slice(1) : 'Não informado'}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium">Endereço</h4>
        <div className="space-y-3">
          {/* Country */}
          <div>
            <label className="text-sm font-medium text-gray-700">País</label>
            {isEditing ? (
              <Select 
                value={formData.country} 
                onValueChange={(value) => onFormChange({ ...formData, country: value })}
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
            ) : (
              <p className="text-sm text-gray-900">{supplier.country || 'Não informado'}</p>
            )}
          </div>

          {/* State */}
          <div>
            <label className="text-sm font-medium text-gray-700">Estado</label>
            {isEditing ? (
              <Input
                value={formData.state}
                onChange={(e) => onFormChange({ ...formData, state: e.target.value })}
                placeholder="Estado"
              />
            ) : (
              <p className="text-sm text-gray-900">{supplier.state || 'Não informado'}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="text-sm font-medium text-gray-700">Cidade</label>
            {isEditing ? (
              <Input
                value={formData.city}
                onChange={(e) => onFormChange({ ...formData, city: e.target.value })}
                placeholder="Cidade"
              />
            ) : (
              <p className="text-sm text-gray-900">{supplier.city || 'Não informado'}</p>
            )}
          </div>

          {/* CEP */}
          <div>
            <label className="text-sm font-medium text-gray-700">CEP</label>
            {isEditing ? (
              <Input
                value={formData.cep}
                onChange={(e) => onFormChange({ ...formData, cep: e.target.value })}
                placeholder="00000-000"
              />
            ) : (
              <p className="text-sm text-gray-900">{supplier.cep || 'Não informado'}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-700">Endereço</label>
            {isEditing ? (
              <Input
                value={formData.address}
                onChange={(e) => onFormChange({ ...formData, address: e.target.value })}
                placeholder="Endereço completo"
              />
            ) : (
              <p className="text-sm text-gray-900">{supplier.address || 'Não informado'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});