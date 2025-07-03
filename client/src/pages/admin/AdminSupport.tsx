import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Filter, Eye, MessageCircle, User, Calendar, Tag, AlertCircle, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SupportStats {
  total: number;
  open: number;
  resolved: number;
  urgent: number;
}

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: number;
    name: string;
    email: string;
  } | null;
  messages: Array<{
    id: number;
    message: string;
    isStaffReply: boolean;
    createdAt: string;
    user: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}

const AdminSupport = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch support stats
  const { data: stats } = useQuery<SupportStats>({
    queryKey: ['/api/support/stats'],
  });

  // Fetch all support tickets with filters
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets', { status: statusFilter, priority: priorityFilter, search: searchTerm }],
  });

  // Update ticket mutation
  const updateTicketMutation = useMutation({
    mutationFn: async ({ ticketId, data }: { ticketId: number; data: any }) => {
      const { apiRequest } = await import('@/lib/queryClient');
      return apiRequest(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      queryClient.invalidateQueries({ queryKey: ['/api/support/stats'] });
      toast({
        title: 'Ticket atualizado!',
        description: 'As alterações foram salvas com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar ticket',
        description: 'Não foi possível atualizar o ticket. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: number; message: string }) => {
      const { apiRequest } = await import('@/lib/queryClient');
      return apiRequest(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      setNewMessage('');
      toast({
        title: 'Mensagem enviada!',
        description: 'Sua resposta foi adicionada ao ticket.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800';
      case 'waiting_response': return 'bg-orange-100 text-orange-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in_progress': return 'Em Andamento';
      case 'waiting_response': return 'Aguardando Resposta';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'Urgente';
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <AlertCircle className="h-4 w-4" />;
      case 'waiting_response': return <MessageCircle className="h-4 w-4" />;
      case 'resolved': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administração de Suporte</h1>
          <p className="text-gray-600 mt-2">Gerencie todos os tickets de suporte da plataforma</p>
        </div>

        {/* Estatísticas */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Tickets</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Tickets Abertos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Resolvidos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Urgentes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Tickets */}
          <div className="lg:col-span-2 space-y-6">
            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Buscar tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="waiting_response">Aguardando Resposta</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Prioridade</Label>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Tickets */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Carregando tickets...</p>
                </div>
              ) : tickets.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-8">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum ticket encontrado</h3>
                    <p className="text-gray-600">Não há tickets que correspondam aos filtros aplicados.</p>
                  </CardContent>
                </Card>
              ) : (
                tickets.map((ticket) => (
                  <Card 
                    key={ticket.id} 
                    className={`cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'}`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(ticket.status)}
                            <CardTitle className="text-lg">{ticket.title}</CardTitle>
                          </div>
                          <CardDescription className="text-sm text-gray-600">
                            Ticket #{ticket.id} • {ticket.user.name} • {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {getPriorityText(ticket.priority)}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {getStatusText(ticket.status)}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">{ticket.description}</p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {ticket.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {ticket.user.email}
                          </span>
                          {ticket.messages.length > 0 && (
                            <span className="flex items-center gap-1">
                              <MessageCircle className="h-3 w-3" />
                              {ticket.messages.length} mensagem{ticket.messages.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(ticket.updatedAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* Detalhes do Ticket */}
          <div className="lg:col-span-1">
            {selectedTicket ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{selectedTicket.title}</CardTitle>
                      <CardDescription>Ticket #{selectedTicket.id}</CardDescription>
                    </div>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedTicket(null)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="details">Detalhes</TabsTrigger>
                      <TabsTrigger value="messages">Mensagens</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="details" className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-gray-900 mb-2">Descrição</h4>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedTicket.description}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">Usuário:</span>
                          <p className="text-gray-700">{selectedTicket.user.name}</p>
                          <p className="text-gray-500 text-xs">{selectedTicket.user.email}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Categoria:</span>
                          <p className="text-gray-700">{selectedTicket.category}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Criado em:</span>
                          <p className="text-gray-700">{new Date(selectedTicket.createdAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">Atualizado em:</span>
                          <p className="text-gray-700">{new Date(selectedTicket.updatedAt).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>

                      {/* Controles de Admin */}
                      <div className="space-y-3 pt-4 border-t">
                        <h4 className="font-medium text-sm text-gray-900">Ações de Administrador</h4>
                        
                        <div className="space-y-2">
                          <Label htmlFor="status">Alterar Status</Label>
                          <Select 
                            value={selectedTicket.status} 
                            onValueChange={(value) => {
                              updateTicketMutation.mutate({
                                ticketId: selectedTicket.id,
                                data: { status: value }
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Aberto</SelectItem>
                              <SelectItem value="in_progress">Em Andamento</SelectItem>
                              <SelectItem value="waiting_response">Aguardando Resposta</SelectItem>
                              <SelectItem value="resolved">Resolvido</SelectItem>
                              <SelectItem value="closed">Fechado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority">Alterar Prioridade</Label>
                          <Select 
                            value={selectedTicket.priority} 
                            onValueChange={(value) => {
                              updateTicketMutation.mutate({
                                ticketId: selectedTicket.id,
                                data: { priority: value }
                              });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Baixa</SelectItem>
                              <SelectItem value="medium">Média</SelectItem>
                              <SelectItem value="high">Alta</SelectItem>
                              <SelectItem value="urgent">Urgente</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="messages" className="space-y-4">
                      <div className="max-h-60 overflow-y-auto space-y-3">
                        {selectedTicket.messages.map((message) => (
                          <div 
                            key={message.id} 
                            className={`p-3 rounded text-sm ${
                              message.isStaffReply 
                                ? 'bg-blue-50 border-l-4 border-blue-400' 
                                : 'bg-gray-50 border-l-4 border-gray-300'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-medium text-xs">
                                {message.user.name}
                                {message.isStaffReply && (
                                  <Badge variant="secondary" className="ml-2 text-xs">Suporte</Badge>
                                )}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(message.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-gray-700">{message.message}</p>
                          </div>
                        ))}
                      </div>

                      {selectedTicket.status !== 'closed' && (
                        <div className="space-y-2">
                          <Label htmlFor="newMessage">Responder como Suporte</Label>
                          <Textarea
                            id="newMessage"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Digite sua resposta..."
                            rows={3}
                          />
                          <Button 
                            size="sm" 
                            onClick={() => {
                              if (newMessage.trim()) {
                                addMessageMutation.mutate({
                                  ticketId: selectedTicket.id,
                                  message: newMessage.trim()
                                });
                              }
                            }}
                            disabled={!newMessage.trim() || addMessageMutation.isPending}
                            className="w-full"
                          >
                            {addMessageMutation.isPending ? 'Enviando...' : 'Enviar Resposta'}
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-6">
                <CardContent className="text-center py-8">
                  <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um ticket</h3>
                  <p className="text-gray-600">Clique em um ticket à esquerda para ver os detalhes e gerenciar.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;