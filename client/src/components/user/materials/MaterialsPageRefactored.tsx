import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { MaterialFilters } from './MaterialFilters';
import { MaterialGrid } from './MaterialGrid';
import type { Material as DbMaterial, MaterialType } from '@shared/schema';

const MaterialsPageRefactored = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch materials
  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['/api/materials'],
    queryFn: () => apiRequest<DbMaterial[]>('/api/materials'),
  });



  // Fetch material categories
  const { data: materialCategories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/material-categories'],
    queryFn: () => apiRequest<any[]>('/api/material-categories'),
  });

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || material.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  // Increment view count mutation
  const incrementViewMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/materials/${id}/view`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
    },
  });

  // Increment download count mutation
  const incrementDownloadMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/materials/${id}/download`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
    },
  });

  const handleView = (material: DbMaterial) => {
    navigate(`/hub/materials/${material.id}`);
  };

  const handleDownload = (material: DbMaterial) => {
    incrementDownloadMutation.mutate(material.id);
  };

  const isLoading = materialsLoading || categoriesLoading;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Hub de Recursos</h1>
          <p className="text-lg text-gray-600">
            Acesse materiais educacionais, vídeos, documentos e recursos para crescer seu negócio
          </p>
        </div>

        {!isLoading && (
          <>
            <MaterialFilters
              searchTerm={searchTerm}
              selectedCategory={selectedCategory}
              materialCategories={materialCategories}
              onSearchChange={setSearchTerm}
              onCategoryChange={setSelectedCategory}
            />

            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 'is' : ''} encontrado{filteredMaterials.length !== 1 ? 's' : ''}
                </span>
                {(searchTerm || selectedCategory !== "all") && (
                  <Badge variant="secondary" className="text-xs">
                    Filtrado
                  </Badge>
                )}
              </div>
            </div>

            <MaterialGrid
              materials={filteredMaterials}
              onView={handleView}
              onDownload={handleDownload}
            />
          </>
        )}

        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="text-gray-500">Carregando materiais...</div>
          </div>
        )}


      </div>
    </div>
  );
};

export default MaterialsPageRefactored;