// This file provides empty data structures for components that may need initial state
// All data should be loaded from authentic API sources in production

export const mockCategories = [
  { id: 1, name: 'Eletrônicos', slug: 'electronics' },
  { id: 2, name: 'Casa e Jardim', slug: 'home-garden' },
  { id: 3, name: 'Esportes', slug: 'sports' },
  { id: 4, name: 'Beleza', slug: 'beauty' },
  { id: 5, name: 'Roupas', slug: 'clothing' }
];

export const mockSuppliers = [];

export const mockPartners = [];

export const mockMaterials = [];

export const mockTools = [];

export const mockTemplates = [];

export const mockPrompts = [];

export const mockProducts = [];

export const mockData = {
  // Empty arrays for components that expect data structures
  products: [],
  categories: mockCategories,
  suppliers: [],
  partners: [],
  materials: [],
  tools: [],
  templates: [],
  prompts: [],
  
  // Default user data structure
  user: {
    id: 0,
    name: '',
    email: '',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Empty analytics data
  analytics: {
    userGrowth: [],
    aiUsage: [],
    modelDistribution: [],
    metrics: {
      totalUsers: 0,
      activeUsers: 0,
      totalTokens: 0,
      supportTickets: 0,
      avgResponseTime: 0,
      systemUptime: 0
    }
  },

  // Empty notifications
  notifications: [],

  // Empty form data structures
  forms: {
    amazonListing: {
      productName: "",
      brand: "",
      category: "",
      keywords: "",
      longTailKeywords: "",
      features: "",
      targetAudience: "",
      reviewsData: ""
    }
  }
};

export default mockData;