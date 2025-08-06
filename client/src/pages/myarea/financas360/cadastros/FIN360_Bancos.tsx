import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark, Plus } from 'lucide-react';
import { PageHeader } from '@/components/myarea/PageHeader';
import { SearchFilter } from '@/components/myarea/SearchFilter';
import { EmptyState } from '@/components/myarea/EmptyState';
import { DevelopmentBadge } from '@/components/myarea/DevelopmentBadge';

const BancosCadastro = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleNewBank = () => {
    console.log('Novo banco');
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <PageHeader
        title="Bancos"
        description="Cadastro das instituições bancárias utilizadas"
        action={{
          label: 'Novo Banco',
          onClick: handleNewBank,
          icon: Plus
        }}
      />

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Buscar por nome ou código do banco..."
      />

      <EmptyState
        icon={Landmark}
        title="Nenhum banco cadastrado"
        description="Cadastre os bancos que você utiliza para facilitar o controle das contas bancárias"
        action={{
          label: 'Cadastrar Primeiro Banco',
          onClick: handleNewBank,
          icon: Plus
        }}
        iconColor="green"
      />

      {/* Bancos Populares - Sugestão */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">Bancos Populares</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { codigo: '001', nome: 'Banco do Brasil' },
              { codigo: '104', nome: 'Caixa Econômica' },
              { codigo: '341', nome: 'Itaú' },
              { codigo: '033', nome: 'Santander' },
              { codigo: '237', nome: 'Bradesco' },
              { codigo: '260', nome: 'Nu Pagamentos' },
              { codigo: '336', nome: 'C6 Bank' },
              { codigo: '077', nome: 'Inter' }
            ].map((banco) => (
              <div key={banco.codigo} className="p-3 bg-white rounded-lg border border-blue-200 text-center">
                <div className="font-semibold text-sm">{banco.codigo}</div>
                <div className="text-xs text-muted-foreground">{banco.nome}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <DevelopmentBadge 
        module="Este módulo"
        phase="Fase 4 do projeto Finanças360"
      />
    </div>
  );
};

export default BancosCadastro;