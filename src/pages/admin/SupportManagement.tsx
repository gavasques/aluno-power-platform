
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Clock, CheckCircle, AlertTriangle, User, Search, Filter, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SupportManagement = () => {
  const { toast } = useToast();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [response, setResponse] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  const [tickets, setTickets] = useState([
    {
      id: "T001",
      title: "Problema com cálculo de lucro",
      description: "Os cálculos não estão batendo com minhas contas manuais.",
      user: "João Silva",
      userEmail: "joao@email.com",
      status: "open",
      priority: "high",
      category: "technical",
      createdAt: "2024-01-15T10:30:00",
      updatedAt: "2024-01-15T10:30:00",
      responses: []
    },
    {
      id: "T002",
      title: "Dúvida sobre Amazon FBA",
      description: "Como configurar corretamente o frete outbound?",
      user: "Maria Santos",
      userEmail: "maria@email.com",
      status: "in_progress",
      priority: "medium",
      category: "question",
      createdAt: "2024-01-15T09:15:00",
      updatedAt: "2024-01-15T14:20:00",
      responses: [
        {
          id: "R001",
          message: "Olá Maria, para configurar o frete outbound...",
          author: "Suporte",
          timestamp: "2024-01-15T14:20:00"
        }
      ]
    },
    {
      id: "T003",
      title: "Solicitação de novo recurso",
      description: "Seria possível adicionar integração com Shopify?",
      user: "Pedro Costa",
      userEmail: "pedro@email.com",
      status: "resolved",
      priority: "low",
      category: "feature_request",
      createdAt: "2024-01-14T16:45:00",
      updatedAt: "2024-01-15T11:00:00",
      responses: [
        {
          id: "R002",
          message: "Obrigado pela sugestão! Vamos avaliar para próximas versões.",
          author: "Suporte",
          timestamp: "2024-01-15T11:00:00"
        }
      ]
    }
  ]);

  const getStatusBadge = (status: string) => {
    const badges = {
      open: <Badge variant="destructive">Aberto</Badge>,
      in_progress: <Badge className="bg-yellow-500">Em Andamento</Badge>,
      resolved: <Badge className="bg-green-500">Resolvido</Badge>,
      closed: <Badge variant="secondary">Fechado</Badge>
    };
    return badges[status as keyof typeof badges];
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      high: <Badge variant="destructive">Alta</Badge>,
      medium: <Badge className="bg-yellow-500">Média</Badge>,
      low: <Badge variant="secondary">Baixa</Badge>
    };
    return badges[priority as keyof typeof badges];
  };

  const getCategoryBadge = (category: string) => {
    const badges = {
      technical: <Badge variant="outline">Técnico</Badge>,
      question: <Badge className="bg-blue-500">Dúvida</Badge>,
      feature_request: <Badge className="bg-purple-500">Novo Recurso</Badge>,
      bug: <Badge variant="destructive">Bug</Badge>
    };
    return badges[category as keyof typeof badges];
  };

  const filteredTickets = tickets.filter(ticket => {
    const statusMatch = filterStatus === "all" || ticket.status === filterStatus;
    const priorityMatch = filterPriority === "all" || ticket.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const handleSendResponse = (ticketId: string) => {
    if (!response.trim()) return;

    setTickets(tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          responses: [
            ...ticket.responses,
            {
              id: `R${Date.now()}`,
              message: response,
              author: "Suporte Admin",
              timestamp: new Date().toISOString()
            }
          ],
          status: "in_progress",
          updatedAt: new Date().toISOString()
        };
      }
      return ticket;
    }));

    setResponse("");
    toast({
      title: "Resposta enviada",
      description: "Sua resposta foi enviada com sucesso.",
    });
  };

  const updateTicketStatus = (ticketId: string, newStatus: string) => {
    setTickets(tickets.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return ticket;
    }));

    toast({
      title: "Status atualizado",
      description: `Ticket ${ticketId} foi atualizado para ${newStatus}.`,
    });
  };

  const selectedTicketData = tickets.find(t => t.id === selectedTicket);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Suporte</h1>
          <p className="text-muted-foreground">Painel para visualizar e responder tickets de suporte</p>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abertos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === "open").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === "in_progress").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === "resolved").length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Tickets */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="open">Abertos</SelectItem>
                    <SelectItem value="in_progress">Em Andamento</SelectItem>
                    <SelectItem value="resolved">Resolvidos</SelectItem>
                    <SelectItem value="closed">Fechados</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as prioridades</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Tickets */}
          <Card>
            <CardHeader>
              <CardTitle>Tickets de Suporte</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2 p-4">
                {filteredTickets.map((ticket) => (
                  <div 
                    key={ticket.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedTicket === ticket.id ? 'border-primary bg-muted/50' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{ticket.id}</span>
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                        {getCategoryBadge(ticket.category)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-medium mb-1">{ticket.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{ticket.description}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span>{ticket.user}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Ticket */}
        <div className="space-y-4">
          {selectedTicketData ? (
            <>
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{selectedTicketData.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">Ticket #{selectedTicketData.id}</p>
                    </div>
                    <Select
                      value={selectedTicketData.status}
                      onValueChange={(value) => updateTicketStatus(selectedTicketData.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Aberto</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="resolved">Resolvido</SelectItem>
                        <SelectItem value="closed">Fechado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Usuário</h4>
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{selectedTicketData.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedTicketData.user}</p>
                        <p className="text-sm text-muted-foreground">{selectedTicketData.userEmail}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Descrição</h4>
                    <p className="text-sm">{selectedTicketData.description}</p>
                  </div>

                  <div className="flex space-x-2">
                    {getPriorityBadge(selectedTicketData.priority)}
                    {getCategoryBadge(selectedTicketData.category)}
                  </div>
                </CardContent>
              </Card>

              {/* Histórico de Respostas */}
              <Card>
                <CardHeader>
                  <CardTitle>Histórico</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {selectedTicketData.responses.map((response) => (
                      <div key={response.id} className="border-l-2 border-primary pl-4">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-medium text-sm">{response.author}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(response.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{response.message}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Nova Resposta */}
              <Card>
                <CardHeader>
                  <CardTitle>Nova Resposta</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Digite sua resposta..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    rows={4}
                  />
                  <Button 
                    onClick={() => handleSendResponse(selectedTicketData.id)}
                    className="w-full"
                    disabled={!response.trim()}
                  >
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Resposta
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Selecione um ticket</h3>
                <p className="text-sm text-muted-foreground">
                  Clique em um ticket na lista para ver os detalhes e responder.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportManagement;
