import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Target, 
  CheckCircle,
  TrendingUp,
  TrendingDown,
  XCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { SOPRecommendation } from './types';

interface RecommendationsTableProps {
  recommendations: SOPRecommendation[];
}

type SortField = 'keyword' | 'campaign' | 'priority' | 'currentBid' | 'newBid' | 'clicks' | 'orders' | 'acos' | 'spend' | 'estimatedImpact';
type SortDirection = 'asc' | 'desc';

export const RecommendationsTable: React.FC<RecommendationsTableProps> = ({
  recommendations
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filtrar e ordenar dados
  const filteredAndSortedData = useMemo(() => {
    let filtered = recommendations.filter(item => {
      const matchesSearch = 
        item.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.campaign.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
      
      const matchesAction = actionFilter === 'all' || 
        (actionFilter === 'deactivate' && item.action.includes('Desativar')) ||
        (actionFilter === 'reduce' && item.action.includes('Reduzir')) ||
        (actionFilter === 'increase' && item.action.includes('Aumentar'));
      
      return matchesSearch && matchesPriority && matchesAction;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Tratamento especial para prioridade
      if (sortField === 'priority') {
        const priorityOrder = { 'Alta': 3, 'Média': 2, 'Baixa': 1 };
        aValue = priorityOrder[a.priority];
        bValue = priorityOrder[b.priority];
      }

      // Tratamento para strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [recommendations, searchTerm, priorityFilter, actionFilter, sortField, sortDirection]);

  // Paginação
  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Alta': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'Média': return <Target className="w-4 h-4 text-yellow-600" />;
      case 'Baixa': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      'Alta': 'destructive',
      'Média': 'default',
      'Baixa': 'secondary'
    };
    return variants[priority as keyof typeof variants] || 'secondary';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('Desativar')) return <XCircle className="w-4 h-4 text-red-600" />;
    if (action.includes('Reduzir')) return <TrendingDown className="w-4 h-4 text-orange-600" />;
    if (action.includes('Aumentar')) return <TrendingUp className="w-4 h-4 text-green-600" />;
    return null;
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode; className?: string }> = ({ 
    field, 
    children, 
    className = '' 
  }) => (
    <th 
      className={`cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="w-4 h-4" /> : 
            <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </th>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recomendações Detalhadas</span>
          <Badge variant="secondary">{filteredAndSortedData.length} resultados</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar keyword ou campanha..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Prioridade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as prioridades</SelectItem>
              <SelectItem value="Alta">Alta Prioridade</SelectItem>
              <SelectItem value="Média">Média Prioridade</SelectItem>
              <SelectItem value="Baixa">Baixa Prioridade</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo de ação" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as ações</SelectItem>
              <SelectItem value="deactivate">Desativações</SelectItem>
              <SelectItem value="reduce">Reduções de lance</SelectItem>
              <SelectItem value="increase">Aumentos de lance</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchTerm('');
              setPriorityFilter('all');
              setActionFilter('all');
              setCurrentPage(1);
            }}
            className="w-full"
          >
            <Filter className="w-4 h-4 mr-2" />
            Limpar Filtros
          </Button>
        </div>

        {/* Tabela */}
        <div className="rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <SortableHeader field="keyword" className="text-left p-3 font-medium">
                    Keyword
                  </SortableHeader>
                  <SortableHeader field="campaign" className="text-left p-3 font-medium">
                    Campanha
                  </SortableHeader>
                  <SortableHeader field="priority" className="text-center p-3 font-medium">
                    Prioridade
                  </SortableHeader>
                  <SortableHeader field="currentBid" className="text-right p-3 font-medium">
                    Lance Atual
                  </SortableHeader>
                  <SortableHeader field="newBid" className="text-right p-3 font-medium">
                    Novo Lance
                  </SortableHeader>
                  <SortableHeader field="clicks" className="text-right p-3 font-medium">
                    Cliques
                  </SortableHeader>
                  <SortableHeader field="orders" className="text-right p-3 font-medium">
                    Pedidos
                  </SortableHeader>
                  <SortableHeader field="acos" className="text-right p-3 font-medium">
                    ACoS
                  </SortableHeader>
                  <SortableHeader field="estimatedImpact" className="text-right p-3 font-medium">
                    Impacto Est.
                  </SortableHeader>
                  <th className="text-left p-3 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium max-w-xs truncate" title={item.keyword}>
                      {item.keyword}
                    </td>
                    <td className="p-3 text-gray-600 max-w-xs truncate" title={item.campaign}>
                      {item.campaign}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getPriorityIcon(item.priority)}
                        <Badge variant={getPriorityBadge(item.priority) as any} className="text-xs">
                          {item.priority}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      R$ {item.currentBid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right">
                      <span className={
                        item.newBid > item.currentBid ? 'text-green-600 font-medium' :
                        item.newBid < item.currentBid ? 'text-red-600 font-medium' :
                        'text-gray-600'
                      }>
                        {item.action.includes('Desativar') ? 
                          '−' : 
                          `R$ ${item.newBid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        }
                      </span>
                    </td>
                    <td className="p-3 text-right">{item.clicks}</td>
                    <td className="p-3 text-right">{item.orders}</td>
                    <td className="p-3 text-right">
                      <span className={item.acos >= 0.5 ? 'text-red-600 font-medium' : ''}>
                        {(item.acos * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className={
                        item.estimatedImpact > 0 ? 'text-green-600' : 'text-red-600'
                      }>
                        R$ {Math.abs(item.estimatedImpact).toLocaleString('pt-BR')}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-xs">
                        {getActionIcon(item.action)}
                        <span className="max-w-20 truncate" title={item.action}>
                          {item.action}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)} de {filteredAndSortedData.length} resultados
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}

        {filteredAndSortedData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma recomendação encontrada com os filtros aplicados</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};