import type { Material as DbMaterial, MaterialType } from '@shared/schema';

export interface MaterialViewerProps {
  material: DbMaterial;
  materialType: MaterialType;
}

export interface MaterialCardProps {
  material: DbMaterial;
  materialType: MaterialType;
  onView: (material: DbMaterial) => void;
  onDownload?: (material: DbMaterial) => void;
}

export interface MaterialFiltersProps {
  searchTerm: string;
  selectedType: string;
  selectedCategory: string;
  selectedAccess: string;
  materialTypes: MaterialType[];
  materialCategories: any[];
  onSearchChange: (term: string) => void;
  onTypeChange: (type: string) => void;
  onCategoryChange: (category: string) => void;
  onAccessChange: (access: string) => void;
}

export interface MaterialGridProps {
  materials: DbMaterial[];
  materialTypes: MaterialType[];
  onView: (material: DbMaterial) => void;
  onDownload?: (material: DbMaterial) => void;
}