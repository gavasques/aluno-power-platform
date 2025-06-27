export interface AmazonReview {
  id: string;
  asin: string;
  productTitle: string;
  reviewText: string;
  rating: number;
  reviewDate: string;
  verified: boolean;
  helpful: number;
  vine: boolean;
}

export interface ProductConfig {
  productName: string;
  category: AmazonCategory;
  targetAudience: string;
  keyFeatures: string[];
  mainBenefits: string[];
  priceRange: string;
  competitors: string[];
  marketplace: AmazonMarketplace;
  aiModel: AIModel;
}

export interface GeneratedContent {
  titles: GeneratedTitle[];
  bulletPoints: string[];
  description: string;
  keywords: string[];
  searchTerms: string[];
  insights: ProductInsight[];
}

export interface GeneratedTitle {
  id: string;
  title: string;
  score: number;
  reasoning: string;
  length: number;
}

export interface ProductInsight {
  type: InsightType;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  category: 'optimization' | 'competition' | 'audience' | 'keywords';
}

export enum AmazonCategory {
  ELECTRONICS = 'electronics',
  HOME_KITCHEN = 'home_kitchen',
  SPORTS_OUTDOORS = 'sports_outdoors',
  BEAUTY_PERSONAL = 'beauty_personal',
  AUTOMOTIVE = 'automotive',
  TOYS_GAMES = 'toys_games',
  CLOTHING = 'clothing',
  BOOKS = 'books',
  HEALTH_HOUSEHOLD = 'health_household',
  OFFICE_PRODUCTS = 'office_products'
}

export enum AmazonMarketplace {
  US = 'us',
  BR = 'br',
  CA = 'ca',
  UK = 'uk',
  DE = 'de',
  FR = 'fr',
  IT = 'it',
  ES = 'es',
  MX = 'mx',
  JP = 'jp'
}

export enum AIModel {
  GPT4 = 'gpt-4',
  GPT35_TURBO = 'gpt-3.5-turbo',
  CLAUDE_3 = 'claude-3',
  GEMINI_PRO = 'gemini-pro'
}

export enum InsightType {
  KEYWORD_OPPORTUNITY = 'keyword_opportunity',
  COMPETITOR_GAP = 'competitor_gap',
  AUDIENCE_BEHAVIOR = 'audience_behavior',
  CONTENT_OPTIMIZATION = 'content_optimization',
  PRICING_INSIGHT = 'pricing_insight',
  SEASONAL_TREND = 'seasonal_trend'
}

export interface AmazonAgentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  component: React.ComponentType<any>;
}

export interface CSVUploadResult {
  fileName: string;
  totalRows: number;
  validRows: number;
  errors: string[];
  reviews: AmazonReview[];
}

export const AMAZON_CATEGORIES = [
  { value: AmazonCategory.ELECTRONICS, label: 'Eletrônicos' },
  { value: AmazonCategory.HOME_KITCHEN, label: 'Casa e Cozinha' },
  { value: AmazonCategory.SPORTS_OUTDOORS, label: 'Esportes e Aventura' },
  { value: AmazonCategory.BEAUTY_PERSONAL, label: 'Beleza e Cuidados' },
  { value: AmazonCategory.AUTOMOTIVE, label: 'Automotivo' },
  { value: AmazonCategory.TOYS_GAMES, label: 'Brinquedos e Jogos' },
  { value: AmazonCategory.CLOTHING, label: 'Roupas e Acessórios' },
  { value: AmazonCategory.BOOKS, label: 'Livros' },
  { value: AmazonCategory.HEALTH_HOUSEHOLD, label: 'Saúde e Casa' },
  { value: AmazonCategory.OFFICE_PRODUCTS, label: 'Produtos de Escritório' }
];

export const AMAZON_MARKETPLACES = [
  { value: AmazonMarketplace.US, label: 'Estados Unidos', flag: '🇺🇸' },
  { value: AmazonMarketplace.BR, label: 'Brasil', flag: '🇧🇷' },
  { value: AmazonMarketplace.CA, label: 'Canadá', flag: '🇨🇦' },
  { value: AmazonMarketplace.UK, label: 'Reino Unido', flag: '🇬🇧' },
  { value: AmazonMarketplace.DE, label: 'Alemanha', flag: '🇩🇪' },
  { value: AmazonMarketplace.FR, label: 'França', flag: '🇫🇷' },
  { value: AmazonMarketplace.IT, label: 'Itália', flag: '🇮🇹' },
  { value: AmazonMarketplace.ES, label: 'Espanha', flag: '🇪🇸' },
  { value: AmazonMarketplace.MX, label: 'México', flag: '🇲🇽' },
  { value: AmazonMarketplace.JP, label: 'Japão', flag: '🇯🇵' }
];

export const AI_MODELS = [
  { value: AIModel.GPT4, label: 'GPT-4 (Recomendado)', description: 'Melhor qualidade e criatividade' },
  { value: AIModel.GPT35_TURBO, label: 'GPT-3.5 Turbo', description: 'Rápido e eficiente' },
  { value: AIModel.CLAUDE_3, label: 'Claude 3', description: 'Excelente para análise de texto' },
  { value: AIModel.GEMINI_PRO, label: 'Gemini Pro', description: 'Google AI, boa para dados estruturados' }
];