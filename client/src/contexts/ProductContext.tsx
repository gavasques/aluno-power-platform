import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Product as DbProduct, InsertProduct } from '@shared/schema';

interface ProductContextType {
  products: DbProduct[];
  loading: boolean;
  error: string | null;
  addProduct: (product: InsertProduct) => Promise<void>;
  updateProduct: (id: string, product: Partial<InsertProduct>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductStatus: (id: string) => Promise<void>;
  getProductById: (id: string) => DbProduct | undefined;
  searchProducts: (query: string) => DbProduct[];
  refetch: () => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  const {
    data: products = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/products'],
    queryFn: () => apiRequest<DbProduct[]>('/api/products'),
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  const addProductMutation = useMutation({
    mutationFn: (product: InsertProduct) =>
      apiRequest<DbProduct>('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: ({ id, product }: { id: string; product: Partial<InsertProduct> }) =>
      apiRequest<DbProduct>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/api/products/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const toggleProductStatusMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest<DbProduct>(`/api/products/${id}/toggle-status`, {
        method: 'PATCH',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const addProduct = async (product: InsertProduct): Promise<void> => {
    await addProductMutation.mutateAsync(product);
  };

  const updateProduct = async (id: string, product: Partial<InsertProduct>): Promise<void> => {
    await updateProductMutation.mutateAsync({ id, product });
  };

  const deleteProduct = async (id: string): Promise<void> => {
    await deleteProductMutation.mutateAsync(id);
  };

  const toggleProductStatus = async (id: string): Promise<void> => {
    await toggleProductStatusMutation.mutateAsync(id);
  };

  const getProductById = (id: string): DbProduct | undefined => {
    return products.find(product => product.id === parseInt(id));
  };

  const searchProducts = (query: string): DbProduct[] => {
    if (!query) return products;
    return products.filter(product =>
      product.name?.toLowerCase().includes(query.toLowerCase()) ||
      (typeof product.descriptions === 'string' && product.descriptions.toLowerCase().includes(query.toLowerCase()))
    );
  };

  const value: ProductContextType = {
    products,
    loading,
    error: error?.message || null,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    getProductById,
    searchProducts,
    refetch,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};