import type { Material as DbMaterial, InsertMaterial, MaterialType } from '@shared/schema';

export interface MaterialFormData {
  title: string;
  description: string;
  typeId: string;
  categoryId: string;
  accessLevel: "public" | "restricted";
  
  // File content
  fileUrl: string;
  fileName: string;
  fileSize: number | null;
  fileType: string;
  
  // External/URL content
  externalUrl: string;
  
  // Embed content
  embedCode: string;
  embedUrl: string;
  
  // Video content
  videoUrl: string;
  videoDuration: number | null;
  videoThumbnail: string;
  
  tags: string[];
}

export interface MaterialFormProps {
  formData: MaterialFormData;
  setFormData: React.Dispatch<React.SetStateAction<MaterialFormData>>;
  onSubmit: (data: MaterialFormData) => void;
  editingMaterial: DbMaterial | null;
  materialTypes: MaterialType[];
  isOpen: boolean;
  onClose: () => void;
}

export interface MaterialListProps {
  materials: DbMaterial[];
  materialTypes: MaterialType[];
  onEdit: (material: DbMaterial) => void;
  onDelete: (id: number) => void;
  onView: (material: DbMaterial) => void;
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