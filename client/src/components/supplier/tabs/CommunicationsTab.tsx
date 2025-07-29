import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Mail, Phone, MessageSquare, Users } from "lucide-react";
import type { Communication } from '@/types/supplier';

interface CommunicationsTabProps {
  communications: Communication[];
  supplierId: number;
  onUpdate: () => void;
}

export const CommunicationsTab: React.FC<CommunicationsTabProps> = ({
  communications,
  supplierId,
  onUpdate
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'meeting': return <Users className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'phone': return 'bg-green-100 text-green-800 border-green-200';
      case 'whatsapp': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'meeting': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'received': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Comunicações</h3>
          <p className="text-sm text-gray-500">
            Histórico de comunicações com este fornecedor
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Comunicação
        </Button>
      </div>

      {communications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma comunicação registrada
            </h4>
            <p className="text-gray-500 mb-4">
              Registre comunicações para manter histórico de contatos.
            </p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primeira Comunicação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {communications.map((communication) => (
            <Card key={communication.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(communication.type)}`}>
                      {getTypeIcon(communication.type)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {communication.subject}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(communication.date).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <Badge className={getStatusColor(communication.status)}>
                    {communication.status === 'sent' && 'Enviado'}
                    {communication.status === 'received' && 'Recebido'}  
                    {communication.status === 'pending' && 'Pendente'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm text-gray-600">
                  {communication.summary}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};