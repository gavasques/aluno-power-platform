import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  User, 
  Activity, 
  Calendar, 
  Search, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Download
} from "lucide-react";
import { AdvancedSearch, SearchFilter } from "@/components/ui/advanced-search";

interface AuditLogEntry {
  id: number;
  userId: number;
  username: string;
  action: string;
  resource: string;
  resourceId?: number;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
  timestamp: Date;
  details?: string;
}

export const AuditLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);

  // Fetch actual audit log data from server
  const { data: auditLogData = [], isLoading } = useQuery<AuditLogEntry[]>({
    queryKey: ['/api/audit-logs'],
    queryFn: async () => {
      const response = await fetch('/api/audit-logs');
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      return response.json();
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  // Available filters for advanced search
  const availableFilters = [
    {
      key: 'user',
      label: 'Usuário',
      type: 'select' as const,
      options: [...new Set(auditLogData.map(log => log.username))]
        .map(user => ({ value: user, label: user }))
    },
    {
      key: 'action',
      label: 'Ação',
      type: 'select' as const,
      options: [...new Set(auditLogData.map(log => log.action))]
        .map(action => ({ value: action, label: action }))
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select' as const,
      options: [
        { value: 'success', label: 'Sucesso' },
        { value: 'failure', label: 'Falha' },
        { value: 'warning', label: 'Aviso' }
      ]
    },
    {
      key: 'resource',
      label: 'Recurso',
      type: 'select' as const,
      options: [...new Set(auditLogData.map(log => log.resource))]
        .map(resource => ({ value: resource, label: resource }))
    },
    {
      key: 'date',
      label: 'Data',
      type: 'date' as const
    }
  ];

  // Advanced search handler
  const handleAdvancedSearch = (query: string, filters: SearchFilter[]) => {
    setSearchTerm(query);
    setActiveFilters(filters);
  };

  // Filter audit logs based on search criteria
  const filteredLogs = auditLogData.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilters = activeFilters.every(filter => {
      switch (filter.key) {
        case 'user':
          return !filter.value || log.username === filter.value;
        case 'action':
          return !filter.value || log.action === filter.value;
        case 'status':
          return !filter.value || log.status === filter.value;
        case 'resource':
          return !filter.value || log.resource === filter.value;
        case 'date':
          if (!filter.value) return true;
          const filterDate = new Date(filter.value);
          const logDate = new Date(log.timestamp);
          return logDate.toDateString() === filterDate.toDateString();
        default:
          return true;
      }
    });

    return matchesSearch && matchesFilters;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Sucesso</Badge>;
      case 'failure':
        return <Badge className="bg-red-100 text-red-800">Falha</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Aviso</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Log de Auditoria</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Avançados
          </Button>
        </div>
      </div>

      {/* Search and Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Busca e Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AdvancedSearch
            placeholder="Buscar por ação, usuário, recurso ou detalhes..."
            onSearch={handleAdvancedSearch}
            availableFilters={availableFilters}
          />
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {auditLogData.filter(log => log.status === 'success').length}
              </div>
              <div className="text-xs text-green-600">Sucessos</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {auditLogData.filter(log => log.status === 'failure').length}
              </div>
              <div className="text-xs text-red-600">Falhas</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {auditLogData.filter(log => log.status === 'warning').length}
              </div>
              <div className="text-xs text-yellow-600">Avisos</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {filteredLogs.length}
              </div>
              <div className="text-xs text-blue-600">Filtrados</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Entradas do Log ({filteredLogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div key={log.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {log.action} - {log.resource}
                          {log.resourceId && (
                            <span className="text-sm text-gray-500 ml-1">#{log.resourceId}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <User className="h-3 w-3" />
                          {log.username}
                          <span className="text-gray-400">•</span>
                          <Calendar className="h-3 w-3" />
                          {new Date(log.timestamp).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    {getStatusBadge(log.status)}
                  </div>
                  
                  {log.details && (
                    <div className="text-sm text-gray-600 mb-3">
                      {log.details}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 pt-3 border-t">
                    <div>
                      <span className="font-medium">IP:</span> {log.ipAddress}
                    </div>
                    <div className="truncate">
                      <span className="font-medium">User Agent:</span> {log.userAgent.substring(0, 50)}...
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhuma entrada encontrada
                </h3>
                <p className="text-gray-500">
                  {searchTerm || activeFilters.length > 0 
                    ? "Tente ajustar os filtros de pesquisa"
                    : "Nenhuma atividade registrada no momento"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};