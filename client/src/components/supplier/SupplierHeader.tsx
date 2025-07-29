import React from 'react';
import { Link } from 'wouter';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowLeft, 
  Building2, 
  Globe, 
  Mail, 
  Phone, 
  MapPin,
  Edit,
  Star,
  TrendingUp
} from "lucide-react";
import type { Supplier } from '@/types/supplier';

interface SupplierHeaderProps {
  supplier: Supplier;
  onEdit: () => void;
}

export const SupplierHeader: React.FC<SupplierHeaderProps> = ({ 
  supplier, 
  onEdit 
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive': return 'bg-red-100 text-red-800 border-red-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'inactive': return 'Inativo';
      case 'pending': return 'Pendente';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb e Voltar */}
      <div className="flex items-center justify-between">
        <Link href="/minha-area/importacoes/fornecedores" className="inline-flex">
          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para Fornecedores
          </Button>
        </Link>
        
        <Button onClick={onEdit} className="bg-blue-600 hover:bg-blue-700">
          <Edit className="w-4 h-4 mr-2" />
          Editar Fornecedor
        </Button>
      </div>

      {/* Header Principal */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {supplier.name}
                </CardTitle>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getStatusColor(supplier.status)}>
                    {getStatusText(supplier.status)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {supplier.category}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-lg font-semibold">
                  {supplier.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {supplier.totalOrders} pedidos
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Informações de Contato */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-500" />
                Contato
              </h4>
              <div className="space-y-1">
                {supplier.email && (
                  <p className="text-sm text-gray-600">{supplier.email}</p>
                )}
                {supplier.phone && (
                  <p className="text-sm text-gray-600 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {supplier.phone}
                  </p>
                )}
                {supplier.website && (
                  <a 
                    href={supplier.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <Globe className="w-3 h-3 mr-1" />
                    Website
                  </a>
                )}
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                Localização
              </h4>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">{supplier.city}</p>
                <p className="text-sm text-gray-600">{supplier.country}</p>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-gray-500" />
                Estatísticas
              </h4>
              <div className="space-y-1">
                {supplier.establishedYear && (
                  <p className="text-sm text-gray-600">
                    Fundada em {supplier.establishedYear}
                  </p>
                )}
                <p className="text-sm text-gray-600">
                  Último contato: {new Date(supplier.lastContact).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {supplier.description && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-gray-600">{supplier.description}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};