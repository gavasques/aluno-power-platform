/**
 * Componente de apresentação para gerenciamento de contratos do fornecedor
 * Lista de contratos com funcionalidades de adicionar, editar e remover
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
  Edit, 
  Trash2, 
  FileText, 
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Download
} from "lucide-react";
import type { Contract } from '../../types/supplier.types';

interface SupplierContractsProps {
  contracts: Contract[];
  onAdd: (contract: Omit<Contract, 'id' | 'documents'>) => Promise<void>;
  onUpdate: (id: number, data: Partial<Contract>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading?: boolean;
}

export const SupplierContracts = ({ 
  contracts, 
  onAdd, 
  onUpdate, 
  onDelete, 
  isLoading = false 
}: SupplierContractsProps) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [contractForm, setContractForm] = useState({
    contractNumber: '',
    title: '',
    description: '',
    contractType: '',
    status: 'draft' as Contract['status'],
    startDate: '',
    endDate: '',
    value: '',
    currency: 'BRL',
    paymentTerms: '',
    deliveryTerms: '',
    incoterms: '',
    notes: ''
  });

  const resetForm = () => {
    setContractForm({
      contractNumber: '',
      title: '',
      description: '',
      contractType: '',
      status: 'draft',
      startDate: '',
      endDate: '',
      value: '',
      currency: 'BRL',
      paymentTerms: '',
      deliveryTerms: '',
      incoterms: '',
      notes: ''
    });
  };

  const openAddModal = () => {
    resetForm();
    setEditingContract(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (contract: Contract) => {
    setContractForm({
      contractNumber: contract.contractNumber,
      title: contract.title,
      description: contract.description || '',
      contractType: contract.contractType,
      status: contract.status,
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
      value: contract.value?.toString() || '',
      currency: contract.currency,
      paymentTerms: contract.paymentTerms || '',
      deliveryTerms: contract.deliveryTerms || '',
      incoterms: contract.incoterms || '',
      notes: contract.notes || ''
    });
    setEditingContract(contract);
    setIsAddModalOpen(true);
  };

  const handleSave = async () => {
    const formData = {
      ...contractForm,
      value: contractForm.value ? parseFloat(contractForm.value) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingContract) {
      await onUpdate(editingContract.id, formData);
    } else {
      await onAdd(formData);
    }
    setIsAddModalOpen(false);
    resetForm();
    setEditingContract(null);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja remover este contrato?')) {
      await onDelete(id);
    }
  };

  const getStatusColor = (status: Contract['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'terminated': return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Contract['status']) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho';
      case 'expired': return 'Expirado';
      case 'terminated': return 'Cancelado';
    }
  };

  const getStatusIcon = (status: Contract['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'draft': return <Clock className="w-4 h-4" />;
      case 'expired': return <AlertCircle className="w-4 h-4" />;
      case 'terminated': return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'BRL' ? 'BRL' : currency
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Contratos</h3>
          <p className="text-sm text-gray-600">
            {contracts.length} contrato{contracts.length !== 1 ? 's' : ''} cadastrado{contracts.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Contrato
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContract ? 'Editar Contrato' : 'Novo Contrato'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contractNumber">Número do Contrato *</Label>
                  <Input
                    id="contractNumber"
                    value={contractForm.contractNumber}
                    onChange={(e) => setContractForm({ ...contractForm, contractNumber: e.target.value })}
                    placeholder="CT-2025-001"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contractType">Tipo de Contrato *</Label>
                  <Input
                    id="contractType"
                    value={contractForm.contractType}
                    onChange={(e) => setContractForm({ ...contractForm, contractType: e.target.value })}
                    placeholder="Fornecimento, Prestação de Serviços, etc."
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={contractForm.title}
                  onChange={(e) => setContractForm({ ...contractForm, title: e.target.value })}
                  placeholder="Contrato de Fornecimento de Produtos"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={contractForm.description}
                  onChange={(e) => setContractForm({ ...contractForm, description: e.target.value })}
                  placeholder="Descrição detalhada do contrato..."
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={contractForm.status}
                    onValueChange={(value: Contract['status']) => setContractForm({ ...contractForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                      <SelectItem value="terminated">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="startDate">Data de Início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={contractForm.startDate}
                    onChange={(e) => setContractForm({ ...contractForm, startDate: e.target.value })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="endDate">Data de Fim</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={contractForm.endDate}
                    onChange={(e) => setContractForm({ ...contractForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">Valor</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    value={contractForm.value}
                    onChange={(e) => setContractForm({ ...contractForm, value: e.target.value })}
                    placeholder="10000.00"
                  />
                </div>
                
                <div>
                  <Label htmlFor="currency">Moeda</Label>
                  <Select
                    value={contractForm.currency}
                    onValueChange={(value) => setContractForm({ ...contractForm, currency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real (BRL)</SelectItem>
                      <SelectItem value="USD">Dólar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
                <Input
                  id="paymentTerms"
                  value={contractForm.paymentTerms}
                  onChange={(e) => setContractForm({ ...contractForm, paymentTerms: e.target.value })}
                  placeholder="30 dias, À vista, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="deliveryTerms">Condições de Entrega</Label>
                <Input
                  id="deliveryTerms"
                  value={contractForm.deliveryTerms}
                  onChange={(e) => setContractForm({ ...contractForm, deliveryTerms: e.target.value })}
                  placeholder="FOB, CIF, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="incoterms">Incoterms</Label>
                <Input
                  id="incoterms"
                  value={contractForm.incoterms}
                  onChange={(e) => setContractForm({ ...contractForm, incoterms: e.target.value })}
                  placeholder="FOB, CIF, DDP, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={contractForm.notes}
                  onChange={(e) => setContractForm({ ...contractForm, notes: e.target.value })}
                  placeholder="Observações adicionais..."
                  rows={3}
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
                disabled={!contractForm.contractNumber || !contractForm.title || !contractForm.contractType || isLoading}
              >
                {editingContract ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Contracts List */}
      {contracts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum contrato cadastrado</h3>
            <p className="text-gray-600 mb-4">
              Cadastre contratos para organizar os acordos comerciais com este fornecedor.
            </p>
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Contrato
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => (
            <Card key={contract.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <Badge className={getStatusColor(contract.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(contract.status)}
                          <span>{getStatusText(contract.status)}</span>
                        </div>
                      </Badge>
                    </div>
                    <CardDescription>
                      {contract.contractNumber} • {contract.contractType}
                    </CardDescription>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditModal(contract)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(contract.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contract.value && (
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <div>
                        <div className="font-medium">Valor</div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(contract.value, contract.currency)}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {contract.startDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <div>
                        <div className="font-medium">Data de Início</div>
                        <div className="text-sm text-gray-600">
                          {new Date(contract.startDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {contract.endDate && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <div>
                        <div className="font-medium">Data de Fim</div>
                        <div className="text-sm text-gray-600">
                          {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {contract.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-700">{contract.description}</p>
                  </div>
                )}
                
                {contract.documents && contract.documents.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        Documentos ({contract.documents.length})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {contract.documents.map((doc) => (
                        <Button
                          key={doc.id}
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Download className="w-3 h-3 mr-1" />
                          {doc.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                  Criado em {new Date(contract.createdAt).toLocaleDateString('pt-BR')}
                  {contract.updatedAt !== contract.createdAt && (
                    <span> • Atualizado em {new Date(contract.updatedAt).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};