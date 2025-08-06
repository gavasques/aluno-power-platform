import React, { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { PageHeader } from '@/components/myarea/PageHeader';
import { SearchFilter } from '@/components/myarea/SearchFilter';
import { EmptyState } from '@/components/myarea/EmptyState';
import { DevelopmentBadge } from '@/components/myarea/DevelopmentBadge';

const EmpresasCadastro = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleNewCompany = () => {
    // Implementar criação de nova empresa
    console.log('Nova empresa');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Empresas"
        description="Gerencie as empresas do seu grupo empresarial"
        action={{
          label: 'Nova Empresa',
          onClick: handleNewCompany,
          icon: Plus
        }}
      />

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por razão social, CNPJ..."
      />

      <EmptyState
        icon={Building2}
        title="Nenhuma empresa cadastrada"
        description="Comece cadastrando sua primeira empresa para organizar seu controle financeiro"
        action={{
          label: 'Cadastrar Primeira Empresa',
          onClick: handleNewCompany,
          icon: Plus
        }}
        iconColor="blue"
      />

      <DevelopmentBadge 
        module="Este módulo"
        phase="Fase 4 do projeto Finanças360"
      />
    </div>
  );
};

export default EmpresasCadastro;