/**
 * PRESENTATION: ContasBancariasPresentation
 * Pure UI component for bank accounts management functionality
 * Extracted from ContasBancariasManager.tsx (666 lines) for modularization
 */
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { CreditCard, Plus, Search, Filter } from 'lucide-react';
import type { ContasBancariasState, ContasBancariasActions } from './types';

interface ContasBancariasPresentationProps {
  state: ContasBancariasState;
  actions: ContasBancariasActions;
  isSaving: boolean;
  isDeleting: boolean;
}

export const ContasBancariasPresentation = memo<ContasBancariasPresentationProps>(({
  state,
  actions,
  isSaving,
  isDeleting
}) => {
  if (state.loading) {
    return <LoadingSpinner message="Carregando contas bancárias..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6" />
            Contas Bancárias
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas contas bancárias e chaves PIX
          </p>
        </div>
        <Button onClick={actions.startCreating}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por banco, titular ou conta..."
                  value={state.searchTerm}
                  onChange={(e) => actions.searchContas(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button variant="outline" size="sm" onClick={actions.toggleShowInactive}>
              <Filter className="w-4 h-4 mr-2" />
              {state.showInactive ? 'Ocultar Inativas' : 'Mostrar Inativas'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Accounts Grid */}
      {state.error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600">{state.error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.filteredContas.map((conta) => (
          <Card key={conta.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{conta.banco}</CardTitle>
                <div className="flex gap-1">
                  {conta.ativo && (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Ativa
                    </Badge>
                  )}
                  {conta.pixChaves?.length > 0 && (
                    <Badge variant="outline">
                      PIX
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Titular</p>
                <p className="font-medium">{conta.titular}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Agência</p>
                  <p className="font-mono">{conta.agencia}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conta</p>
                  <p className="font-mono">{conta.conta}-{conta.digito}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Saldo Atual</p>
                <p className="text-lg font-bold text-green-600">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(conta.saldoAtual)}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => actions.startEditing(conta)}
                  className="flex-1"
                >
                  Editar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => actions.selectConta(conta)}
                  className="flex-1"
                >
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {state.filteredContas.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma conta encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {state.searchTerm 
                ? 'Nenhuma conta corresponde aos filtros aplicados.'
                : 'Adicione sua primeira conta bancária para começar.'
              }
            </p>
            {!state.searchTerm && (
              <Button onClick={actions.startCreating}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form/Details modals would go here in a real implementation */}
      {(state.isCreating || state.isEditing) && (
        <Card className="border-2 border-blue-200">
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Formulário de conta bancária em desenvolvimento...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
});