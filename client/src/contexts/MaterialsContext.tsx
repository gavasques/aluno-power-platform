import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Material as DbMaterial, InsertMaterial } from '@shared/schema';

interface MaterialsContextType {
  materials: DbMaterial[];
  loading: boolean;
  error: string | null;
  addMaterial: (material: InsertMaterial) => Promise<void>;
  updateMaterial: (id: number, material: Partial<InsertMaterial>) => Promise<void>;
  deleteMaterial: (id: number) => Promise<void>;
  getMaterialById: (id: number) => DbMaterial | undefined;
  searchMaterials: (query: string) => DbMaterial[];
  refetch: () => void;
}

const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined);

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  const {
    data: materials = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/materials'],
    queryFn: () => apiRequest<DbMaterial[]>('/api/materials'),
  });

  const addMaterialMutation = useMutation({
    mutationFn: (material: InsertMaterial) =>
      apiRequest<DbMaterial>('/api/materials', {
        method: 'POST',
        body: JSON.stringify(material),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
    },
  });

  const updateMaterialMutation = useMutation({
    mutationFn: ({ id, material }: { id: number; material: Partial<InsertMaterial> }) =>
      apiRequest<DbMaterial>(`/api/materials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(material),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/materials/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
    },
  });

  const addMaterial = async (material: InsertMaterial): Promise<void> => {
    await addMaterialMutation.mutateAsync(material);
  };

  const updateMaterial = async (id: number, material: Partial<InsertMaterial>): Promise<void> => {
    await updateMaterialMutation.mutateAsync({ id, material });
  };

  const deleteMaterial = async (id: number): Promise<void> => {
    await deleteMaterialMutation.mutateAsync(id);
  };

  const getMaterialById = (id: number): DbMaterial | undefined => {
    return materials.find(material => material.id === id);
  };

  const searchMaterials = (query: string): DbMaterial[] => {
    if (!query) return materials;
    return materials.filter(material =>
      material.title?.toLowerCase().includes(query.toLowerCase()) ||
      material.description?.toLowerCase().includes(query.toLowerCase())
    );
  };

  const value: MaterialsContextType = {
    materials,
    loading,
    error: error?.message || null,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialById,
    searchMaterials,
    refetch,
  };

  return (
    <MaterialsContext.Provider value={value}>
      {children}
    </MaterialsContext.Provider>
  );
}

export function useMaterials() {
  const context = useContext(MaterialsContext);
  if (!context) {
    throw new Error('useMaterials must be used within a MaterialsProvider');
  }
  return context;
}