import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Calendar, 
  DollarSign, 
  Edit, 
  Trash2, 
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import type { SupplierContractsProps } from '../types';
import { CONTRACT_TYPES, CONTRACT_STATUSES } from '../types';

/**
 * SUPPLIER CONTRACTS COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para aba Contracts
 * Responsabilidade única: Exibir e gerenciar contratos do fornecedor
 */
export function SupplierContracts({ 
  contracts, 
  isLoading, 
  filters, 
  onFiltersChange, 
  onAdd, 
  onEdit, 
  onDelete 
}: SupplierContractsProps) {

  // Filter contracts based on current filters
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = !filters.search || 
      contract.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      contract.terms.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = !filters.type || contract.type === filters.type;
    const matchesStatus = !filters.status || contract.status === filters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'terminated': return <XCircle className="w-4 h-4 text-gray-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Contratos ({contracts.length})
          </h2>
          <p className="text-gray-600">Gerencie os contratos comerciais com o fornecedor</p>
        </div>
        <Button onClick={() => onAdd({
          title: '',
          type: 'supply',
          status: 'draft',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          value: 0,
          currency: 'USD',
          terms: '',
          clauses: []
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar contratos..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Type Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filters.type}
              onChange={(e) => onFiltersChange({ type: e.target.value })}
            >
              <option value="">Todos os tipos</option>
              {CONTRACT_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filters.status}
              onChange={(e) => onFiltersChange({ status: e.target.value })}
            >
              <option value="">Todos os status</option>
              {CONTRACT_STATUSES.map(status => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => onFiltersChange({ search: '', type: '', status: '' })}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredContracts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {contracts.length === 0 ? 'Nenhum contrato cadastrado' : 'Nenhum contrato encontrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {contracts.length === 0 
                  ? 'Comece criando o primeiro contrato com o fornecedor'
                  : 'Tente ajustar os filtros para encontrar contratos'}
              </p>
              {contracts.length === 0 && (
                <Button onClick={() => onAdd({
                  title: '',
                  type: 'supply',
                  status: 'draft',
                  startDate: new Date().toISOString().split('T')[0],
                  endDate: '',
                  value: 0,
                  currency: 'USD',
                  terms: '',
                  clauses: []
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Contrato
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredContracts.map((contract) => (
            <Card key={contract.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contract.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(contract.status)}
                        <Badge className={getStatusColor(contract.status)}>
                          {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                        </Badge>
                        <Badge variant="outline">
                          {contract.type.charAt(0).toUpperCase() + contract.type.slice(1)}
                        </Badge>
                      </div>
                    </div>

                    {/* Contract Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      {/* Dates */}
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <div>
                          <div>Início: {format(new Date(contract.startDate), 'dd/MM/yyyy')}</div>
                          {contract.endDate && (
                            <div>Fim: {format(new Date(contract.endDate), 'dd/MM/yyyy')}</div>
                          )}
                        </div>
                      </div>

                      {/* Value */}
                      {contract.value && (
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {formatCurrency(contract.value, contract.currency)}
                            </div>
                            <div>Valor do contrato</div>
                          </div>
                        </div>
                      )}

                      {/* Documents */}
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="w-4 h-4 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {contract.documents?.length || 0} documentos
                          </div>
                          <div>{contract.clauses.length} cláusulas</div>
                        </div>
                      </div>
                    </div>

                    {/* Terms Preview */}
                    {contract.terms && (
                      <div className="bg-gray-50 p-3 rounded-md mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">Termos:</h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {contract.terms.length > 150 
                            ? `${contract.terms.substring(0, 150)}...` 
                            : contract.terms}
                        </p>
                      </div>
                    )}

                    {/* Key Clauses */}
                    {contract.clauses.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Principais Cláusulas:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {contract.clauses.slice(0, 3).map((clause) => (
                            <Badge key={clause.id} variant="outline" className="text-xs">
                              {clause.title}
                            </Badge>
                          ))}
                          {contract.clauses.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{contract.clauses.length - 3} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div className="text-xs text-gray-500">
                      Criado em {format(new Date(contract.createdAt), 'dd/MM/yyyy HH:mm')}
                      {contract.updatedAt !== contract.createdAt && (
                        <span> • Atualizado em {format(new Date(contract.updatedAt), 'dd/MM/yyyy HH:mm')}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(contract)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
                          onDelete(contract.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary */}
      {contracts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{contracts.length}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {contracts.filter(c => c.status === 'active').length}
                </div>
                <div className="text-xs text-gray-600">Ativos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {contracts.filter(c => c.status === 'pending').length}
                </div>
                <div className="text-xs text-gray-600">Pendentes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {contracts.filter(c => c.status === 'expired').length}
                </div>
                <div className="text-xs text-gray-600">Expirados</div>
              </div>
              <div>
                <div className="text-lg text-gray-600">
                  {filteredContracts.length}/{contracts.length}
                </div>
                <div className="text-xs text-gray-600">Mostrando</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}