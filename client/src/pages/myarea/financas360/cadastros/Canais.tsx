import React, { useState } from 'react';
import { Palette, Plus } from 'lucide-react';
import { PageHeader } from '@/components/myarea/PageHeader';
import { SearchFilter } from '@/components/myarea/SearchFilter';
import { EmptyState } from '@/components/myarea/EmptyState';
import { DevelopmentBadge } from '@/components/myarea/DevelopmentBadge';

const CanaisCadastro = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const handleNewChannel = () => {
    console.log('Novo canal');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Canais"
        description="Configure os canais de vendas, compras e serviços"
        action={{
          label: 'Novo Canal',
          onClick: handleNewChannel,
          icon: Plus
        }}
      />

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nome do canal..."
        filters={[
          {
            value: typeFilter,
            onChange: setTypeFilter,
            placeholder: 'Todos os tipos',
            options: [
              { value: '', label: 'Todos os tipos' },
              { value: 'vendas', label: 'Vendas' },
              { value: 'compras', label: 'Compras' },
              { value: 'servicos', label: 'Serviços' }
            ]
          }
        ]}
      />

      <EmptyState
        icon={Palette}
        title="Nenhum canal cadastrado"
        description="Configure seus canais de vendas (Amazon, ML), compras e serviços para organizar suas operações"
        action={{
          label: 'Cadastrar Primeiro Canal',
          onClick: handleNewChannel,
          icon: Plus
        }}
        iconColor="purple"
      />

      <DevelopmentBadge 
        module="Este módulo"
        phase="Fase 4 do projeto Finanças360"
      />
    </div>
  );
};

export default CanaisCadastro;