/**
 * HOOK: useSupplierProducts
 * Gerencia produtos de fornecedores com CRUD completo
 * Extraído de SupplierProductsTabSimple.tsx para modularização
 */
import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

// ===== TYPES =====
export interface SupplierProduct {
  id: number;
  supplierSku: string;
  productName: string;
  cost: string | number;
  leadTime?: number;
  minimumOrderQuantity?: number;
  masterBox?: string;
  stock?: string;
  linkStatus: 'linked' | 'pending' | 'not_found';
  description?: string;
  category?: string;
  brand?: string;
  dimensions?: string;
  weight?: string;
  supplierId: number;
}

export interface ProductFilters {
  search: string;
  linkStatus: string;
  category: string;
}

export interface UseSupplierProductsReturn {
  // Data State
  products: SupplierProduct[];
  filteredProducts: SupplierProduct[];
  isLoading: boolean;
  error: string | null;
  
  // Filters
  filters: ProductFilters;
  setFilters: (filters: Partial<ProductFilters>) => void;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  pageSize: number;
  setCurrentPage: (page: number) => void;
  paginatedProducts: SupplierProduct[];
  
  // Actions
  createProduct: (product: Partial<SupplierProduct>) => Promise<void>;
  updateProduct: (product: SupplierProduct) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;
  
  // Import/Export
  handleFileUpload: (file: File) => Promise<void>;
  exportToExcel: () => void;
  
  // Loading States
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

// ===== UTILITY FUNCTIONS =====
const formatCurrency = (value: string | number | null | undefined): string => {
  if (!value || value === '') return '-';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '-';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

const parseBrazilianCurrency = (value: string): string => {
  if (!value) return '';
  return value.replace(/[R$\s.]/g, '').replace(',', '.');
};

// ===== MAIN HOOK =====
export const useSupplierProducts = (supplierId: number): UseSupplierProductsReturn => {
  // ===== STATE MANAGEMENT =====
  const [filters, setFiltersState] = useState<ProductFilters>({
    search: '',
    linkStatus: '',
    category: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  // ===== HOOKS INTEGRATION =====
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // ===== DATA FETCHING =====
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['supplier-products', supplierId],
    queryFn: async () => {
      const response = await fetch(`/api/suppliers/${supplierId}/products`);
      if (!response.ok) throw new Error('Erro ao carregar produtos');
      return response.json();
    },
    enabled: !!supplierId
  });

  // ===== MUTATIONS =====
  const createMutation = useMutation({
    mutationFn: async (product: Partial<SupplierProduct>) => {
      const response = await fetch(`/api/suppliers/${supplierId}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Erro ao criar produto');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products', supplierId] });
      toast({ title: 'Produto criado com sucesso!', variant: 'default' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao criar produto', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (product: SupplierProduct) => {
      const response = await fetch(`/api/suppliers/${supplierId}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!response.ok) throw new Error('Erro ao atualizar produto');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products', supplierId] });
      toast({ title: 'Produto atualizado com sucesso!', variant: 'default' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao atualizar produto', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (productId: number) => {
      const response = await fetch(`/api/suppliers/${supplierId}/products/${productId}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Erro ao remover produto');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier-products', supplierId] });
      toast({ title: 'Produto removido com sucesso!', variant: 'default' });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Erro ao remover produto', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // ===== COMPUTED VALUES =====
  const filteredProducts = useMemo(() => {
    return products.filter((product: SupplierProduct) => {
      const matchesSearch = !filters.search || 
        product.productName.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.supplierSku.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesStatus = !filters.linkStatus || product.linkStatus === filters.linkStatus;
      const matchesCategory = !filters.category || product.category === filters.category;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [products, filters]);

  const totalPages = Math.ceil(filteredProducts.length / pageSize);
  
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, pageSize]);

  // ===== ACTIONS =====
  const setFilters = useCallback((newFilters: Partial<ProductFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filtering
  }, []);

  const createProduct = useCallback(async (product: Partial<SupplierProduct>) => {
    await createMutation.mutateAsync(product);
  }, [createMutation]);

  const updateProduct = useCallback(async (product: SupplierProduct) => {
    await updateMutation.mutateAsync(product);
  }, [updateMutation]);

  const deleteProduct = useCallback(async (productId: number) => {
    await deleteMutation.mutateAsync(productId);
  }, [deleteMutation]);

  // ===== IMPORT/EXPORT ACTIONS =====
  const handleFileUpload = useCallback(async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // Process and validate data
      const productsToImport = jsonData.map((row: any) => ({
        supplierSku: row['Código SKU'] || row['SKU'] || '',
        productName: row['Nome do Produto'] || row['Produto'] || '',
        cost: parseBrazilianCurrency(row['Custo']?.toString() || '0'),
        leadTime: parseInt(row['Lead Time'] || '0') || undefined,
        minimumOrderQuantity: parseInt(row['Qtd Mínima'] || '0') || undefined,
        masterBox: row['Master Box'] || '',
        stock: row['Estoque'] || '',
        description: row['Descrição'] || '',
        category: row['Categoria'] || '',
        brand: row['Marca'] || '',
        dimensions: row['Dimensões'] || '',
        weight: row['Peso'] || '',
        linkStatus: 'pending' as const
      }));

      // Batch create products
      for (const product of productsToImport) {
        if (product.supplierSku && product.productName) {
          await createProduct(product);
        }
      }

      toast({
        title: 'Importação concluída!',
        description: `${productsToImport.length} produtos foram importados`,
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro na importação',
        description: 'Verifique se o arquivo Excel está no formato correto',
        variant: 'destructive'
      });
    }
  }, [createProduct, toast]);

  const exportToExcel = useCallback(() => {
    try {
      const exportData = filteredProducts.map(product => ({
        'Código SKU': product.supplierSku,
        'Nome do Produto': product.productName,
        'Custo': formatCurrency(product.cost),
        'Lead Time': product.leadTime ? `${product.leadTime} dias` : '',
        'Qtd Mínima': product.minimumOrderQuantity || '',
        'Master Box': product.masterBox || '',
        'Estoque': product.stock || '',
        'Status Vinculação': product.linkStatus === 'linked' ? 'Vinculado' :
                            product.linkStatus === 'pending' ? 'Pendente' : 'Não encontrado',
        'Categoria': product.category || '',
        'Marca': product.brand || '',
        'Descrição': product.description || ''
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');
      XLSX.writeFile(workbook, `produtos-fornecedor-${supplierId}.xlsx`);

      toast({
        title: 'Exportação concluída!',
        description: 'Arquivo Excel foi baixado com sucesso',
        variant: 'default'
      });
    } catch (error) {
      toast({
        title: 'Erro na exportação',
        description: 'Não foi possível gerar o arquivo Excel',
        variant: 'destructive'
      });
    }
  }, [filteredProducts, supplierId, toast]);

  // ===== RETURN INTERFACE =====
  return {
    // Data State
    products,
    filteredProducts,
    isLoading,
    error: error?.message || null,
    
    // Filters
    filters,
    setFilters,
    
    // Pagination
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    paginatedProducts,
    
    // Actions
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Import/Export
    handleFileUpload,
    exportToExcel,
    
    // Loading States
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};