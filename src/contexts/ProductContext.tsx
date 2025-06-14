
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Product } from '@/types/product';

// Mock product data inicial
const initialProducts: Product[] = [
  {
    id: "1",
    name: "Smartphone Samsung Galaxy S23",
    photo: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&h=200&fit=crop",
    ean: "7899999999999",
    dimensions: { length: 15, width: 8, height: 3 },
    weight: 0.5,
    brand: "Samsung",
    category: "Eletrônicos",
    supplierId: "1",
    ncm: "85171200",
    costItem: 800,
    packCost: 15,
    taxPercent: 18,
    active: true,
    channels: {
      sitePropio: {
        enabled: true,
        commissionPct: 0,
        fixedFee: 5,
        otherPct: 2,
        otherValue: 0,
        adsPct: 8,
        salePrice: 1299,
        gatewayPct: 3.5
      },
      amazonFBA: {
        enabled: true,
        commissionPct: 15,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 10,
        inboundFreight: 25,
        prepCenter: 8,
        salePrice: 1499
      },
      mlFull: {
        enabled: true,
        commissionPct: 14,
        fixedFee: 0,
        otherPct: 0,
        otherValue: 0,
        adsPct: 12,
        inboundFreight: 20,
        prepCenter: 5,
        salePrice: 1399
      }
    },
    createdAt: "2024-01-15"
  }
];

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  updateProduct: (id: string, product: Product) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.random().toString(36).substr(2, 9),
      active: true, // Garantir que novos produtos sejam ativos
      createdAt: new Date().toISOString()
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  const updateProduct = (id: string, updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleProductStatus = (id: string) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const getProductById = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct,
      toggleProductStatus,
      getProductById
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
