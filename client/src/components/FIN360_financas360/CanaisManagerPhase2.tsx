/**
 * CanaisManager - Fase 2 Completa
 * Exemplo de como criar managers com os componentes reutilizáveis
 * Redução de ~500 → ~100 linhas (-80%)
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Hash } from 'lucide-react';

import { useCanaisManager } from '@/hooks/financas360';
import { useFormatters } from '@/hooks/useFormatters';
import { ManagerLayout } from '@/components/ui/manager';
import { ItemCard } from '@/components/ui/manager';

const CORES_PREDEFINIDAS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

export default function CanaisManagerPhase2() {
  const manager = useCanaisManager();
  const formatters = useFormatters();

  // Configuração de filtros
  const filters = [
    {
      key: 'tipo',
      label: 'Tipo',
      value: manager.filters.typeFilter || 'all',
      options: [
        { value: 'all', label: 'Todos os Tipos' },
        { value: 'vendas', label: 'Vendas' },
        { value: 'compras', label: 'Compras' },
        { value: 'servicos', label: 'Serviços' }
      ],
      onChange: (value: string) => manager.updateFilter('typeFilter', value)
    }
  ];

  // Renderização do formulário
  const renderForm = () => (
    <div className="space-y-6">
      {/* Dados Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input
            id="nome"
            value={manager.formData.nome}
            onChange={(e) => manager.updateFormData('nome', e.target.value)}
            placeholder="Ex: Loja Online, Marketplace, etc."
            required
          />
        </div>
        
        <div>
          <Label htmlFor="tipo">Tipo *</Label>
          <Select
            value={manager.formData.tipo}
            onValueChange={(value: 'vendas' | 'compras' | 'servicos') => 
              manager.updateFormData('tipo', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="vendas">Vendas</SelectItem>
              <SelectItem value="compras">Compras</SelectItem>
              <SelectItem value="servicos">Serviços</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          value={manager.formData.descricao}
          onChange={(e) => manager.updateFormData('descricao', e.target.value)}
          placeholder="Descrição opcional do canal"
        />
      </div>

      {/* Cor */}
      <div>
        <Label>Cor do Canal</Label>
        <div className="flex items-center gap-3 mt-2">
          <div
            className="w-10 h-10 rounded-lg border-2 border-gray-300 flex-shrink-0"
            style={{ backgroundColor: manager.formData.cor }}
          />
          <div className="flex flex-wrap gap-2">
            {CORES_PREDEFINIDAS.map(cor => (
              <button
                key={cor}
                type="button"
                className={`w-8 h-8 rounded-lg border-2 transition-transform hover:scale-110 ${
                  manager.formData.cor === cor ? 'border-gray-900' : 'border-gray-300'
                }`}
                style={{ backgroundColor: cor }}
                onClick={() => manager.updateFormData('cor', cor)}
              />
            ))}
          </div>
        </div>
        <div className="mt-2">
          <Input
            type="color"
            value={manager.formData.cor}
            onChange={(e) => manager.updateFormData('cor', e.target.value)}
            className="w-20 h-10"
          />
        </div>
      </div>

      {/* Ícone */}
      <div>
        <Label htmlFor="icone">Ícone</Label>
        <Select 
          value={manager.formData.icone} 
          onValueChange={(value) => manager.updateFormData('icone', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um ícone" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ShoppingCart">🛒 Carrinho</SelectItem>
            <SelectItem value="Store">🏪 Loja</SelectItem>
            <SelectItem value="Package">📦 Pacote</SelectItem>
            <SelectItem value="Settings">⚙️ Configurações</SelectItem>
            <SelectItem value="Users">👥 Usuários</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  // Renderização de cada item
  const renderItem = (canal: any) => (
    <ItemCard
      key={canal.id}
      title={canal.nome}
      subtitle={canal.descricao}
      badge={{
        text: formatters.tipo(canal.tipo),
        variant: 'outline' as const
      }}
      fields={[
        {
          label: 'Status',
          value: (
            <span className={`px-2 py-1 rounded-full text-xs ${
              canal.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {canal.isActive ? 'Ativo' : 'Inativo'}
            </span>
          )
        },
        {
          label: 'Cor',
          value: (
            <div className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded border" 
                style={{ backgroundColor: canal.cor }}
              />
              <span className="text-xs text-gray-500">{canal.cor}</span>
            </div>
          )
        }
      ]}
      onEdit={() => manager.openEditDialog(canal)}
      onDelete={() => manager.handleDelete(canal.id)}
      isDeleting={manager.isDeleting}
    />
  );

  return (
    <ManagerLayout
      title="Canais"
      icon={Hash}
      description="Canais de vendas, compras e serviços"
      items={manager.items}
      filteredItems={manager.filteredItems}
      isLoading={manager.isLoading}
      error={manager.error}
      isDialogOpen={manager.isDialogOpen}
      onDialogOpenChange={manager.setIsDialogOpen}
      dialogTitle={manager.isEditing ? 'Editar Canal' : 'Novo Canal'}
      dialogSize="lg"
      formContent={renderForm()}
      onSubmit={manager.handleSubmit}
      isSubmitting={manager.isSubmitting}
      onCreateClick={manager.openCreateDialog}
      onRetry={manager.handleRetry}
      searchTerm={manager.filters.searchTerm}
      onSearchChange={(value) => manager.updateFilter('searchTerm', value)}
      searchPlaceholder="Buscar canais..."
      filters={filters}
      hasActiveFilters={manager.hasFilters}
      onClearFilters={manager.clearFilters}
      renderItem={renderItem}
      emptyStateIcon={Hash}
      gridColumns="auto"
    />
  );
}