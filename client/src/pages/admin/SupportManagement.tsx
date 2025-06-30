
import React, { memo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Search, 
  Filter,
  Reply,
  User,
  Calendar
} from "lucide-react";
import AdminStandardLayout, { AdminCard, AdminGrid, AdminLoader } from '@/components/layout/AdminStandardLayout';

interface Ticket {
  id: number;
  title: string;
  user: string;
  email: string;
  priority: string;
  status: string;
  created: string;
  category: string;
  description: string;
}

const SupportManagement = memo(() => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const tickets = [
    { 
      id: 1, 
      title: "Problema com importação de produtos", 
      user: "João Silva", 
      email: "joao@email.com",
      priority: "high", 
      status: "open", 
      created: "2 horas atrás",
      category: "Técnico",
      description: "Não consigo importar a planilha de produtos..."
    },
    { 
      id: 2, 
      title: "Dúvida sobre simulador de frete", 
      user: "Maria Santos", 
      email: "maria@email.com",
      priority: "medium", 
      status: "pending", 
      created: "1 dia atrás",
      category: "Dúvida",
      description: "Como usar o simulador para calcular frete internacional?"
    },
    { 
      id: 3, 
      title: "Erro ao gerar relatório", 
      user: "Pedro Costa", 
      email: "pedro@email.com",
      priority: "low", 
      status: "resolved", 
      created: "3 dias atrás",
      category: "Bug",
      description: "O relatório não está sendo gerado corretamente..."
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'low': return 'bg-green-50 text-green-700 border border-green-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'pending': return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'resolved': return 'bg-green-50 text-green-700 border border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-700 border border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <AdminStandardLayout
      title="Gestão de Suporte"
      description="Gerencie tickets e atendimento aos usuários"
    >
      <div className="mb-4 flex space-x-2">
        <Badge className={getStatusColor('open')}>
          {tickets.filter(t => t.status === 'open').length} Abertos
        </Badge>
        <Badge className={getStatusColor('pending')}>
          {tickets.filter(t => t.status === 'pending').length} Pendentes
        </Badge>
      </div>
      
      <AdminGrid columns={3} gap="md">
        {/* Lista de Tickets */}
        <div className="col-span-2">
          <AdminCard>
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-medium text-gray-700">Tickets de Suporte</h3>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-500" />
                  <Input 
                    placeholder="Buscar tickets..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button size="sm" variant="outline">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className={`p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-gray-700 truncate">{ticket.title}</h3>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                        <Badge className={getStatusColor(ticket.status)}>
                          {getStatusIcon(ticket.status)}
                          <span className="ml-1">{ticket.status}</span>
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{ticket.user}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{ticket.created}</span>
                      </span>
                      <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
                        {ticket.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AdminCard>
        </div>

        {/* Detalhes do Ticket */}
        <div>
          <AdminCard>
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-700">
                {selectedTicket ? 'Detalhes do Ticket' : 'Selecione um Ticket'}
              </h3>
            </div>
            <div className="p-4">
              {selectedTicket ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-2">{selectedTicket.title}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Usuário:</span>
                        <span className="text-gray-700">{selectedTicket.user}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Email:</span>
                        <span className="text-gray-700">{selectedTicket.email}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Criado:</span>
                        <span className="text-gray-700">{selectedTicket.created}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Categoria:</span>
                        <Badge className="bg-purple-50 text-purple-700 border border-purple-200">
                          {selectedTicket.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Descrição:</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                      {selectedTicket.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Resposta:</h4>
                    <Textarea 
                      placeholder="Digite sua resposta..."
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button className="flex-1" variant="outline">
                      <Reply className="h-4 w-4 mr-2" />
                      Responder
                    </Button>
                    <Button variant="outline">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Selecione um ticket para ver os detalhes</p>
                </div>
              )}
            </div>
          </AdminCard>
        </div>
      </AdminGrid>
    </AdminStandardLayout>
  );
});

export default SupportManagement;
