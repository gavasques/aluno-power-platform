import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, MessageCircle, Clock, User, Tag, FileText, Paperclip, X, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { apiRequest } from '@/lib/queryClient';

interface SupportCategory {
  id: number;
  name: string;
  description: string;
  sortOrder: number;
  isActive: boolean;
}

interface SupportTicket {
  id: number;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
  category: string;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
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
  attachments?: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    createdAt: string;
  }>;
}

const Support = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch support categories
  const { data: categories = [] } = useQuery<SupportCategory[]>({
    queryKey: ['/api/support/categories'],
  });

  // Fetch user's support tickets
  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['/api/support/tickets'],
  });

  // Upload file mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'support_attachment');
      
      return apiRequest('/api/upload', {
        method: 'POST',
        body: formData,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Arquivo enviado!',
        description: 'O anexo foi carregado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar o arquivo. Tente novamente.',
        variant: 'destructive',
      });
      setSelectedFile(null);
    },
  });

  // Create ticket mutation
  const createTicketMutation = useMutation({
    mutationFn: async (ticketData: any) => {
      return apiRequest('/api/support/tickets', {
        method: 'POST',
        body: JSON.stringify(ticketData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      setIsNewTicketOpen(false);
      setNewTicketForm({ title: '', description: '', category: '' });
      setSelectedFile(null);
      toast({
        title: 'Ticket criado!',
        description: 'Seu ticket de suporte foi criado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao criar ticket',
        description: 'Não foi possível criar o ticket. Verifique os dados e tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: number; message: string }) => {
      return apiRequest(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      if (selectedTicket) {
        queryClient.invalidateQueries({ queryKey: [`/api/support/tickets/${selectedTicket.id}`] });
      }
      setNewMessage('');
      toast({
        title: 'Mensagem enviada!',
        description: 'Sua mensagem foi adicionada ao ticket.',
      });
      // Auto scroll to bottom after adding message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    },
    onError: () => {
      toast({
        title: 'Erro ao enviar mensagem',
        description: 'Não foi possível enviar a mensagem. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  // Auto scroll to bottom when ticket changes or messages update
  useEffect(() => {
    if (selectedTicket && selectedTicket.messages.length > 0) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [selectedTicket?.messages.length, selectedTicket?.id]);

  // Close ticket mutation
  const closeTicketMutation = useMutation({
    mutationFn: async (ticketId: number) => {
      return apiRequest(`/api/support/tickets/${ticketId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'closed' }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/support/tickets'] });
      toast({
        title: 'Ticket encerrado!',
        description: 'O ticket foi encerrado com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao encerrar ticket',
        description: 'Não foi possível encerrar o ticket. Tente novamente.',
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: 'O arquivo deve ter no máximo 10MB.',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: 'Tipo de arquivo não suportado',
          description: 'Apenas imagens, PDFs e documentos de texto são permitidos.',
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketForm.title.trim() || !newTicketForm.description.trim() || !newTicketForm.category) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    let attachmentId = null;
    
    // Upload file first if selected
    if (selectedFile) {
      try {
        const uploadResult = await uploadFileMutation.mutateAsync(selectedFile);
        attachmentId = uploadResult.id;
      } catch (error) {
        return; // Upload failed, don't create ticket
      }
    }

    // Create ticket with or without attachment
    createTicketMutation.mutate({
      ...newTicketForm,
      attachmentId,
    });
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Central de Suporte</h1>
            <p className="text-gray-600 mt-2">Gerencie seus tickets de suporte e tire suas dúvidas</p>
          </div>
          <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Novo Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Ticket</DialogTitle>
                <DialogDescription>
                  Descreva seu problema ou solicitação e nossa equipe irá ajudá-lo.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={newTicketForm.title}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Descreva brevemente o problema..."
                    className="h-12 text-base"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Select 
                    value={newTicketForm.category} 
                    onValueChange={(value) => setNewTicketForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="h-12 text-base">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição *</Label>
                  <Textarea
                    id="description"
                    value={newTicketForm.description}
                    onChange={(e) => setNewTicketForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva detalhadamente o problema ou solicitação..."
                    rows={8}
                    className="text-base resize-none min-h-[200px]"
                  />
                </div>

                {/* File Upload Section */}
                <div className="space-y-2">
                  <Label>Anexo (Opcional)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    {!selectedFile ? (
                      <div className="text-center">
                        <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">
                          Clique para selecionar um arquivo ou arraste aqui
                        </p>
                        <p className="text-xs text-gray-400">
                          Máximo 10MB • PNG, JPG, PDF, DOC, TXT
                        </p>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileSelect}
                          accept="image/*,.pdf,.doc,.docx,.txt"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Paperclip className="h-4 w-4 mr-2" />
                          Selecionar Arquivo
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-blue-50 p-3 rounded">
                        <div className="flex items-center gap-3">
                          <FileText className="h-8 w-8 text-blue-600" />
                          <div>
                            <p className="font-medium text-sm">{selectedFile.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeSelectedFile}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsNewTicketOpen(false)}
                    disabled={createTicketMutation.isPending || uploadFileMutation.isPending}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreateTicket}
                    disabled={createTicketMutation.isPending || uploadFileMutation.isPending}
                  >
                    {createTicketMutation.isPending || uploadFileMutation.isPending ? 'Criando...' : 'Criar Ticket'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Tickets */}
          <div className="lg:col-span-2 space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Carregando tickets...</p>
              </div>
            ) : tickets.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Nenhum ticket encontrado</h3>
                  <p className="text-gray-600 mb-4">Você ainda não criou nenhum ticket de suporte.</p>
                  <Button onClick={() => setIsNewTicketOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Primeiro Ticket
                  </Button>
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
                        <CardTitle className="text-lg mb-1">{ticket.title}</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          Ticket #{ticket.id} • {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(ticket.status)}>
                        {getStatusText(ticket.status)}
                      </Badge>
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
                        {ticket.messages.length > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            {ticket.messages.length} mensagem{ticket.messages.length !== 1 ? 's' : ''}
                          </span>
                        )}
                        {ticket.attachments && ticket.attachments.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Paperclip className="h-3 w-3" />
                            {ticket.attachments.length} anexo{ticket.attachments.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(ticket.updatedAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
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
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Descrição</h4>
                    <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">{selectedTicket.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-900">Status:</span>
                      <Badge className={`ml-2 ${getStatusColor(selectedTicket.status)}`}>
                        {getStatusText(selectedTicket.status)}
                      </Badge>
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

                  {/* Attachments */}
                  {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm text-gray-900 mb-2">Anexos</h4>
                      <div className="space-y-2">
                        {selectedTicket.attachments.map((attachment) => (
                          <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <div>
                                <p className="text-sm font-medium">{attachment.fileName}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(attachment.fileSize)}</p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(attachment.fileUrl, '_blank')}
                            >
                              Ver
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Messages History */}
                  <div>
                    <h4 className="font-medium text-sm text-gray-900 mb-2">Histórico de Mensagens</h4>
                    <div className="max-h-96 overflow-y-auto space-y-3 border rounded-lg p-3 bg-gray-50">
                      {selectedTicket.messages.length > 0 ? (
                        selectedTicket.messages
                          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                          .map((message) => (
                            <div 
                              key={message.id} 
                              className={`flex ${message.isStaffReply ? 'justify-start' : 'justify-end'}`}
                            >
                              <div 
                                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                                  message.isStaffReply 
                                    ? 'bg-white border border-blue-200 text-gray-800' 
                                    : 'bg-blue-600 text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`font-medium text-xs ${
                                    message.isStaffReply ? 'text-blue-600' : 'text-blue-100'
                                  }`}>
                                    {message.user.name}
                                    {message.isStaffReply && (
                                      <Badge variant="secondary" className="ml-1 text-xs bg-blue-100 text-blue-800">
                                        Suporte
                                      </Badge>
                                    )}
                                  </span>
                                  <span className={`text-xs ${
                                    message.isStaffReply ? 'text-gray-500' : 'text-blue-100'
                                  }`}>
                                    {new Date(message.createdAt).toLocaleString('pt-BR', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                                <p className="leading-relaxed">{message.message}</p>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p className="text-sm">Nenhuma mensagem ainda</p>
                          <p className="text-xs">Inicie a conversa enviando um comentário</p>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </div>

                  {/* Add New Message - Only if ticket is not closed */}
                  {selectedTicket.status !== 'closed' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm text-gray-900 mb-3">Enviar Nova Mensagem</h4>
                      <div className="space-y-3">
                        <Textarea
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (newMessage.trim() && selectedTicket && !addMessageMutation.isPending) {
                                addMessageMutation.mutate({
                                  ticketId: selectedTicket.id,
                                  message: newMessage.trim(),
                                });
                              }
                            }
                          }}
                          placeholder="Digite sua mensagem... (Enter para enviar, Shift+Enter para nova linha)"
                          rows={4}
                          className="text-sm resize-none focus:ring-2 focus:ring-blue-500 border-gray-200"
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {newMessage.length > 0 && `${newMessage.length} caracteres`}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (newMessage.trim() && selectedTicket) {
                                addMessageMutation.mutate({
                                  ticketId: selectedTicket.id,
                                  message: newMessage.trim(),
                                });
                              }
                            }}
                            disabled={!newMessage.trim() || addMessageMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6"
                          >
                            {addMessageMutation.isPending ? (
                              <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Enviando...
                              </div>
                            ) : (
                              'Enviar Mensagem'
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ticket Actions */}
                  <div className="pt-4 border-t">
                    {selectedTicket.status !== 'closed' ? (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (selectedTicket && confirm('Tem certeza que deseja encerrar este ticket?')) {
                            closeTicketMutation.mutate(selectedTicket.id);
                          }
                        }}
                        disabled={closeTicketMutation.isPending}
                        className="w-full"
                      >
                        {closeTicketMutation.isPending ? 'Encerrando...' : 'Encerrar Ticket'}
                      </Button>
                    ) : (
                      <div className="text-center">
                        <Badge variant="secondary" className="text-sm">
                          Ticket Encerrado
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          Este ticket foi encerrado e não aceita mais comentários.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="sticky top-6">
                <CardContent className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione um ticket</h3>
                  <p className="text-gray-600">Clique em um ticket à esquerda para ver os detalhes.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;