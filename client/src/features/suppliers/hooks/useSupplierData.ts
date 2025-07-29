/**
 * Hook centralizado para gerenciamento de dados do fornecedor
 * Extraído de InternationalSupplierDetail.tsx para separação de responsabilidades
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { 
  Supplier, 
  Contact, 
  Contract, 
  Communication, 
  SupplierDocument,
  UseSupplierDataReturn 
} from '../types/supplier.types';

export const useSupplierData = (supplierId: string): UseSupplierDataReturn => {
  const { token } = useAuth();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplierData = useCallback(async () => {
    if (!token || !supplierId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Buscar dados do fornecedor específico
      const response = await fetch(`/api/international-suppliers/${supplierId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Fornecedor não encontrado');
        } else {
          setError('Erro ao carregar dados do fornecedor');
        }
        setSupplier(null);
        return;
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        // Transformar dados da API para o formato esperado pelo componente
        const supplierData = data.data;
        setSupplier({
          id: supplierData.id,
          name: supplierData.tradeName || supplierData.corporateName,
          country: supplierData.country || 'Brasil',
          city: supplierData.city || 'Não informado',
          category: 'Internacional',
          status: supplierData.status === 'ativo' ? 'active' : 'inactive',
          website: supplierData.website,
          email: supplierData.email,
          phone: supplierData.phone,
          rating: parseFloat(supplierData.averageRating) || 0,
          totalOrders: 0, // TODO: implementar quando tiver dados de pedidos
          lastContact: supplierData.updatedAt || supplierData.createdAt,
          establishedYear: supplierData.establishedYear,
          description: supplierData.description
        });

        // Carregar contatos relacionados
        await fetchContacts(supplierData.id);
        
        // Carregar contratos relacionados
        await fetchContracts(supplierData.id);
        
        // Carregar comunicações relacionadas
        await fetchCommunications(supplierData.id);
        
        // Carregar documentos relacionados
        await fetchDocuments(supplierData.id);
      } else {
        setError('Dados do fornecedor não encontrados');
        setSupplier(null);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do fornecedor:', err);
      setError('Erro ao conectar com o servidor');
      setSupplier(null);
    } finally {
      setLoading(false);
    }
  }, [token, supplierId]);

  const fetchContacts = async (supplierIdNum: number) => {
    try {
      const response = await fetch(`/api/supplier-contacts?supplierId=${supplierIdNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setContacts(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar contatos:', err);
    }
  };

  const fetchContracts = async (supplierIdNum: number) => {
    try {
      const response = await fetch(`/api/international-contracts?supplierId=${supplierIdNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setContracts(data.data.map((contract: any) => ({
            ...contract,
            documents: contract.documents || []
          })));
        }
      }
    } catch (err) {
      console.error('Erro ao buscar contratos:', err);
    }
  };

  const fetchCommunications = async (supplierIdNum: number) => {
    try {
      const response = await fetch(`/api/supplier-conversations?supplierId=${supplierIdNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          // Transformar conversas em comunicações
          const communicationsData = data.data.map((conv: any) => ({
            id: conv.id,
            type: conv.method || 'email',
            subject: conv.subject || conv.title || 'Sem assunto',
            date: conv.date || conv.createdAt,
            status: conv.status || 'received',
            summary: conv.message || conv.content || conv.notes || 'Sem resumo'
          }));
          setCommunications(communicationsData);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar comunicações:', err);
    }
  };

  const fetchDocuments = async (supplierIdNum: number) => {
    try {
      const response = await fetch(`/api/supplier-documents?supplierId=${supplierIdNum}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          setDocuments(data.data);
        }
      }
    } catch (err) {
      console.error('Erro ao buscar documentos:', err);
    }
  };

  useEffect(() => {
    fetchSupplierData();
  }, [fetchSupplierData]);

  const refetch = useCallback(async () => {
    await fetchSupplierData();
  }, [fetchSupplierData]);

  return {
    supplier,
    contacts,
    contracts,
    communications,
    documents,
    loading,
    error,
    refetch
  };
};