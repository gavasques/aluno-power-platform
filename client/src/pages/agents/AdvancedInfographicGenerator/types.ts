export interface ProductData {
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  effortLevel: 'normal' | 'high';
}

export interface ConceptData {
  id: string;
  title: string;
  subtitle: string;
  focusType: string;
  keyPoints: string[];
  colorPalette: Record<string, string>;
  layoutSpecs: Record<string, any>;
  recommended: boolean;
}

export interface InfographicSession {
  step: 'input' | 'concepts' | 'prompt' | 'generating' | 'completed';
  productData?: ProductData;
  analysisId?: string;
  concepts?: ConceptData[];
  selectedConceptId?: string;
  generationId?: string;
  finalImageUrl?: string;
  imageFile?: File;
}

export interface InfographicState {
  session: InfographicSession;
  loading: boolean;
  uploadedImage: File | null;
  imagePreview: string | null;
  showProcessingModal: boolean;
  formData: {
    productName: string;
    description: string;
    category: string;
    targetAudience: string;
  };
}

export interface InfographicActions {
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFormSubmit: () => Promise<void>;
  handleConceptSelect: (conceptId: string) => void;
  generateInfographic: () => Promise<void>;
  resetSession: () => void;
  updateFormField: (field: keyof InfographicState['formData'], value: string) => void;
  downloadImage: () => void;
}