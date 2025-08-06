import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Users, 
  Mail, 
  Phone, 
  Edit, 
  Trash2, 
  Crown,
  Filter
} from 'lucide-react';
import type { SupplierContactsProps } from '../types';

/**
 * SUPPLIER CONTACTS COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para aba Contacts
 * Responsabilidade única: Exibir e gerenciar contatos do fornecedor
 */
export function SupplierContacts({ 
  contacts, 
  isLoading, 
  filters, 
  onFiltersChange, 
  onAdd, 
  onEdit, 
  onDelete 
}: SupplierContactsProps) {

  // Filter contacts based on current filters
  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = !filters.search || 
      contact.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      contact.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      contact.position.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesDepartment = !filters.department || 
      contact.department === filters.department;
    
    const matchesPrimary = filters.isPrimary === undefined || 
      contact.isPrimary === filters.isPrimary;

    return matchesSearch && matchesDepartment && matchesPrimary;
  });

  // Get unique departments for filter
  const departments = Array.from(new Set(contacts.map(c => c.department).filter(Boolean)));

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
            <Users className="w-6 h-6 mr-2" />
            Contatos ({contacts.length})
          </h2>
          <p className="text-gray-600">Gerencie os contatos do fornecedor</p>
        </div>
        <Button onClick={() => onAdd({
          name: '',
          email: '',
          phone: '',
          position: '',
          department: '',
          isPrimary: false,
          notes: ''
        })}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Contato
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
                placeholder="Buscar contatos..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ search: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* Department Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filters.department}
              onChange={(e) => onFiltersChange({ department: e.target.value })}
            >
              <option value="">Todos os departamentos</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            {/* Primary Contact Filter */}
            <select
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              value={filters.isPrimary === undefined ? '' : filters.isPrimary ? 'true' : 'false'}
              onChange={(e) => onFiltersChange({ 
                isPrimary: e.target.value === '' ? undefined : e.target.value === 'true' 
              })}
            >
              <option value="">Todos os contatos</option>
              <option value="true">Contatos principais</option>
              <option value="false">Contatos secundários</option>
            </select>

            {/* Clear Filters */}
            <Button 
              variant="outline" 
              onClick={() => onFiltersChange({ search: '', department: '', isPrimary: undefined })}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contacts List */}
      <div className="space-y-4">
        {filteredContacts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {contacts.length === 0 ? 'Nenhum contato cadastrado' : 'Nenhum contato encontrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {contacts.length === 0 
                  ? 'Comece adicionando o primeiro contato do fornecedor'
                  : 'Tente ajustar os filtros para encontrar contatos'}
              </p>
              {contacts.length === 0 && (
                <Button onClick={() => onAdd({
                  name: '',
                  email: '',
                  phone: '',
                  position: '',
                  department: '',
                  isPrimary: false,
                  notes: ''
                })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Contato
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredContacts.map((contact) => (
            <Card key={contact.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {contact.name}
                      </h3>
                      {contact.isPrimary && (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Crown className="w-3 h-3 mr-1" />
                          Principal
                        </Badge>
                      )}
                      {contact.department && (
                        <Badge variant="outline">
                          {contact.department}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="font-medium">{contact.position}</p>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {contact.email}
                          </a>
                        </div>

                        {contact.phone && (
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            <a 
                              href={`tel:${contact.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {contact.phone}
                            </a>
                          </div>
                        )}
                      </div>

                      {contact.notes && (
                        <p className="text-gray-500 mt-2 italic">
                          {contact.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(contact)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (window.confirm('Tem certeza que deseja excluir este contato?')) {
                          onDelete(contact.id);
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
      {contacts.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center space-x-4">
                <span>Total: {contacts.length}</span>
                <span>Principais: {contacts.filter(c => c.isPrimary).length}</span>
                <span>Departamentos: {departments.length}</span>
              </div>
              <div>
                Mostrando {filteredContacts.length} de {contacts.length} contatos
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}