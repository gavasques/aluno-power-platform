/**
 * Componente de apresentação para gerenciamento de comunicações do fornecedor
 * Histórico de comunicações com funcionalidade de adicionar novos registros
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  Plus, 
  Mail, 
  Phone, 
  MessageSquare,
  Video,
  Calendar,
  CheckCircle,
  Clock,
  Send
} from "lucide-react";
import type { Communication } from '../../types/supplier.types';

interface SupplierCommunicationsProps {
  communications: Communication[];
  onAdd: (communication: Omit<Communication, 'id'>) => Promise<void>;
  isLoading?: boolean;
}

export const SupplierCommunications = ({ 
  communications, 
  onAdd, 
  isLoading = false 
}: SupplierCommunicationsProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [communicationForm, setCommunicationForm] = useState({
    type: 'email' as Communication['type'],
    subject: '',
    date: new Date().toISOString().split('T')[0],
    status: 'sent' as Communication['status'],
    summary: ''
  });

  const resetForm = () => {
    setCommunicationForm({
      type: 'email',
      subject: '',
      date: new Date().toISOString().split('T')[0],
      status: 'sent',
      summary: ''
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    await onAdd(communicationForm);
    setIsAddModalOpen(false);
    resetForm();
  };

  const getTypeColor = (type: Communication['type']) => {
    switch (type) {
      case 'email': return 'bg-blue-100 text-blue-800';
      case 'whatsapp': return 'bg-green-100 text-green-800';
      case 'phone': return 'bg-purple-100 text-purple-800';
      case 'meeting': return 'bg-orange-100 text-orange-800';
    }
  };

  const getTypeText = (type: Communication['type']) => {
    switch (type) {
      case 'email': return 'Email';
      case 'whatsapp': return 'WhatsApp';
      case 'phone': return 'Telefone';
      case 'meeting': return 'Reunião';
    }
  };

  const getTypeIcon = (type: Communication['type']) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'whatsapp': return <MessageSquare className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Video className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Communication['status']) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'received': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: Communication['status']) => {
    switch (status) {
      case 'sent': return 'Enviado';
      case 'received': return 'Recebido';
      case 'pending': return 'Pendente';
    }
  };

  const getStatusIcon = (status: Communication['status']) => {
    switch (status) {
      case 'sent': return <Send className="w-4 h-4" />;
      case 'received': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
    }
  };

  // Ordenar comunicações por data (mais recente primeiro)
  const sortedCommunications = [...communications].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Comunicações</h3>
          <p className="text-sm text-gray-600">
            {communications.length} registro{communications.length !== 1 ? 's' : ''} de comunicação
          </p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Comunicação
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Comunicação</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="commType">Tipo *</Label>
                  <Select
                    value={communicationForm.type}
                    onValueChange={(value: Communication['type']) => 
                      setCommunicationForm({ ...communicationForm, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="phone">Telefone</SelectItem>
                      <SelectItem value="meeting">Reunião</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="commStatus">Status *</Label>
                  <Select
                    value={communicationForm.status}
                    onValueChange={(value: Communication['status']) => 
                      setCommunicationForm({ ...communicationForm, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sent">Enviado</SelectItem>
                      <SelectItem value="received">Recebido</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="commSubject">Assunto *</Label>
                <Input
                  id="commSubject"
                  value={communicationForm.subject}
                  onChange={(e) => setCommunicationForm({ ...communicationForm, subject: e.target.value })}
                  placeholder="Assunto da comunicação"
                />
              </div>
              
              <div>
                <Label htmlFor="commDate">Data *</Label>
                <Input
                  id="commDate"
                  type="date"
                  value={communicationForm.date}
                  onChange={(e) => setCommunicationForm({ ...communicationForm, date: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="commSummary">Resumo *</Label>
                <Textarea
                  id="commSummary"
                  value={communicationForm.summary}
                  onChange={(e) => setCommunicationForm({ ...communicationForm, summary: e.target.value })}
                  placeholder="Resumo do que foi discutido..."
                  rows={4}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={!communicationForm.subject || !communicationForm.summary || isLoading}
              >
                Registrar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Communications List */}
      {communications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma comunicação registrada</h3>
            <p className="text-gray-600 mb-4">
              Registre comunicações para manter um histórico das interações com este fornecedor.
            </p>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Registrar Primeira Comunicação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedCommunications.map((comm) => (
            <Card key={comm.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {getTypeIcon(comm.type)}
                        <CardTitle className="text-lg">{comm.subject}</CardTitle>
                      </div>
                      <Badge className={getTypeColor(comm.type)}>
                        {getTypeText(comm.type)}
                      </Badge>
                      <Badge className={getStatusColor(comm.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(comm.status)}
                          <span>{getStatusText(comm.status)}</span>
                        </div>
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(comm.date).toLocaleDateString('pt-BR')}</span>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 leading-relaxed">{comm.summary}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Statistics */}
      {communications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Estatísticas de Comunicação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {(['email', 'whatsapp', 'phone', 'meeting'] as Communication['type'][]).map((type) => {
                const count = communications.filter(c => c.type === type).length;
                if (count === 0) return null;
                
                return (
                  <div key={type} className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      {getTypeIcon(type)}
                    </div>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-xs text-gray-600">{getTypeText(type)}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};