/**
 * Hook para ações de CRUD do fornecedor
 * Separado para responsabilidade única e testabilidade
 */

import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import type { 
  Supplier, 
  Contact, 
  Contract, 
  Communication, 
  SupplierDocument,
  UseSupplierActionsReturn 
} from '../types/supplier.types';

export const useSupplierActions = (
  supplierId: string,
  onDataChange: () => Promise<void>
): UseSupplierActionsReturn => {
  const { token } = useAuth();
  const { toast } = useToast();

  const updateSupplier = useCallback(async (data: Partial<Supplier>) => {
    try {
      const response = await fetch(`/api/international-suppliers/${supplierId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar fornecedor');
      }

      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso"
      });

      await onDataChange();
    } catch (error) {
      console.error('Erro ao atualizar fornecedor:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar fornecedor",
        variant: "destructive"
      });
    }
  }, [supplierId, token, toast, onDataChange]);

  const addContact = useCallback(async (contact: Omit<Contact, 'id'>) => {
    try {
      const response = await fetch('/api/supplier-contacts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...contact,
          supplierId: parseInt(supplierId)
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar contato');
      }

      toast({
        title: "Sucesso",
        description: "Contato adicionado com sucesso"
      });

      await onDataChange();
    } catch (error) {
      console.error('Erro ao adicionar contato:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar contato",
        variant: "destructive"
      });
    }
  }, [supplierId, token, toast, onDataChange]);

  const updateContact = useCallback(async (id: number, data: Partial<Contact>) => {
    try {
      const response = await fetch(`/api/supplier-contacts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar contato');
      }

      toast({
        title: "Sucesso",
        description: "Contato atualizado com sucesso"
      });

      await onDataChange();
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contato",
        variant: "destructive"
      });
    }
  }, [token, toast, onDataChange]);

  const deleteContact = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/supplier-contacts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar contato');
      }

      toast({
        title: "Sucesso",
        description: "Contato removido com sucesso"
      });

      await onDataChange();
    } catch (error) {
      console.error('Erro ao deletar contato:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover contato",
        variant: "destructive"
      });
    }
  }, [token, toast, onDataChange]);

  const addContract = useCallback(async (contract: Omit<Contract, 'id' | 'documents'>) => {
    try {
      const response = await fetch('/api/international-contracts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...contract,
          supplierId: parseInt(supplierId)
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar contrato');
      }

      toast({
        title: "Sucesso",
        description: "Contrato adicionado com sucesso"
      });

      await onDataChange();
    } catch (error) {
      console.error('Erro ao adicionar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar contrato",
        variant: "destructive"
      });
    }
  }, [supplierId, token, toast, onDataChange]);

  const updateContract = useCallback(async (id: number, data: Partial<Contract>) => {
    try {
      const response = await fetch(`/api/international-contracts/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar contrato');
      }

      toast({
        title: "Sucesso",
        description: "Contrato atualizado com sucesso"
      });

      await onDataChange();
    } catch (error) {
      console.error('Erro ao atualizar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar contrato",
        variant: "destructive"
      });
    }
  }, [token, toast, onDataChange]);

  const deleteContract = useCallback(async (id: number) => {
    try {
      const response = await fetch(`/api/international-contracts/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar contrato');
      }

      toast({
        title: "Sucesso",
        description: "Contrato removido com sucesso"
      });

      await onDataChange();
    } catch (error) {
      console.error('Erro ao deletar contrato:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover contrato",
        variant: "destructive"
      });
    }
  }, [token, toast, onDataChange]);

  const uploadDocument = useCallback(async (file: File, category: SupplierDocument['category']) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('supplierId', supplierId);
      formData.append('category', category);

      const response = await fetch('/api/supplier-documents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Erro ao fazer upload do documento');
      }

      toast({
        title: "Sucesso",
        description: "Documento enviado com sucesso"
      });

      await onDataChange();
    } catch (error) {
      console.error('Erro ao fazer upload do documento:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar documento",
        variant: "destructive"
      });
    }
  }, [supplierId, token, toast, onDataChange]);

  const deleteDocument = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/supplier-documents/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar documento');
      }

      toast({
        title: "Sucesso",
        description: "Documento removido com sucesso"
      });

      await onDataChange();
    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover documento",
        variant: "destructive"
      });
    }
  }, [token, toast, onDataChange]);

  const addCommunication = useCallback(async (communication: Omit<Communication, 'id'>) => {
    try {
      const response = await fetch('/api/supplier-conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          supplierId: parseInt(supplierId),
          method: communication.type,
          subject: communication.subject,
          date: communication.date,
          status: communication.status,
          message: communication.summary
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao adicionar comunicação');
      }

      toast({
        title: "Sucesso",
        description: "Comunicação registrada com sucesso"
      });

      await onDataChange();
    } catch (error) {
      console.error('Erro ao adicionar comunicação:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar comunicação",
        variant: "destructive"
      });
    }
  }, [supplierId, token, toast, onDataChange]);

  return {
    updateSupplier,
    addContact,
    updateContact,
    deleteContact,
    addContract,
    updateContract,
    deleteContract,
    uploadDocument,
    deleteDocument,
    addCommunication
  };
};