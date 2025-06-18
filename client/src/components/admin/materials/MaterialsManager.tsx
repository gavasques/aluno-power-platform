import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { MaterialFilters } from './MaterialFilters';
import { MaterialList } from './MaterialList';
import { MaterialForm } from './MaterialForm';
import { MaterialViewer } from '../../user/materials/MaterialViewer';
import { useMaterials } from '@/hooks/useMaterials';
import { useMaterialTypes } from '@/hooks/useMaterialTypes';
import { useMaterialCategories } from '@/hooks/useMaterialCategories';
import { useMaterialForm } from '@/hooks/useMaterialForm';
import { useMaterialFilters } from '@/hooks/useMaterialFilters';
import { useMaterialViewer } from '@/hooks/useMaterialViewer';

const MaterialsManager = () => {
  const { user } = useAuth();
  
  // Data hooks
  const { materials, isLoading: materialsLoading, addMaterial, updateMaterial, deleteMaterial } = useMaterials();
  const { materialTypes, isLoading: typesLoading } = useMaterialTypes();
  const { materialCategories, isLoading: categoriesLoading } = useMaterialCategories();
  
  // State management hooks
  const {
    formData,
    setFormData,
    editingMaterial,
    isDialogOpen,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    validateForm,
    getInsertMaterialData,
  } = useMaterialForm();
  
  const {
    searchTerm,
    selectedType,
    selectedAccess,
    filteredMaterials,
    setSearchTerm,
    setSelectedType,
    setSelectedAccess,
  } = useMaterialFilters(materials);
  
  const {
    viewingMaterial,
    isViewerOpen,
    openViewer,
    closeViewer,
  } = useMaterialViewer();

  const handleSubmit = (formData: any) => {
    const { isValid, errors } = validateForm();
    
    if (!isValid) {
      console.error('Form validation errors:', errors);
      return;
    }

    if (!user?.id) {
      console.error('User not authenticated');
      return;
    }

    const materialData = getInsertMaterialData(user.id);

    if (editingMaterial) {
      updateMaterial({ id: editingMaterial.id, material: materialData });
    } else {
      addMaterial(materialData);
    }
    
    closeDialog();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      deleteMaterial(id);
    }
  };

  if (materialsLoading || typesLoading || categoriesLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Gerenciar Materiais
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          </CardTitle>
          <CardDescription>
            Gerencie todos os materiais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            onEdit={openEditDialog}
            onDelete={handleDelete}
            onView={openViewer}
          />
        </CardContent>
      </Card>

      <MaterialForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        editingMaterial={editingMaterial}
        materialTypes={materialTypes}
        isOpen={isDialogOpen}
        onClose={closeDialog}
      />

      {viewingMaterial && (
        <MaterialViewer
          material={viewingMaterial}
          materialType={materialTypes.find(type => type.id === viewingMaterial.typeId)!}
          isOpen={isViewerOpen}
          onClose={closeViewer}
        />
      )}
    </div>
  );
};

export default MaterialsManager;