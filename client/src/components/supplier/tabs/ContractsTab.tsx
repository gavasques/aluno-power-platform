import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Calendar, DollarSign } from "lucide-react";
import type { Contract } from '@/types/supplier';

interface ContractsTabProps {
  contracts: Contract[];
  supplierId: number;
  onUpdate: () => void;
}

export const ContractsTab: React.FC<ContractsTabProps> = ({
  contracts,
  supplierId,
  onUpdate
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      case 'terminated': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho';
      case 'expired': return 'Expirado';
      case 'terminated': return 'Terminado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Contratos</h3>
          <p className="text-sm text-gray-500">
            Gerencie os contratos com este fornecedor
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Contrato
        </Button>
      </div>

      {contracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum contrato cadastrado
            </h4>
            <p className="text-gray-500 mb-4">
              Adicione contratos para gerenciar acordos com este fornecedor.
            </p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Primeiro Contrato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {contract.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1">
                      {contract.contractNumber} • {contract.contractType}
                    </p>
                  </div>
                  <Badge className={getStatusColor(contract.status)}>
                    {getStatusText(contract.status)}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {contract.startDate 
                        ? new Date(contract.startDate).toLocaleDateString('pt-BR')
                        : 'Data não definida'
                      }
                    </span>
                  </div>
                  
                  {contract.value && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" />
                      <span>
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: contract.currency || 'BRL'
                        }).format(contract.value)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{contract.documents.length} documentos</span>
                  </div>
                </div>

                {contract.description && (
                  <p className="text-sm text-gray-600 mt-3 pt-3 border-t">
                    {contract.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};