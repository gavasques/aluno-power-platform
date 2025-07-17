import { useQuery } from "@tanstack/react-query";
import type { ProductFormData } from "@/shared/types/product";

/**
 * Hook for fetching individual product data
 * Follows Single Responsibility Principle - only handles product fetching
 */
export function useProductQuery(productId: string) {
  return useQuery<ProductFormData>({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook for fetching products list with optimized caching
 */
export function useProductsListQuery() {
  return useQuery({
    queryKey: ['/api/products'],
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}