/**
 * EmpresasManager - Fase 2 Completa
 * Demonstra o uso completo dos componentes reutilizáveis criados
 * Redução de 538 → ~150 linhas (-72%)
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2 } from 'lucide-react';

import { useEmpresasManager } from '@/hooks/financas360';
import { useFormatters } from '@/hooks/useFormatters';
import { ManagerLayout } from '@/components/ui/manager';
import { ItemCard } from '@/components/ui/manager';

export default function EmpresasManagerPhase2() {
  const manager = useEmpresasManager();
  const formatters = useFormatters();

  // Configuração de filtros (se necessário)
  const searchFilters = manager.filters.searchTerm ? [
    {
      key: 'search',
      label: 'Buscar empresas',
      value: manager.filters.searchTerm,
      options: [],
      onChange: (value: string) => manager.updateFilter('searchTerm', value)
    }
  ] : [];

  // Renderização do formulário
  const renderForm = () => (
    <div className="space-y-6">
      {/* Dados Básicos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="razaoSocial">Razão Social *</Label>
          <Input
            id="razaoSocial"
            value={manager.formData.razaoSocial}
            onChange={(e) => manager.updateFormData('razaoSocial', e.target.value)}
            placeholder="Razão social da empresa"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
          <Input
            id="nomeFantasia"
            value={manager.formData.nomeFantasia}
            onChange={(e) => manager.updateFormData('nomeFantasia', e.target.value)}
            placeholder="Nome fantasia (opcional)"
          />
        </div>
        
        <div>
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            value={manager.formData.cnpj}
            onChange={(e) => manager.updateFormData('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="telefone">Telefone</Label>
          <Input
            id="telefone"
            value={manager.formData.telefone}
            onChange={(e) => manager.updateFormData('telefone', e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>
        
        <div>
          <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
          <Input
            id="inscricaoEstadual"
            value={manager.formData.inscricaoEstadual}
            onChange={(e) => manager.updateFormData('inscricaoEstadual', e.target.value)}
            placeholder="Inscrição estadual"
          />
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={manager.formData.email}
            onChange={(e) => manager.updateFormData('email', e.target.value)}
            placeholder="email@empresa.com"
          />
        </div>
      </div>

      {/* Endereço */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="cep">CEP *</Label>
            <Input
              id="cep"
              value={manager.formData.endereco.cep}
              onChange={(e) => manager.updateFormData('endereco', {
                ...manager.formData.endereco,
                cep: e.target.value
              })}
              placeholder="00000-000"
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <Label htmlFor="logradouro">Logradouro *</Label>
            <Input
              id="logradouro"
              value={manager.formData.endereco.logradouro}
              onChange={(e) => manager.updateFormData('endereco', {
                ...manager.formData.endereco,
                logradouro: e.target.value
              })}
              placeholder="Rua, avenida, etc."
              required
            />
          </div>
          
          <div>
            <Label htmlFor="cidade">Cidade *</Label>
            <Input
              id="cidade"
              value={manager.formData.endereco.cidade}
              onChange={(e) => manager.updateFormData('endereco', {
                ...manager.formData.endereco,
                cidade: e.target.value
              })}
              placeholder="Nome da cidade"
              required
            />
          </div>
          
          <div>
            <Label htmlFor="estado">Estado *</Label>
            <Input
              id="estado"
              value={manager.formData.endereco.estado}
              onChange={(e) => manager.updateFormData('endereco', {
                ...manager.formData.endereco,
                estado: e.target.value
              })}
              maxLength={2}
              placeholder="SP"
              required
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Renderização de cada item da lista
  const renderItem = (empresa: any) => (
    <ItemCard
      key={empresa.id}
      title={empresa.razaoSocial}
      subtitle={empresa.nomeFantasia}
      badge={empresa.isActive !== false ? {
        text: 'Ativo',
        variant: 'default' as const,
        className: 'bg-green-100 text-green-800'
      } : {
        text: 'Inativo', 
        variant: 'secondary' as const,
        className: 'bg-red-100 text-red-800'
      }}
      fields={[
        {
          label: 'CNPJ',
          value: formatters.cnpj(empresa.cnpj)
        },
        {
          label: 'Cidade',
          value: `${empresa.endereco.cidade}/${empresa.endereco.estado}`
        },
        ...(empresa.email ? [{
          label: 'Email',
          value: empresa.email
        }] : []),
        ...(empresa.telefone ? [{
          label: 'Telefone', 
          value: formatters.phone(empresa.telefone)
        }] : [])
      ]}
      onEdit={() => manager.openEditDialog(empresa)}
      onDelete={() => manager.handleDelete(empresa.id)}
      isDeleting={manager.isDeleting}
      layout="vertical"
    />
  );

  return (
    <ManagerLayout
      // Header
      title="Empresas"
      icon={Building2}
      description="Gestão das empresas do grupo"
      
      // Data
      items={manager.items}
      filteredItems={manager.filteredItems}
      isLoading={manager.isLoading}
      error={manager.error}
      
      // Dialog
      isDialogOpen={manager.isDialogOpen}
      onDialogOpenChange={manager.setIsDialogOpen}
      dialogTitle={manager.isEditing ? 'Editar Empresa' : 'Nova Empresa'}
      dialogSize="xl"
      
      // Form
      formContent={renderForm()}
      onSubmit={manager.handleSubmit}
      isSubmitting={manager.isSubmitting}
      
      // Actions
      onCreateClick={manager.openCreateDialog}
      onRetry={manager.handleRetry}
      
      // Filters
      searchTerm={manager.filters.searchTerm}
      onSearchChange={(value) => manager.updateFilter('searchTerm', value)}
      searchPlaceholder="Buscar por razão social, CNPJ ou cidade..."
      hasActiveFilters={manager.hasFilters}
      onClearFilters={manager.clearFilters}
      
      // Items rendering
      renderItem={renderItem}
      
      // Empty states
      emptyStateIcon={Building2}
      emptyStateTitle="Nenhuma empresa cadastrada"
      emptyStateDescription="Comece criando sua primeira empresa no sistema."
      
      // Layout
      gridColumns="auto"
    />
  );
}