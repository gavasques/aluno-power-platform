// Canal Manager refatorado - Seguindo princípios SOLID e DRY
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hash } from 'lucide-react';
import { BaseManager, useFormState, CardActions, StatusBadge, FormActions } from './common/BaseManager';
import { useCanais } from '@/hooks/useFinancas360Api';
import type { Canal, CanalInsert } from '@/types/financas360';
import { TIPOS_CANAL, CORES_PREDEFINIDAS, ICONES_DISPONIVEIS } from '@/types/financas360';

// Estado inicial do formulário
const initialFormState: CanalInsert = {
  nome: '',
  tipo: 'vendas',
  descricao: '',
  cor: '#3b82f6',
  icone: 'ShoppingCart',
  isActive: true
};

export default function CanaisManager() {
  const api = useCanais();

  // Adaptadores para compatibilidade de tipos
  const handleCreate = (data: CanalInsert) => {
    api.create(data);
  };

  const handleUpdate = (id: number, data: Partial<CanalInsert>) => {
    api.update({ id, data });
  };

  const handleDelete = (id: number) => {
    api.remove(id);
  };

  // Função para renderizar o formulário
  const renderForm = (editingItem: Canal | null, onSubmit: (data: CanalInsert) => void, onClose: () => void) => {
    return <CanalForm editingItem={editingItem} onSubmit={onSubmit} onClose={onClose} />;
  };

  // Função para renderizar a lista
  const renderList = (items: Canal[], onEdit: (item: Canal) => void, onDelete: (id: number) => void) => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((canal) => (
          <CanalCard
            key={canal.id}
            canal={canal}
            onEdit={() => onEdit(canal)}
            onDelete={() => onDelete(canal.id)}
            isDeleting={api.isDeleting}
          />
        ))}
      </div>
    );
  };

  return (
    <BaseManager
      title="Canais"
      icon={<Hash className="h-6 w-6 text-blue-600" />}
      entityName="Canal"
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
      searchFields={['nome', 'descricao']}
    />
  );
}

// Componente do formulário
interface CanalFormProps {
  editingItem: Canal | null;
  onSubmit: (data: CanalInsert) => void;
  onClose: () => void;
}

function CanalForm({ editingItem, onSubmit, onClose }: CanalFormProps) {
  const { formData, updateField, resetForm } = useFormState<CanalInsert>(
    editingItem ? {
      nome: editingItem.nome,
      tipo: editingItem.tipo,
      descricao: editingItem.descricao || '',
      cor: editingItem.cor,
      icone: editingItem.icone,
      isActive: editingItem.isActive
    } : initialFormState
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    resetForm();
    onClose();
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      vendas: 'Vendas',
      compras: 'Compras',
      servicos: 'Serviços'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Dados Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={formData.nome}
            onChange={(e) => updateField('nome', e.target.value)}
            placeholder="Ex: Loja Online, Marketplace, etc."
            required
          />
        </div>
        
        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value: 'vendas' | 'compras' | 'servicos') => 
              updateField('tipo', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIPOS_CANAL.map(tipo => (
                <SelectItem key={tipo} value={tipo}>
                  {getTipoLabel(tipo)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          value={formData.descricao}
          onChange={(e) => updateField('descricao', e.target.value)}
          placeholder="Descrição opcional do canal"
        />
      </div>

      {/* Cor */}
      <div>
        <Label>Cor do Canal</Label>
        <div className="flex items-center gap-3 mt-2">
          <div
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex-shrink-0"
            style={{ backgroundColor: formData.cor }}
          />
          <div className="flex flex-wrap gap-2">
            {CORES_PREDEFINIDAS.map(cor => (
              <button
                key={cor}
                type="button"
                className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                  formData.cor === cor ? 'border-gray-900' : 'border-gray-300'
                }`}
                style={{ backgroundColor: cor }}
                onClick={() => updateField('cor', cor)}
              />
            ))}
          </div>
        </div>
        <div className="mt-2">
          <Input
            type="color"
            value={formData.cor}
            onChange={(e) => updateField('cor', e.target.value)}
            className="w-20 h-10"
          />
        </div>
      </div>

      {/* Ícone */}
      <div>
        <Label htmlFor="icone">Ícone</Label>
        <Select 
          value={formData.icone} 
          onValueChange={(value) => updateField('icone', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um ícone" />
          </SelectTrigger>
          <SelectContent>
            {ICONES_DISPONIVEIS.map(icone => (
              <SelectItem key={icone.value} value={icone.value}>
                {icone.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
        <Label htmlFor="ativo">Canal ativo</Label>
      </div>

      <FormActions
        onCancel={onClose}
        onSubmit={() => handleSubmit({} as React.FormEvent)}
        isSubmitting={false}
      />
    </form>
  );
}

// Componente do card do canal
interface CanalCardProps {
  canal: Canal;
  onEdit: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function CanalCard({ canal, onEdit, onDelete, isDeleting }: CanalCardProps) {
  const getTipoLabel = (tipo: string) => {
    const tipos = {
      vendas: 'Vendas',
      compras: 'Compras',
      servicos: 'Serviços'
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: canal.cor }}
            />
            <div className="flex-1">
              <CardTitle className="text-lg">{canal.nome}</CardTitle>
              {canal.descricao && (
                <p className="text-sm text-gray-600 mt-1">{canal.descricao}</p>
              )}
            </div>
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
            <span className="font-medium">Tipo:</span>
            <span className="capitalize">{getTipoLabel(canal.tipo)}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            <StatusBadge isActive={canal.isActive} />
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Criado:</span>
            <span className="text-gray-500">
              {new Date(canal.createdAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}