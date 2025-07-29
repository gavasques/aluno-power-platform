// Empresas Manager refatorado - Seguindo princípios SOLID e DRY
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';
import { BaseManager, useFormState, CardActions, StatusBadge, FormActions } from './common/BaseManager';
import { useEmpresas } from '@/hooks/useFinancas360Api';
import type { Empresa, EmpresaInsert } from '@/types/financas360';

// Estado inicial do formulário
const initialFormState: EmpresaInsert = {
  razaoSocial: '',
  nomeFantasia: '',
  cnpj: '',
  inscricaoEstadual: '',
  inscricaoMunicipal: '',
  endereco: {
    cep: '',
    cidade: '',
    estado: '',
    logradouro: ''
  },
  telefone: '',
  email: '',
  logoUrl: '',
  isActive: true
};

export default function EmpresasManager() {
  const api = useEmpresas();

  // Adaptadores para compatibilidade de tipos
  const handleCreate = (data: EmpresaInsert) => {
    api.create(data);
  };

  const handleUpdate = (id: number, data: Partial<EmpresaInsert>) => {
    api.update({ id, data });
  };

  const handleDelete = (id: number) => {
    api.remove(id);
  };

  // Função para renderizar o formulário
  const renderForm = (editingItem: Empresa | null, onSubmit: (data: EmpresaInsert) => void, onClose: () => void) => {
    return <EmpresaForm editingItem={editingItem} onSubmit={onSubmit} onClose={onClose} />;
  };

  // Função para renderizar a lista
  const renderList = (items: Empresa[], onEdit: (item: Empresa) => void, onDelete: (id: number) => void) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((empresa) => (
          <EmpresaCard
            key={empresa.id}
            empresa={empresa}
            onEdit={() => onEdit(empresa)}
            onDelete={() => onDelete(empresa.id)}
            isDeleting={api.isDeleting}
          />
        ))}
      </div>
    );
  };

  return (
    <BaseManager
      title="Empresas"
      icon={<Building2 className="h-6 w-6 text-blue-600" />}
      entityName="Empresa"
      data={api.data}
      isLoading={api.isLoading}
      error={api.error}
      isCreating={api.isCreating}
      isUpdating={api.isUpdating}
      isDeleting={api.isDeleting}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      onRefetch={api.refetch}
      renderForm={renderForm}
      renderList={renderList}
      searchFields={['razaoSocial', 'nomeFantasia', 'cnpj']}
    />
  );
}

// Componente do formulário
interface EmpresaFormProps {
  editingItem: Empresa | null;
  onSubmit: (data: EmpresaInsert) => void;
  onClose: () => void;
}

function EmpresaForm({ editingItem, onSubmit, onClose }: EmpresaFormProps) {
  const { formData, updateField, resetForm } = useFormState<EmpresaInsert>(
    editingItem ? {
      razaoSocial: editingItem.razaoSocial,
      nomeFantasia: editingItem.nomeFantasia,
      cnpj: editingItem.cnpj,
      inscricaoEstadual: editingItem.inscricaoEstadual || '',
      inscricaoMunicipal: editingItem.inscricaoMunicipal || '',
      endereco: editingItem.endereco,
      telefone: editingItem.telefone || '',
      email: editingItem.email || '',
      logoUrl: editingItem.logoUrl || '',
      isActive: editingItem.isActive
    } : initialFormState
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const updateEndereco = (field: keyof typeof formData.endereco, value: string) => {
    updateField('endereco', { ...formData.endereco, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="razaoSocial">Razão Social *</Label>
          <Input
            id="razaoSocial"
            value={formData.razaoSocial}
            onChange={(e) => updateField('razaoSocial', e.target.value)}
            placeholder="Nome completo da empresa"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="nomeFantasia">Nome Fantasia *</Label>
          <Input
            id="nomeFantasia"
            value={formData.nomeFantasia}
            onChange={(e) => updateField('nomeFantasia', e.target.value)}
            placeholder="Nome comercial"
            required
          />
        </div>
      </div>

      {/* Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => updateField('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
          <Input
            id="inscricaoEstadual"
            value={formData.inscricaoEstadual}
            onChange={(e) => updateField('inscricaoEstadual', e.target.value)}
            placeholder="000.000.000.000"
          />
        </div>

        <div>
          <Label htmlFor="inscricaoMunicipal">Inscrição Municipal</Label>
          <Input
            id="inscricaoMunicipal"
            value={formData.inscricaoMunicipal}
            onChange={(e) => updateField('inscricaoMunicipal', e.target.value)}
            placeholder="000000000"
          />
        </div>
      </div>

      {/* Endereço */}
      <fieldset className="border rounded-lg p-4">
        <legend className="text-sm font-medium px-2">Endereço</legend>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="cep">CEP *</Label>
            <Input
              id="cep"
              value={formData.endereco.cep}
              onChange={(e) => updateEndereco('cep', e.target.value)}
              placeholder="00000-000"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="logradouro">Logradouro *</Label>
            <Input
              id="logradouro"
              value={formData.endereco.logradouro}
              onChange={(e) => updateEndereco('logradouro', e.target.value)}
              placeholder="Rua, Avenida, etc."
              required
            />
          </div>

          <div>
            <Label htmlFor="estado">Estado *</Label>
            <Input
              id="estado"
              value={formData.endereco.estado}
              onChange={(e) => updateEndereco('estado', e.target.value)}
              placeholder="SP"
              maxLength={2}
              required
            />
          </div>
        </div>
        
        <div className="mt-4">
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            value={formData.endereco.cidade}
            onChange={(e) => updateEndereco('cidade', e.target.value)}
            placeholder="Nome da cidade"
            required
          />
        </div>
      </fieldset>

      {/* Contato */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={formData.telefone}
            onChange={(e) => updateField('telefone', e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>
        
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            placeholder="contato@empresa.com"
          />
        </div>
      </div>

      {/* Logo */}
      <div>
        <Label htmlFor="logoUrl">URL do Logo</Label>
        <Input
          id="logoUrl"
          value={formData.logoUrl}
          onChange={(e) => updateField('logoUrl', e.target.value)}
          placeholder="https://exemplo.com/logo.png"
        />
      </div>

      {/* Status */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ativo"
          checked={formData.isActive}
          onChange={(e) => updateField('isActive', e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <Label htmlFor="ativo">Empresa ativa</Label>
      </div>

      <FormActions
        onCancel={onClose}
        onSubmit={() => handleSubmit({} as React.FormEvent)}
        isSubmitting={false}
      />
    </form>
  );
}

// Componente do card da empresa
interface EmpresaCardProps {
  empresa: Empresa;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function EmpresaCard({ empresa, onEdit, onDelete, isDeleting }: EmpresaCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{empresa.nomeFantasia}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{empresa.razaoSocial}</p>
          </div>
          
          <CardActions
            onEdit={onEdit}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="font-medium">CNPJ:</span>
            <span className="font-mono text-xs">{empresa.cnpj}</span>
          </div>
          
          {empresa.telefone && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Telefone:</span>
              <span>{empresa.telefone}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Localização:</span>
            <span>{empresa.endereco.cidade}, {empresa.endereco.estado}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <StatusBadge isActive={empresa.isActive} />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Criado:</span>
            <span className="text-gray-500">
              {new Date(empresa.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}