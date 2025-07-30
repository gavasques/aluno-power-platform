/**
 * Types para AdvancedInfographicGenerator
 * Centralizando tipos para melhor organização
 */

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

// Estado unificado para o componente
export interface InfographicState {
  ui: {
    loading: boolean;
    showProcessingModal: boolean;
  };
  session: InfographicSession;
  form: {
    productName: string;
    description: string;
    category: string;
    targetAudience: string;
  };
  upload: {
    file: File | null;
    preview: string | null;
  };
}

// Actions para o reducer
export type InfographicAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SHOW_PROCESSING_MODAL'; payload: boolean }
  | { type: 'UPDATE_FORM_FIELD'; field: keyof InfographicState['form']; value: string }
  | { type: 'SET_UPLOAD'; payload: { file: File | null; preview: string | null } }
  | { type: 'UPDATE_SESSION'; payload: Partial<InfographicSession> }
  | { type: 'ADVANCE_STEP'; payload: InfographicSession['step'] }
  | { type: 'RESET_FORM' };