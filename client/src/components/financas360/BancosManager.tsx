// Bancos Manager refatorado - Seguindo princípios SOLID e DRY
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Landmark } from 'lucide-react';
import { BaseManager, useFormState, CardActions, StatusBadge, FormActions } from './common/BaseManager';
import { useBancos } from '@/hooks/useFinancas360Api';
import type { Banco, BancoInsert } from '@/types/financas360';

// Estado inicial do formulário
const initialFormState: BancoInsert = {
  codigo: '',
  nome: '',
  nomeCompleto: '',
  website: '',
  isActive: true
};

export default function BancosManager() {
  const api = useBancos();

  // Adaptadores para compatibilidade de tipos
  const handleCreate = (data: BancoInsert) => {
    api.create(data);
  };

  const handleUpdate = (id: number, data: Partial<BancoInsert>) => {
    api.update({ id, data });
  };

  const handleDelete = (id: number) => {
    api.remove(id);
  };

  // Função para renderizar o formulário
  const renderForm = (editingItem: Banco | null, onSubmit: (data: BancoInsert) => void, onClose: () => void) => {
    return <BancoForm editingItem={editingItem} onSubmit={onSubmit} onClose={onClose} />;
  };

  // Função para renderizar a lista
  const renderList = (items: Banco[], onEdit: (item: Banco) => void, onDelete: (id: number) => void) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((banco) => (
          <BancoCard
            key={banco.id}
            banco={banco}
            onEdit={() => onEdit(banco)}
            onDelete={() => onDelete(banco.id)}
            isDeleting={api.isDeleting}
          />
        ))}
      </div>
    );
  };

  return (
    <BaseManager
      title="Bancos"
      icon={<Landmark className="h-6 w-6 text-blue-600" />}
      entityName="Banco"
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
      searchFields={['nome', 'codigo', 'nomeCompleto']}
    />
  );
}

// Componente do formulário
interface BancoFormProps {
  editingItem: Banco | null;
  onSubmit: (data: BancoInsert) => void;
  onClose: () => void;
}

function BancoForm({ editingItem, onSubmit, onClose }: BancoFormProps) {
  const { formData, updateField, resetForm } = useFormState<BancoInsert>(
    editingItem ? {
      codigo: editingItem.codigo,
      nome: editingItem.nome,
      nomeCompleto: editingItem.nomeCompleto,
      website: editingItem.website || '',
      isActive: editingItem.isActive
    } : initialFormState
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="codigo">Código *</Label>
          <Input
            id="codigo"
            value={formData.codigo}
            onChange={(e) => updateField('codigo', e.target.value)}
            placeholder="Ex: 001, 033, 237"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => updateField('nome', e.target.value)}
            placeholder="Ex: Banco do Brasil"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="nomeCompleto">Nome Completo *</Label>
        <Input
          id="nomeCompleto"
          value={formData.nomeCompleto}
          onChange={(e) => updateField('nomeCompleto', e.target.value)}
          placeholder="Ex: Banco do Brasil S.A."
          required
        />
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          type="url"
          value={formData.website}
          onChange={(e) => updateField('website', e.target.value)}
          placeholder="https://www.exemplo.com.br"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="ativo"
          checked={formData.isActive}
          onChange={(e) => updateField('isActive', e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <Label htmlFor="ativo">Banco ativo</Label>
      </div>

      <FormActions
        onCancel={onClose}
        onSubmit={() => handleSubmit({} as React.FormEvent)}
        isSubmitting={false}
      />
    </form>
  );
}

// Componente do card do banco
interface BancoCardProps {
  banco: Banco;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function BancoCard({ banco, onEdit, onDelete, isDeleting }: BancoCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{banco.nome}</CardTitle>
            <p className="text-sm text-gray-600 mt-1">{banco.nomeCompleto}</p>
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
            <span className="font-medium">Código:</span>
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">{banco.codigo}</span>
          </div>
          
          {banco.website && (
            <div className="flex items-center justify-between">
              <span className="font-medium">Website:</span>
              <a 
                href={banco.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline text-xs"
              >
                Visitar
              </a>
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <StatusBadge isActive={banco.isActive} />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Criado:</span>
            <span className="text-gray-500">
              {new Date(banco.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}