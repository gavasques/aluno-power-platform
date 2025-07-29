import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  FileText, 
  Download, 
  Trash2, 
  Filter,
  Upload,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import type { SupplierDocumentsProps } from '../types';
import { DOCUMENT_TYPES } from '../types';

/**
 * SUPPLIER DOCUMENTS COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para aba Documents
 * Responsabilidade única: Exibir e gerenciar documentos do fornecedor
 */
export function SupplierDocuments({ 
  documents, 
  isLoading, 
  filters, 
  onFiltersChange, 
  onUpload, 
  onDelete 
}: SupplierDocumentsProps) {

  // Filter documents based on current filters
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = !filters.search || 
      doc.name.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = !filters.type || doc.type === filters.type;
    const matchesStatus = !filters.status || doc.status === filters.status;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending_renewal': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'expired': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'pending_renewal': return <Calendar className="w-4 h-4 text-yellow-600" />;
      default: return <FileText className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeIcon = (type: string) => {
    return <FileText className="w-4 h-4" />;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
            Documentos ({documents.length})
          </h2>
          <p className="text-gray-600">Gerencie documentos e certificações do fornecedor</p>
        </div>
        <Button onClick={() => onUpload({
          name: '',
          type: 'other',
          file: new File([], ''),
          notes: ''
        })}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Documento
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
                placeholder="Buscar documentos..."
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
              {DOCUMENT_TYPES.map(type => (
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
              <option value="valid">Válido</option>
              <option value="expired">Expirado</option>
              <option value="pending_renewal">Renovação Pendente</option>
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

      {/* Documents List */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {documents.length === 0 ? 'Nenhum documento cadastrado' : 'Nenhum documento encontrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {documents.length === 0 
                  ? 'Faça upload dos primeiros documentos do fornecedor'
                  : 'Tente ajustar os filtros para encontrar documentos'}
              </p>
              {documents.length === 0 && (
                <Button onClick={() => onUpload({
                  name: '',
                  type: 'other',
                  file: new File([], ''),
                  notes: ''
                })}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Primeiro Documento
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((document) => (
              <Card key={document.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  {/* Document Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(document.type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {document.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {document.type.charAt(0).toUpperCase() + document.type.slice(1)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(document.status)}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <Badge className={getStatusColor(document.status)}>
                      {document.status === 'valid' && 'Válido'}
                      {document.status === 'expired' && 'Expirado'}
                      {document.status === 'pending_renewal' && 'Renovação Pendente'}
                    </Badge>
                  </div>

                  {/* Document Info */}
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex justify-between">
                      <span>Upload:</span>
                      <span>{format(new Date(document.uploadedAt), 'dd/MM/yyyy')}</span>
                    </div>
                    
                    {document.expiryDate && (
                      <div className="flex justify-between">
                        <span>Vencimento:</span>
                        <span className={new Date(document.expiryDate) < new Date() ? 'text-red-600' : ''}>
                          {format(new Date(document.expiryDate), 'dd/MM/yyyy')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  {document.notes && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        {document.notes.length > 80 
                          ? `${document.notes.substring(0, 80)}...` 
                          : document.notes}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(document.fileUrl, '_blank')}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const link = globalThis.document.createElement('a');
                          link.href = document.fileUrl;
                          link.download = document.name;
                          link.click();
                        }}
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir este documento?')) {
                          onDelete(document.id);
                        }
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {documents.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {documents.filter(d => d.status === 'valid').length}
                </div>
                <div className="text-xs text-gray-600">Válidos</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">
                  {documents.filter(d => d.status === 'pending_renewal').length}
                </div>
                <div className="text-xs text-gray-600">Renovação</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {documents.filter(d => d.status === 'expired').length}
                </div>
                <div className="text-xs text-gray-600">Expirados</div>
              </div>
              <div>
                <div className="text-lg text-gray-600">
                  {filteredDocuments.length}/{documents.length}
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