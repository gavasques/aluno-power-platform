import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { 
  Supplier, 
  Contact, 
  Contract, 
  Communication, 
  SupplierDocument 
} from '@/types/supplier';

export const useSupplierData = (supplierId: string) => {
  const { token } = useAuth();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [documents, setDocuments] = useState<SupplierDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
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
            totalOrders: 0,
            lastContact: supplierData.updatedAt || supplierData.createdAt,
            establishedYear: supplierData.establishedYear,
            description: supplierData.description
          });
          
          // Buscar dados relacionados se necessário
          // TODO: Implementar busca de contatos, contratos, comunicações e documentos
        } else {
          setError('Dados do fornecedor não encontrados');
        }
      } catch (err) {
        console.error('Erro ao buscar dados do fornecedor:', err);
        setError('Erro ao carregar dados do fornecedor');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, supplierId]);

  const refetch = () => {
    setLoading(true);
    setError(null);
    // Re-trigger useEffect
  };

  return {
    supplier,
    contacts,
    contracts,
    communications,
    documents,
    loading,
    error,
    refetch,
    setSupplier,
    setContacts,
    setContracts,
    setCommunications,
    setDocuments
  };
};