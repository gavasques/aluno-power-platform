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
  selectedAccess: string;
  materialTypes: MaterialType[];
  onSearchChange: (term: string) => void;
  onTypeChange: (type: string) => void;
  onAccessChange: (access: string) => void;
}

export interface MaterialGridProps {
  materials: DbMaterial[];
  materialTypes: MaterialType[];
  onView: (material: DbMaterial) => void;
  onDownload?: (material: DbMaterial) => void;
}