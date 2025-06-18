import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MaterialFilters } from './MaterialFilters';
import { MaterialGrid } from './MaterialGrid';
import { MaterialViewer } from './MaterialViewer';
import { useMaterials } from '@/hooks/useMaterials';
import { useMaterialTypes } from '@/hooks/useMaterialTypes';
import { useMaterialCategories } from '@/hooks/useMaterialCategories';
import { useMaterialFilters } from '@/hooks/useMaterialFilters';
import { useMaterialViewer } from '@/hooks/useMaterialViewer';
import { useMaterialActions } from '@/hooks/useMaterialActions';

const MaterialsPage = () => {
  const navigate = useNavigate();
  
  // Data hooks
  const { materials, isLoading: materialsLoading } = useMaterials();
  const { materialTypes, isLoading: typesLoading } = useMaterialTypes();
  const { materialCategories, isLoading: categoriesLoading } = useMaterialCategories();
  
  // Filter hook with category support
  const {
    searchTerm,
    selectedType,
    selectedAccess,
    filteredMaterials,
    setSearchTerm,
    setSelectedType,
    setSelectedAccess,
  } = useMaterialFilters(materials);
  
  // Additional category filter state
  const [selectedCategory, setSelectedCategory] = React.useState("all");
  
  // Enhanced filtered materials with category filter
  const finalFilteredMaterials = React.useMemo(() => {
    return filteredMaterials.filter(material => {
      const matchesCategory = selectedCategory === "all" || material.categoryId === parseInt(selectedCategory);
      return matchesCategory;
    });
  }, [filteredMaterials, selectedCategory]);
  
  // Viewer and actions hooks
  const { viewingMaterial, isViewerOpen, openViewer, closeViewer } = useMaterialViewer();
  const { incrementView, incrementDownload } = useMaterialActions();

  const handleViewMaterial = (material: any) => {
    incrementView(material.id);
    openViewer(material);
  };

  const handleNavigateToMaterial = (material: any) => {
    incrementView(material.id);
    navigate(`/materials/${material.id}`);
  };

  const handleDownloadMaterial = (material: any) => {
    incrementDownload(material.id);
    if (material.fileUrl) {
      window.open(material.fileUrl, '_blank');
    }
  };

  if (materialsLoading || typesLoading || categoriesLoading) {
    return <div>Carregando...</div>;
  }

  const viewingMaterialType = viewingMaterial 
    ? materialTypes.find(type => type.id === viewingMaterial.typeId)
    : null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Biblioteca de Materiais
            <Badge variant="secondary">
              {finalFilteredMaterials.length} material{finalFilteredMaterials.length !== 1 ? 'is' : ''}
            </Badge>
          </CardTitle>
          <CardDescription>
            Explore todos os materiais disponíveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <MaterialFilters
            searchTerm={searchTerm}
            selectedType={selectedType}
            selectedCategory={selectedCategory}
            selectedAccess={selectedAccess}
            materialTypes={materialTypes}
            materialCategories={materialCategories}
            onSearchChange={setSearchTerm}
            onTypeChange={setSelectedType}
            onCategoryChange={setSelectedCategory}
            onAccessChange={setSelectedAccess}
          />
          
          <MaterialGrid
            materials={finalFilteredMaterials}
            materialTypes={materialTypes}
            onView={handleViewMaterial}
            onNavigate={handleNavigateToMaterial}
            onDownload={handleDownloadMaterial}
          />
        </CardContent>
      </Card>

      {viewingMaterial && viewingMaterialType && (
        <MaterialViewer
          material={viewingMaterial}
          materialType={viewingMaterialType}
          isOpen={isViewerOpen}
          onClose={closeViewer}
        />
      )}
    </div>
  );
};

export default MaterialsPage;