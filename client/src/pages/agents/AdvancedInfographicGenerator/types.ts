export interface ProductInfo {
  productName: string;
  category: string;
  description: string;
  targetAudience: string;
  keyFeatures: string[];
  price: string;
  benefits: string[];
}

export interface ConceptInfo {
  title: string;
  description: string;
  style: string;
  colorScheme: string;
  layout: string;
  elements: string[];
}

export interface AdvancedInfographicState {
  currentStep: 'product' | 'concept' | 'generation' | 'preview';
  productInfo: ProductInfo;
  conceptInfo: ConceptInfo;
  generatedContent: string | null;
  generatedImageUrl: string | null;
  loading: boolean;
  error: string | null;
  progress: number;
}

export interface AdvancedInfographicActions {
  updateProductInfo: (field: keyof ProductInfo, value: any) => void;
  updateConceptInfo: (field: keyof ConceptInfo, value: any) => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: AdvancedInfographicState['currentStep']) => void;
  generateInfographic: () => Promise<void>;
  downloadInfographic: () => void;
  resetGenerator: () => void;
}

export const INFOGRAPHIC_STYLES = [
  'Moderno e Minimalista',
  'Colorido e Vibrante',
  'Profissional e Corporativo',
  'Criativo e Artístico',
  'Tecnológico e Futurista',
  'Elegante e Sofisticado'
];

export const COLOR_SCHEMES = [
  'Azul e Branco',
  'Verde e Dourado',
  'Roxo e Rosa',
  'Laranja e Amarelo',
  'Vermelho e Preto',
  'Tons de Cinza',
  'Multicolorido'
];

export const LAYOUT_OPTIONS = [
  'Vertical (Stories)',
  'Horizontal (Banner)',
  'Quadrado (Post)',
  'Infográfico Longo',
  'Comparativo',
  'Timeline'
];

export const CATEGORIES = [
  'Eletrônicos',
  'Casa e Jardim',
  'Moda e Acessórios',
  'Esportes e Lazer',
  'Saúde e Beleza',
  'Automotivo',
  'Brinquedos',
  'Alimentos',
  'Tecnologia',
  'Outros'
];

export const STEP_CONFIG = [
  { id: 'product', title: 'Informações do Produto', description: 'Defina os detalhes do produto' },
  { id: 'concept', title: 'Conceito Visual', description: 'Escolha o estilo e layout' },
  { id: 'generation', title: 'Geração', description: 'Criando seu infográfico' },
  { id: 'preview', title: 'Resultado', description: 'Visualize e baixe' }
];