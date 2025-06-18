import type { Tool as DbTool, InsertTool } from '@shared/schema';

export interface ToolFormData {
  name: string;
  description: string;
  typeId: string;
  logo: string;
  website: string;
  features: string[];
  pros: string[];
  cons: string[];
  brazilSupport: "works" | "partial" | "no";
  verified: boolean;
}

export interface ToolFormProps {
  formData: ToolFormData;
  setFormData: React.Dispatch<React.SetStateAction<ToolFormData>>;
  onSubmit: (data: ToolFormData) => void;
  editingTool: DbTool | null;
  toolTypes: Array<{ id: number; name: string }>;
  isOpen: boolean;
  onClose: () => void;
}

export interface ToolListProps {
  tools: DbTool[];
  toolTypes: Array<{ id: number; name: string }>;
  onEdit: (tool: DbTool) => void;
  onDelete: (id: number) => void;
}

export interface ToolFiltersProps {
  searchTerm: string;
  selectedType: string;
  toolTypes: Array<{ id: number; name: string }>;
  onSearchChange: (term: string) => void;
  onTypeChange: (type: string) => void;
}