export interface InfographicData {
  productName: string;
  category: string;
  keyFeatures: string[];
  benefits: string[];
  targetAudience: string;
  brandColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  layout: 'vertical' | 'horizontal' | 'grid';
  style: 'modern' | 'minimalist' | 'bold' | 'professional';
}

export interface InfographicFormData {
  productName: string;
  category: string;
  keyFeatures: string;
  benefits: string;
  targetAudience: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  layout: string;
  style: string;
}

export interface InfographicGeneratorState {
  formData: InfographicFormData;
  loading: boolean;
  error: string | null;
  generatedImageUrl: string | null;
  showPreview: boolean;
  step: 'form' | 'generating' | 'preview';
}

export interface InfographicGeneratorActions {
  updateFormField: (field: keyof InfographicFormData, value: string) => void;
  generateInfographic: () => Promise<void>;
  downloadImage: () => void;
  resetForm: () => void;
  goToStep: (step: 'form' | 'generating' | 'preview') => void;
}

export const CATEGORIES = [
  'Eletrônicos',
  'Casa e Jardim',
  'Moda e Beleza',
  'Esportes e Lazer',
  'Livros e Mídia',
  'Saúde e Bem-estar',
  'Automotivo',
  'Brinquedos e Jogos',
  'Alimentos e Bebidas',
  'Escritório e Negócios'
];

export const LAYOUTS = [
  { value: 'vertical', label: 'Vertical', description: 'Layout em coluna única' },
  { value: 'horizontal', label: 'Horizontal', description: 'Layout em linha única' },
  { value: 'grid', label: 'Grade', description: 'Layout em grade 2x2' }
];

export const STYLES = [
  { value: 'modern', label: 'Moderno', description: 'Design contemporâneo com gradientes' },
  { value: 'minimalist', label: 'Minimalista', description: 'Design limpo e simples' },
  { value: 'bold', label: 'Ousado', description: 'Cores vibrantes e contrastes fortes' },
  { value: 'professional', label: 'Profissional', description: 'Design corporativo elegante' }
];