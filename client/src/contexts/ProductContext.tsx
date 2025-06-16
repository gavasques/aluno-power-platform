import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Product as DbProduct, InsertProduct } from '@shared/schema';

interface ProductContextType {
  products: DbProduct[];
  loading: boolean;
  error: string | null;
  addProduct: (product: InsertProduct) => Promise<void>;
  updateProduct: (id: number, product: Partial<InsertProduct>) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProductById: (id: number) => DbProduct | undefined;
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
    mutationFn: ({ id, product }: { id: number; product: Partial<InsertProduct> }) =>
      apiRequest<DbProduct>(`/api/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/products/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
    },
  });

  const addProduct = async (product: InsertProduct): Promise<void> => {
    await addProductMutation.mutateAsync(product);
  };

  const updateProduct = async (id: number, product: Partial<InsertProduct>): Promise<void> => {
    await updateProductMutation.mutateAsync({ id, product });
  };

  const deleteProduct = async (id: number): Promise<void> => {
    await deleteProductMutation.mutateAsync(id);
  };

  const getProductById = (id: number): DbProduct | undefined => {
    return products.find(product => product.id === id);
  };

  const searchProducts = (query: string): DbProduct[] => {
    if (!query) return products;
    return products.filter(product =>
      product.name?.toLowerCase().includes(query.toLowerCase()) ||
      product.descriptions?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const value: ProductContextType = {
    products,
    loading,
    error: error?.message || null,
    addProduct,
    updateProduct,
    deleteProduct,
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