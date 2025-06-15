
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Supplier, SupplierReview, SupplierContact, SupplierBranch, SUPPLIER_CATEGORIES } from '@/types/supplier';

interface SuppliersContextType {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews' | 'reviews'>) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addReview: (supplierId: string, review: Omit<SupplierReview, 'id' | 'createdAt' | 'isApproved'>) => void;
  approveReview: (supplierId: string, reviewId: string) => void;
  addContact: (supplierId: string, contact: Omit<SupplierContact, 'id'>) => void;
  updateContact: (supplierId: string, contactId: string, contact: Partial<SupplierContact>) => void;
  deleteContact: (supplierId: string, contactId: string) => void;
  addBranch: (supplierId: string, branch: Omit<SupplierBranch, 'id'>) => void;
  updateBranch: (supplierId: string, branchId: string, branch: Partial<SupplierBranch>) => void;
  deleteBranch: (supplierId: string, branchId: string) => void;
  getSupplierById: (id: string) => Supplier | undefined;
  getSuppliersByCategory: (categoryId: string) => Supplier[];
  searchSuppliers: (query: string) => Supplier[];
}

const SuppliersContext = createContext<SuppliersContextType | undefined>(undefined);

export function SuppliersProvider({ children }: { children: React.ReactNode }) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data inicial
  useEffect(() => {
    const mockSuppliers: Supplier[] = [
      {
        id: '1',
        tradeName: 'TechSupply Brasil',
        corporateName: 'TechSupply Brasil Importação e Exportação Ltda',
        category: SUPPLIER_CATEGORIES[2], // Importadores
        notes: 'Empresa confiável com histórico de 15 anos no mercado. Especializada em produtos Apple e Samsung.',
        email: 'contato@techsupplybrasil.com.br',
        mainContact: 'João Silva',
        phone: '(11) 3456-7890',
        whatsapp: '(11) 99876-5432',
        contacts: [
          {
            id: '1',
            name: 'João Silva',
            role: 'Gerente Comercial',
            phone: '(11) 3456-7890',
            whatsapp: '(11) 99876-5432',
            email: 'joao@techsupplybrasil.com.br',
            notes: 'Responsável por novos parceiros'
          },
          {
            id: '2',
            name: 'Maria Santos',
            role: 'Analista de Produtos',
            phone: '(11) 3456-7891',
            whatsapp: '(11) 99876-5433',
            email: 'maria@techsupplybrasil.com.br',
            notes: 'Especialista em smartphones'
          }
        ],
        branches: [
          {
            id: '1',
            name: 'Matriz São Paulo',
            corporateName: 'TechSupply Brasil Importação e Exportação Ltda',
            cnpj: '12.345.678/0001-90',
            municipalRegistration: '123456789',
            stateRegistration: '123.456.789.123',
            address: 'Rua das Flores, 123 - São Paulo/SP',
            notes: 'Sede principal da empresa'
          },
          {
            id: '2',
            name: 'Filial Rio de Janeiro',
            corporateName: 'TechSupply Brasil Importação e Exportação Ltda',
            cnpj: '12.345.678/0002-71',
            municipalRegistration: '987654321',
            stateRegistration: '987.654.321.098',
            address: 'Av. Atlântica, 456 - Rio de Janeiro/RJ',
            notes: 'Filial para atendimento da região sudeste'
          }
        ],
        commercialTerms: 'Pagamento: 30 dias\nFrete: CIF\nDesconto para pedidos acima de R$ 10.000\nGarantia de 1 ano em todos os produtos',
        logo: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=100&h=100&fit=crop',
        isVerified: true,
        averageRating: 4.5,
        totalReviews: 128,
        reviews: [
          {
            id: '1',
            supplierId: '1',
            userId: 'user1',
            userName: 'Carlos Silva',
            rating: 5,
            comment: 'Excelente fornecedor! Produtos de qualidade e entrega rápida.',
            photos: [],
            createdAt: '2024-01-15',
            isApproved: true
          },
          {
            id: '2',
            supplierId: '1',
            userId: 'user2',
            userName: 'Ana Costa',
            rating: 4,
            comment: 'Bom atendimento, mas poderia melhorar os prazos.',
            photos: [],
            createdAt: '2024-01-10',
            isApproved: true
          }
        ],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
      },
      {
        id: '2',
        tradeName: 'Nacional Distribuidora',
        corporateName: 'Nacional Distribuidora de Produtos Ltda',
        category: SUPPLIER_CATEGORIES[1], // Distribuidores
        notes: 'Distribuidora nacional com ampla rede de produtos para casa e jardim.',
        email: 'vendas@nacionaldist.com.br',
        mainContact: 'Pedro Santos',
        phone: '(11) 2345-6789',
        whatsapp: '(11) 98765-4321',
        contacts: [
          {
            id: '1',
            name: 'Pedro Santos',
            role: 'Diretor Comercial',
            phone: '(11) 2345-6789',
            whatsapp: '(11) 98765-4321',
            email: 'pedro@nacionaldist.com.br',
            notes: 'Contato principal para grandes volumes'
          }
        ],
        branches: [
          {
            id: '1',
            name: 'Centro de Distribuição SP',
            corporateName: 'Nacional Distribuidora de Produtos Ltda',
            cnpj: '98.765.432/0001-10',
            municipalRegistration: '111222333',
            stateRegistration: '111.222.333.444',
            address: 'Rodovia dos Bandeirantes, Km 50 - Jundiaí/SP',
            notes: 'Principal centro de distribuição'
          }
        ],
        commercialTerms: 'Pagamento: 45 dias\nFrete: FOB\nDesconto progressivo por volume\nTroca garantida em caso de defeito',
        isVerified: false,
        averageRating: 3.8,
        totalReviews: 45,
        reviews: [],
        createdAt: '2024-01-05',
        updatedAt: '2024-01-05'
      }
    ];

    setTimeout(() => {
      setSuppliers(mockSuppliers);
      setLoading(false);
    }, 1000);
  }, []);

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt' | 'averageRating' | 'totalReviews' | 'reviews'>) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Date.now().toString(),
      averageRating: 0,
      totalReviews: 0,
      reviews: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === id 
        ? { ...supplier, ...updates, updatedAt: new Date().toISOString() }
        : supplier
    ));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
  };

  const addReview = (supplierId: string, reviewData: Omit<SupplierReview, 'id' | 'createdAt' | 'isApproved'>) => {
    const newReview: SupplierReview = {
      ...reviewData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      isApproved: true,
    };

    setSuppliers(prev => prev.map(supplier => {
      if (supplier.id === supplierId) {
        const updatedReviews = [...supplier.reviews, newReview];
        const approvedReviews = updatedReviews.filter(r => r.isApproved);
        const averageRating = approvedReviews.length > 0 
          ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length 
          : 0;
        
        return {
          ...supplier,
          reviews: updatedReviews,
          averageRating,
          totalReviews: approvedReviews.length,
          updatedAt: new Date().toISOString()
        };
      }
      return supplier;
    }));
  };

  const approveReview = (supplierId: string, reviewId: string) => {
    setSuppliers(prev => prev.map(supplier => {
      if (supplier.id === supplierId) {
        const updatedReviews = supplier.reviews.map(review => 
          review.id === reviewId ? { ...review, isApproved: true } : review
        );
        const approvedReviews = updatedReviews.filter(r => r.isApproved);
        const averageRating = approvedReviews.length > 0 
          ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length 
          : 0;
        
        return {
          ...supplier,
          reviews: updatedReviews,
          averageRating,
          totalReviews: approvedReviews.length,
          updatedAt: new Date().toISOString()
        };
      }
      return supplier;
    }));
  };

  const addContact = (supplierId: string, contactData: Omit<SupplierContact, 'id'>) => {
    const newContact: SupplierContact = {
      ...contactData,
      id: Date.now().toString(),
    };

    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { 
            ...supplier, 
            contacts: [...supplier.contacts, newContact],
            updatedAt: new Date().toISOString()
          }
        : supplier
    ));
  };

  const updateContact = (supplierId: string, contactId: string, updates: Partial<SupplierContact>) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { 
            ...supplier, 
            contacts: supplier.contacts.map(contact => 
              contact.id === contactId ? { ...contact, ...updates } : contact
            ),
            updatedAt: new Date().toISOString()
          }
        : supplier
    ));
  };

  const deleteContact = (supplierId: string, contactId: string) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { 
            ...supplier, 
            contacts: supplier.contacts.filter(c => c.id !== contactId),
            updatedAt: new Date().toISOString()
          }
        : supplier
    ));
  };

  const addBranch = (supplierId: string, branchData: Omit<SupplierBranch, 'id'>) => {
    const newBranch: SupplierBranch = {
      ...branchData,
      id: Date.now().toString(),
    };

    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { 
            ...supplier, 
            branches: [...supplier.branches, newBranch],
            updatedAt: new Date().toISOString()
          }
        : supplier
    ));
  };

  const updateBranch = (supplierId: string, branchId: string, updates: Partial<SupplierBranch>) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { 
            ...supplier, 
            branches: supplier.branches.map(branch => 
              branch.id === branchId ? { ...branch, ...updates } : branch
            ),
            updatedAt: new Date().toISOString()
          }
        : supplier
    ));
  };

  const deleteBranch = (supplierId: string, branchId: string) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { 
            ...supplier, 
            branches: supplier.branches.filter(b => b.id !== branchId),
            updatedAt: new Date().toISOString()
          }
        : supplier
    ));
  };

  const getSupplierById = (id: string) => {
    return suppliers.find(supplier => supplier.id === id);
  };

  const getSuppliersByCategory = (categoryId: string) => {
    return suppliers.filter(supplier => supplier.category.id === categoryId);
  };

  const searchSuppliers = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.tradeName.toLowerCase().includes(lowercaseQuery) ||
      supplier.corporateName.toLowerCase().includes(lowercaseQuery) ||
      supplier.notes.toLowerCase().includes(lowercaseQuery) ||
      supplier.category.name.toLowerCase().includes(lowercaseQuery)
    );
  };

  return (
    <SuppliersContext.Provider value={{
      suppliers,
      loading,
      error,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      addReview,
      approveReview,
      addContact,
      updateContact,
      deleteContact,
      addBranch,
      updateBranch,
      deleteBranch,
      getSupplierById,
      getSuppliersByCategory,
      searchSuppliers,
    }}>
      {children}
    </SuppliersContext.Provider>
  );
}

export function useSuppliers() {
  const context = useContext(SuppliersContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SuppliersProvider');
  }
  return context;
}
