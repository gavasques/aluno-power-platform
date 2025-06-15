import React, { createContext, useContext, useState, useEffect } from 'react';
import { Supplier, SupplierReview, SupplierContact, SupplierFile, SUPPLIER_CATEGORIES, SUPPLIER_DEPARTMENTS } from '@/types/supplier';

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
  addFile: (supplierId: string, file: Omit<SupplierFile, 'id' | 'uploadedAt'>) => void;
  updateFile: (supplierId: string, fileId: string, file: Partial<SupplierFile>) => void;
  deleteFile: (supplierId: string, fileId: string) => void;
  getSupplierById: (id: string) => Supplier | undefined;
  getSuppliersByCategory: (categoryId: string) => Supplier[];
  getSuppliersByDepartment: (departmentId: string) => Supplier[];
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
        departments: [SUPPLIER_DEPARTMENTS[0], SUPPLIER_DEPARTMENTS[4]], // Eletrônicos e Esportes
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
        files: [
          {
            id: '1',
            name: 'Catálogo Eletrônicos 2024',
            description: 'Catálogo completo de produtos eletrônicos para 2024',
            type: 'catalog',
            fileUrl: '#',
            uploadedAt: '2024-01-15',
            size: 2048000
          },
          {
            id: '2',
            name: 'Tabela de Preços Janeiro',
            description: 'Planilha de preços atualizada para janeiro/2024',
            type: 'price_sheet',
            fileUrl: '#',
            uploadedAt: '2024-01-10',
            size: 512000
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
        departments: [SUPPLIER_DEPARTMENTS[1], SUPPLIER_DEPARTMENTS[7]], // Casa e Jardim, Construção
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
        files: [],
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

  const addFile = (supplierId: string, fileData: Omit<SupplierFile, 'id' | 'uploadedAt'>) => {
    const newFile: SupplierFile = {
      ...fileData,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
    };

    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { 
            ...supplier, 
            files: [...supplier.files, newFile],
            updatedAt: new Date().toISOString()
          }
        : supplier
    ));
  };

  const updateFile = (supplierId: string, fileId: string, updates: Partial<SupplierFile>) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { 
            ...supplier, 
            files: supplier.files.map(file => 
              file.id === fileId ? { ...file, ...updates } : file
            ),
            updatedAt: new Date().toISOString()
          }
        : supplier
    ));
  };

  const deleteFile = (supplierId: string, fileId: string) => {
    setSuppliers(prev => prev.map(supplier => 
      supplier.id === supplierId 
        ? { 
            ...supplier, 
            files: supplier.files.filter(f => f.id !== fileId),
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

  const getSuppliersByDepartment = (departmentId: string) => {
    return suppliers.filter(supplier => 
      supplier.departments.some(dept => dept.id === departmentId)
    );
  };

  const searchSuppliers = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return suppliers.filter(supplier => 
      supplier.tradeName.toLowerCase().includes(lowercaseQuery) ||
      supplier.corporateName.toLowerCase().includes(lowercaseQuery) ||
      supplier.notes.toLowerCase().includes(lowercaseQuery) ||
      supplier.category.name.toLowerCase().includes(lowercaseQuery) ||
      supplier.departments.some(dept => dept.name.toLowerCase().includes(lowercaseQuery))
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
      addFile,
      updateFile,
      deleteFile,
      getSupplierById,
      getSuppliersByCategory,
      getSuppliersByDepartment,
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
