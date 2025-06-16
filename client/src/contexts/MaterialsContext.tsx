import React, { createContext, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Material as DbMaterial, InsertMaterial } from '@shared/schema';

interface MaterialFilters {
  search?: string;
  typeId?: string;
  accessLevel?: string;
}

interface MaterialsContextType {
  materials: DbMaterial[];
  materialTypes: any[];
  loading: boolean;
  error: string | null;
  filters: MaterialFilters;
  addMaterial: (material: InsertMaterial) => Promise<void>;
  updateMaterial: (id: number, material: Partial<InsertMaterial>) => Promise<void>;
  deleteMaterial: (id: number) => Promise<void>;
  getMaterialById: (id: number) => DbMaterial | undefined;
  searchMaterials: (query: string) => DbMaterial[];
  setFilters: (filters: Partial<MaterialFilters>) => void;
  getFilteredMaterials: () => DbMaterial[];
  incrementDownload: (id: number) => void;
  refetch: () => void;
}

const MaterialsContext = createContext<MaterialsContextType | undefined>(undefined);

export function MaterialsProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [filters, setFiltersState] = React.useState<MaterialFilters>({});

  const {
    data: materials = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ['/api/materials'],
    queryFn: () => apiRequest<DbMaterial[]>('/api/materials'),
  });

  // Mock material types for now - should come from API
  const materialTypes = [
    { id: '1', name: 'E-books' },
    { id: '2', name: 'Templates' },
    { id: '3', name: 'Vídeos' },
    { id: '4', name: 'Planilhas' },
  ];

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

  const setFilters = (newFilters: Partial<MaterialFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
  };

  const getFilteredMaterials = (): DbMaterial[] => {
    let filtered = materials;

    if (filters.search) {
      filtered = filtered.filter(material =>
        material.title?.toLowerCase().includes(filters.search!.toLowerCase()) ||
        material.description?.toLowerCase().includes(filters.search!.toLowerCase())
      );
    }

    if (filters.typeId && filters.typeId !== "all") {
      filtered = filtered.filter(material => material.typeId?.toString() === filters.typeId);
    }

    if (filters.accessLevel && filters.accessLevel !== "all") {
      filtered = filtered.filter(material => material.accessLevel === filters.accessLevel);
    }

    return filtered;
  };

  const incrementDownload = (id: number) => {
    // This would typically update the download count in the database
    console.log(`Incrementing download count for material ${id}`);
  };

  const value: MaterialsContextType = {
    materials,
    materialTypes,
    loading,
    error: error?.message || null,
    filters,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    getMaterialById,
    searchMaterials,
    setFilters,
    getFilteredMaterials,
    incrementDownload,
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