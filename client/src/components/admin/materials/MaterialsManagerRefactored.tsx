import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { apiRequest } from '@/lib/queryClient';
import { MaterialFilters } from './MaterialFilters';
import { MaterialList } from './MaterialList';
import { MaterialForm } from './MaterialForm';
import { MaterialViewer } from '../../user/materials/MaterialViewer';
import type { MaterialFormData } from './MaterialFormTypes';
import type { Material as DbMaterial, MaterialType, InsertMaterial } from '@shared/schema';

const MaterialsManagerRefactored = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedAccess, setSelectedAccess] = useState("all");
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<DbMaterial | null>(null);
  
  // Viewer states
  const [viewingMaterial, setViewingMaterial] = useState<DbMaterial | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState<MaterialFormData>({
    title: "",
    description: "",
    typeId: "",
    accessLevel: "public",
    fileUrl: "",
    fileName: "",
    fileSize: null,
    fileType: "",
    externalUrl: "",
    embedCode: "",
    embedUrl: "",
    videoUrl: "",
    videoDuration: null,
    videoThumbnail: "",
    tags: [],
  });

  // Fetch materials
  const { data: materials = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['/api/materials'],
    queryFn: () => apiRequest<DbMaterial[]>('/api/materials'),
  });

  // Fetch material types
  const { data: materialTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: ['/api/material-types'],
    queryFn: () => apiRequest<MaterialType[]>('/api/material-types'),
  });

  const filteredMaterials = materials.filter(material => {
    const matchesSearch = material.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || material.typeId === parseInt(selectedType);
    const matchesAccess = selectedAccess === "all" || material.accessLevel === selectedAccess;
    return matchesSearch && matchesType && matchesAccess;
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      typeId: "",
      accessLevel: "public",
      fileUrl: "",
      fileName: "",
      fileSize: null,
      fileType: "",
      externalUrl: "",
      embedCode: "",
      embedUrl: "",
      videoUrl: "",
      videoDuration: null,
      videoThumbnail: "",
      tags: [],
    });
    setEditingMaterial(null);
  };

  const addMaterialMutation = useMutation({
    mutationFn: (material: InsertMaterial) =>
      apiRequest<DbMaterial>('/api/materials', {
        method: 'POST',
        body: JSON.stringify(material),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Sucesso",
        description: "Material criado com sucesso!",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar material.",
        variant: "destructive",
      });
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
      toast({
        title: "Sucesso",
        description: "Material atualizado com sucesso!",
      });
      setIsDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar material.",
        variant: "destructive",
      });
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/materials/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/materials'] });
      toast({
        title: "Sucesso",
        description: "Material excluído com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir material.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (data: MaterialFormData) => {
    if (!data.title || !data.typeId) {
      toast({
        title: "Erro",
        description: "Título e tipo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const materialData: InsertMaterial = {
      title: data.title,
      description: data.description,
      typeId: parseInt(data.typeId),
      accessLevel: data.accessLevel,
      fileUrl: data.fileUrl || null,
      fileName: data.fileName || null,
      fileSize: data.fileSize,
      fileType: data.fileType || null,
      externalUrl: data.externalUrl || null,
      embedCode: data.embedCode || null,
      embedUrl: data.embedUrl || null,
      videoUrl: data.videoUrl || null,
      videoDuration: data.videoDuration,
      videoThumbnail: data.videoThumbnail || null,
      tags: data.tags.length > 0 ? data.tags : null,
      uploadedBy: user?.id || 1,
    };

    if (editingMaterial) {
      updateMaterialMutation.mutate({ id: editingMaterial.id, material: materialData });
    } else {
      addMaterialMutation.mutate(materialData);
    }
  };

  const handleEdit = (material: DbMaterial) => {
    setFormData({
      title: material.title || "",
      description: material.description || "",
      typeId: material.typeId.toString(),
      accessLevel: material.accessLevel as "public" | "restricted",
      fileUrl: material.fileUrl || "",
      fileName: material.fileName || "",
      fileSize: material.fileSize,
      fileType: material.fileType || "",
      externalUrl: material.externalUrl || "",
      embedCode: material.embedCode || "",
      embedUrl: material.embedUrl || "",
      videoUrl: material.videoUrl || "",
      videoDuration: material.videoDuration,
      videoThumbnail: material.videoThumbnail || "",
      tags: material.tags || [],
    });
    setEditingMaterial(material);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      deleteMaterialMutation.mutate(id);
    }
  };

  const handleView = (material: DbMaterial) => {
    setViewingMaterial(material);
    setIsViewerOpen(true);
  };

  const handleCloseViewer = () => {
    setIsViewerOpen(false);
    setViewingMaterial(null);
  };

  const handleCreateNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const isLoading = materialsLoading || typesLoading;

  const getMaterialType = (typeId: number) => {
    return materialTypes.find(t => t.id === typeId);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                Gerenciar Materiais
              </CardTitle>
              <CardDescription>
                Gerencie os materiais disponíveis na plataforma
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!isLoading && (
            <>
              <MaterialFilters
                searchTerm={searchTerm}
                selectedType={selectedType}
                selectedAccess={selectedAccess}
                materialTypes={materialTypes}
                onSearchChange={setSearchTerm}
                onTypeChange={setSelectedType}
                onAccessChange={setSelectedAccess}
              />
              
              <MaterialList
                materials={filteredMaterials}
                materialTypes={materialTypes}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
              />
            </>
          )}
          
          {isLoading && (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Carregando materiais...</div>
            </div>
          )}
        </CardContent>
      </Card>

      <MaterialForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        editingMaterial={editingMaterial}
        materialTypes={materialTypes}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />

      {viewingMaterial && (
        <MaterialViewer
          material={viewingMaterial}
          materialType={getMaterialType(viewingMaterial.typeId)!}
          isOpen={isViewerOpen}
          onClose={handleCloseViewer}
        />
      )}
    </div>
  );
};

export default MaterialsManagerRefactored;