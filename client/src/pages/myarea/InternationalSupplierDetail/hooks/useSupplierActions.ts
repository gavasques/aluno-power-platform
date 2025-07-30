import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import type { 
  Contact, 
  Contract, 
  SupplierDocument, 
  Communication,
  ContactFormData,
  ContractFormData,
  CommunicationFormData,
  DocumentUploadData,
  UseSupplierActionsReturn 
} from '../types';

/**
 * HOOK DE AÇÕES DO FORNECEDOR - FASE 4 REFATORAÇÃO
 * 
 * Responsabilidade única: Gerenciar todas as ações CRUD relacionadas ao fornecedor
 * Antes: Lógica espalhada no componente de 1.853 linhas
 * Depois: Hook centralizado para todas as operações
 */
export function useSupplierActions(supplierId: string): UseSupplierActionsReturn {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ============================================
  // CONTACTS
  // ============================================
  
  const { data: contacts = [], isLoading: isLoadingContacts } = useQuery({
    queryKey: ['supplier-contacts', supplierId],
    queryFn: async (): Promise<Contact[]> => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/contacts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar contatos');
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!token && !!supplierId
  });

  const addContactMutation = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao adicionar contato');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-contacts', supplierId] });
      toast({ title: "Sucesso", description: "Contato adicionado com sucesso." });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ContactFormData }) => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao atualizar contato');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-contacts', supplierId] });
      toast({ title: "Sucesso", description: "Contato atualizado com sucesso." });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/contacts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao excluir contato');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-contacts', supplierId] });
      toast({ title: "Sucesso", description: "Contato excluído com sucesso." });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  });

  // ============================================
  // CONTRACTS
  // ============================================

  const { data: contracts = [], isLoading: isLoadingContracts } = useQuery({
    queryKey: ['supplier-contracts', supplierId],
    queryFn: async (): Promise<Contract[]> => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/contracts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar contratos');
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!token && !!supplierId
  });

  const addContractMutation = useMutation({
    mutationFn: async (data: ContractFormData) => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/contracts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao adicionar contrato');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-contracts', supplierId] });
      toast({ title: "Sucesso", description: "Contrato adicionado com sucesso." });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  });

  const updateContractMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ContractFormData }) => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/contracts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao atualizar contrato');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-contracts', supplierId] });
      toast({ title: "Sucesso", description: "Contrato atualizado com sucesso." });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  });

  const deleteContractMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/contracts/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao excluir contrato');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-contracts', supplierId] });
      toast({ title: "Sucesso", description: "Contrato excluído com sucesso." });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  });

  // ============================================
  // DOCUMENTS
  // ============================================

  const { data: documents = [], isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['supplier-documents', supplierId],
    queryFn: async (): Promise<SupplierDocument[]> => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar documentos');
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!token && !!supplierId
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: async (data: DocumentUploadData) => {
      const formData = new FormData();
      formData.append('file', data.file);
      formData.append('name', data.name);
      formData.append('type', data.type);
      if (data.contractId) formData.append('contractId', data.contractId.toString());
      if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
      if (data.notes) formData.append('notes', data.notes);

      const response = await fetch(`/api/international-suppliers/${supplierId}/documents`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (!response.ok) throw new Error('Erro ao fazer upload do documento');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-documents', supplierId] });
      toast({ title: "Sucesso", description: "Documento enviado com sucesso." });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  });

  const deleteDocumentMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/documents/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao excluir documento');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-documents', supplierId] });
      toast({ title: "Sucesso", description: "Documento excluído com sucesso." });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  });

  // ============================================
  // COMMUNICATIONS
  // ============================================

  const { data: communications = [], isLoading: isLoadingCommunications } = useQuery({
    queryKey: ['supplier-communications', supplierId],
    queryFn: async (): Promise<Communication[]> => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/communications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao carregar comunicações');
      const result = await response.json();
      return result.data || [];
    },
    enabled: !!token && !!supplierId
  });

  const addCommunicationMutation = useMutation({
    mutationFn: async (data: CommunicationFormData) => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/communications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Erro ao adicionar comunicação');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-communications', supplierId] });
      toast({ title: "Sucesso", description: "Comunicação registrada com sucesso." });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  });

  const deleteCommunicationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/international-suppliers/${supplierId}/communications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Erro ao excluir comunicação');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-communications', supplierId] });
      toast({ title: "Sucesso", description: "Comunicação excluída com sucesso." });
    },
    onError: (error) => {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive" 
      });
    }
  });

  // ============================================
  // RETURN INTERFACE
  // ============================================

  return {
    // Contact actions
    contacts,
    addContact: (data: ContactFormData) => addContactMutation.mutateAsync(data),
    updateContact: (id: number, data: ContactFormData) => updateContactMutation.mutateAsync({ id, data }),
    deleteContact: (id: number) => deleteContactMutation.mutateAsync(id),
    
    // Contract actions
    contracts,
    addContract: (data: ContractFormData) => addContractMutation.mutateAsync(data),
    updateContract: (id: number, data: ContractFormData) => updateContractMutation.mutateAsync({ id, data }),
    deleteContract: (id: number) => deleteContractMutation.mutateAsync(id),
    
    // Document actions
    documents,
    uploadDocument: (data: DocumentUploadData) => uploadDocumentMutation.mutateAsync(data),
    deleteDocument: (id: number) => deleteDocumentMutation.mutateAsync(id),
    
    // Communication actions
    communications,
    addCommunication: (data: CommunicationFormData) => addCommunicationMutation.mutateAsync(data),
    deleteCommunication: (id: number) => deleteCommunicationMutation.mutateAsync(id),
    
    // Loading states
    isLoadingContacts,
    isLoadingContracts,
    isLoadingDocuments,
    isLoadingCommunications
  };
}