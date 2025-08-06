import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  MessageSquare, 
  Mail, 
  Phone, 
  Users, 
  FileText, 
  Trash2, 
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import type { SupplierCommunicationsProps } from '../types';
import { COMMUNICATION_TYPES } from '../types';

/**
 * SUPPLIER COMMUNICATIONS COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para aba Communications
 * Responsabilidade única: Exibir e gerenciar comunicações com o fornecedor
 */
export function SupplierCommunications({ 
  communications, 
  isLoading, 
  filters, 
  onFiltersChange, 
  onAdd, 
  onDelete 
}: SupplierCommunicationsProps) {

  // Filter communications based on current filters
  const filteredCommunications = communications.filter(comm => {
    const matchesSearch = !filters.search || 
      comm.subject.toLowerCase().includes(filters.search.toLowerCase()) ||
      comm.content.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = !filters.type || comm.type === filters.type;
    const matchesDirection = !filters.direction || comm.direction === filters.direction;

    // Date range filter
    let matchesDate = true;
    if (filters.dateRange && filters.dateRange.length === 2) {
      const commDate = new Date(comm.timestamp);
      const startDate = new Date(filters.dateRange[0]);
      const endDate = new Date(filters.dateRange[1]);
      matchesDate = commDate >= startDate && commDate <= endDate;
    }

    return matchesSearch && matchesType && matchesDirection && matchesDate;
  });

  // Sort by timestamp (newest first)
  const sortedCommunications = filteredCommunications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      case 'note': return <FileText className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getDirectionIcon = (direction: string) => {
    return direction === 'outbound' ? (
      <ArrowUpRight className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDownLeft className="w-4 h-4 text-green-600" />
    );
  };

  const getDirectionColor = (direction: string) => {
    return direction === 'outbound' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-purple-100 text-purple-800';
      case 'replied': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            <MessageSquare className="w-6 h-6 mr-2" />
            Comunicações ({communications.length})
          </h2>
          <p className="text-gray-600">Histórico de comunicações com o fornecedor</p>
        </div>
        <Button onClick={() => onAdd({
          type: 'email',
          subject: '',
          content: '',
          direction: 'outbound',
          attachments: []
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Comunicação
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar comunicações..."
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
              {COMMUNICATION_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Direction Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filters.direction}
              onChange={(e) => onFiltersChange({ direction: e.target.value })}
            >
              <option value="">Todas as direções</option>
              <option value="inbound">Recebidas</option>
              <option value="outbound">Enviadas</option>
            </select>

            {/* Date Range - Simplified */}
            <Input
              type="date"
              placeholder="Data inicial"
              onChange={(e) => {
                const currentRange = filters.dateRange || ['', ''];
                onFiltersChange({ 
                  dateRange: [e.target.value, currentRange[1]] as [string, string]
                });
              }}
            />

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => onFiltersChange({ 
                search: '', 
                type: '', 
                direction: '', 
                dateRange: undefined 
              })}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Communications Timeline */}
      <div className="space-y-4">
        {sortedCommunications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {communications.length === 0 ? 'Nenhuma comunicação registrada' : 'Nenhuma comunicação encontrada'}
              </h3>
              <p className="text-gray-600 mb-4">
                {communications.length === 0 
                  ? 'Registre a primeira comunicação com o fornecedor'
                  : 'Tente ajustar os filtros para encontrar comunicações'}
              </p>
              {communications.length === 0 && (
                <Button onClick={() => onAdd({
                  type: 'email',
                  subject: '',
                  content: '',
                  direction: 'outbound',
                  attachments: []
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Registrar Primeira Comunicação
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedCommunications.map((communication) => (
              <Card key={communication.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(communication.type)}
                          <h3 className="text-lg font-semibold text-gray-900">
                            {communication.subject}
                          </h3>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getDirectionIcon(communication.direction)}
                          <Badge className={getDirectionColor(communication.direction)}>
                            {communication.direction === 'outbound' ? 'Enviada' : 'Recebida'}
                          </Badge>
                          <Badge variant="outline">
                            {communication.type.charAt(0).toUpperCase() + communication.type.slice(1)}
                          </Badge>
                          <Badge className={getStatusColor(communication.status)}>
                            {communication.status.charAt(0).toUpperCase() + communication.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="mb-4">
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {communication.content.length > 200 
                            ? `${communication.content.substring(0, 200)}...` 
                            : communication.content}
                        </p>
                      </div>

                      {/* Attachments */}
                      {communication.attachments && communication.attachments.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FileText className="w-4 h-4" />
                            <span>{communication.attachments.length} anexo(s)</span>
                          </div>
                        </div>
                      )}

                      {/* Timestamp and Contact */}
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{format(new Date(communication.timestamp), 'dd/MM/yyyy HH:mm')}</span>
                          </div>
                          {communication.contactId && (
                            <div className="flex items-center space-x-1">
                              <Users className="w-4 h-4" />
                              <span>Contato associado</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja excluir esta comunicação?')) {
                            onDelete(communication.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {communications.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{communications.length}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {communications.filter(c => c.direction === 'outbound').length}
                </div>
                <div className="text-xs text-gray-600">Enviadas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {communications.filter(c => c.direction === 'inbound').length}
                </div>
                <div className="text-xs text-gray-600">Recebidas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {communications.filter(c => c.type === 'email').length}
                </div>
                <div className="text-xs text-gray-600">Emails</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {communications.filter(c => c.type === 'whatsapp').length}
                </div>
                <div className="text-xs text-gray-600">WhatsApp</div>
              </div>
              <div>
                <div className="text-lg text-gray-600">
                  {sortedCommunications.length}/{communications.length}
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