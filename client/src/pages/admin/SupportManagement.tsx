
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const SupportManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

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
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'closed': return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Gestão de Suporte</h1>
          <p className="text-slate-400">Gerencie tickets e atendimento aos usuários</p>
        </div>
        <div className="flex space-x-2">
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-3 py-1">
            {tickets.filter(t => t.status === 'open').length} Abertos
          </Badge>
          <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-3 py-1">
            {tickets.filter(t => t.status === 'pending').length} Pendentes
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Tickets */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-slate-100">Tickets de Suporte</CardTitle>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-slate-400" />
                  <Input 
                    placeholder="Buscar tickets..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400 w-64"
                  />
                  <Button size="sm" variant="outline" className="bg-slate-600/50 border-slate-500/30 text-slate-300">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div 
                    key={ticket.id} 
                    className={`p-4 bg-slate-600/30 border border-red-500/20 rounded-lg cursor-pointer hover:bg-slate-600/50 transition-colors ${
                      selectedTicket?.id === ticket.id ? 'ring-2 ring-red-500/50' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-slate-100 truncate">{ticket.title}</h3>
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
                    <div className="flex items-center space-x-4 text-sm text-slate-400">
                      <span className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{ticket.user}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{ticket.created}</span>
                      </span>
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {ticket.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Ticket */}
        <div>
          <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
            <CardHeader>
              <CardTitle className="text-slate-100">
                {selectedTicket ? 'Detalhes do Ticket' : 'Selecione um Ticket'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTicket ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-slate-100 mb-2">{selectedTicket.title}</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Usuário:</span>
                        <span className="text-slate-300">{selectedTicket.user}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Email:</span>
                        <span className="text-slate-300">{selectedTicket.email}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Criado:</span>
                        <span className="text-slate-300">{selectedTicket.created}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Categoria:</span>
                        <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                          {selectedTicket.category}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Descrição:</h4>
                    <p className="text-sm text-slate-400 bg-slate-600/30 p-3 rounded">
                      {selectedTicket.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-slate-300 mb-2">Resposta:</h4>
                    <Textarea 
                      placeholder="Digite sua resposta..."
                      className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
                      rows={4}
                    />
                  </div>

                  <div className="flex space-x-2">
                    <Button className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30 flex-1" variant="outline">
                      <Reply className="h-4 w-4 mr-2" />
                      Responder
                    </Button>
                    <Button className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/30" variant="outline">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-600" />
                  <p>Selecione um ticket para ver os detalhes</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SupportManagement;
