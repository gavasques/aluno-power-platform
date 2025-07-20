/**
 * Tipos para Validações e Schemas - Centraliza tipos de validação
 * Integração com Zod para validação de dados
 */

import { z } from 'zod';
import { 
  User, 
  Supplier, 
  Material, 
  Agent, 
  Simulation,
  Report 
} from './domain';
import { Product } from './product';

// ============================================================================
// SCHEMAS DE VALIDAÇÃO BASE
// ============================================================================

// Schema base para IDs
export const idSchema = z.number().positive();
export const optionalIdSchema = idSchema.optional();

// Schema base para strings
export const requiredStringSchema = z.string().min(1, 'Campo obrigatório');
export const optionalStringSchema = z.string().optional();

// Schema base para emails
export const emailSchema = z.string().email('Email inválido');

// Schema base para URLs
export const urlSchema = z.string().url('URL inválida').optional();

// Schema base para números
export const positiveNumberSchema = z.number().positive('Valor deve ser positivo');
export const nonNegativeNumberSchema = z.number().min(0, 'Valor deve ser maior ou igual a zero');

// Schema base para booleanos
export const booleanSchema = z.boolean();

// Schema base para datas
export const dateSchema = z.string().datetime('Data inválida');
export const optionalDateSchema = dateSchema.optional();

// ============================================================================
// SCHEMAS DE USUÁRIO
// ============================================================================

export const userPreferencesSchema = z.object({
  language: z.enum(['pt-BR', 'en-US', 'es-ES']),
  currency: z.enum(['BRL', 'USD', 'EUR']),
  timezone: z.string(),
  theme: z.enum(['light', 'dark', 'auto']),
  notifications: z.object({
    email: booleanSchema,
    push: booleanSchema,
    sms: booleanSchema,
    marketing: booleanSchema,
    updates: booleanSchema,
  }),
});

export const userSchema = z.object({
  id: optionalIdSchema,
  email: emailSchema,
  name: requiredStringSchema.min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['admin', 'user', 'moderator', 'premium']),
  status: z.enum(['active', 'inactive', 'suspended', 'pending']),
  credits: nonNegativeNumberSchema,
  preferences: userPreferencesSchema.optional(),
});

export const userCreateSchema = userSchema.omit({ id: true });
export const userUpdateSchema = userSchema.partial();

// ============================================================================
// SCHEMAS DE PRODUTO
// ============================================================================

export const productDimensionsSchema = z.object({
  length: positiveNumberSchema,
  width: positiveNumberSchema,
  height: positiveNumberSchema,
});

export const productSchema = z.object({
  id: optionalIdSchema,
  name: requiredStringSchema.min(2, 'Nome deve ter pelo menos 2 caracteres'),
  sku: optionalStringSchema,
  internalCode: optionalStringSchema,
  freeCode: optionalStringSchema,
  supplierCode: optionalStringSchema,
  ean: optionalStringSchema,
  ncm: optionalStringSchema,
  costItem: positiveNumberSchema,
  taxPercent: z.number().min(0).max(100, 'Imposto deve estar entre 0 e 100%'),
  weight: nonNegativeNumberSchema.optional(),
  dimensions: productDimensionsSchema.optional(),
  brandName: optionalStringSchema,
  observations: optionalStringSchema,
  active: booleanSchema,
});

export const productCreateSchema = productSchema.omit({ id: true });
export const productUpdateSchema = productSchema.partial();

// ============================================================================
// SCHEMAS DE FORNECEDOR
// ============================================================================

export const supplierSchema = z.object({
  id: optionalIdSchema,
  name: requiredStringSchema.min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos').optional(),
  email: emailSchema.optional(),
  phone: optionalStringSchema,
  address: optionalStringSchema,
  city: optionalStringSchema,
  state: optionalStringSchema,
  zipCode: optionalStringSchema,
  contactPerson: optionalStringSchema,
  paymentTerms: optionalStringSchema,
  isActive: booleanSchema,
  rating: z.number().min(0).max(5, 'Avaliação deve estar entre 0 e 5').optional(),
});

export const supplierCreateSchema = supplierSchema.omit({ id: true });
export const supplierUpdateSchema = supplierSchema.partial();

// ============================================================================
// SCHEMAS DE MARCA
// ============================================================================

export const brandSchema = z.object({
  id: optionalIdSchema,
  name: requiredStringSchema.min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: optionalStringSchema,
  logo: urlSchema,
  website: urlSchema,
  supplierId: idSchema,
  isActive: booleanSchema,
});

export const brandCreateSchema = brandSchema.omit({ id: true });
export const brandUpdateSchema = brandSchema.partial();

// ============================================================================
// SCHEMAS DE CONTATO
// ============================================================================

export const contactSchema = z.object({
  id: optionalIdSchema,
  name: requiredStringSchema.min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: emailSchema.optional(),
  phone: optionalStringSchema,
  position: optionalStringSchema,
  department: optionalStringSchema,
  supplierId: idSchema,
  isActive: booleanSchema,
});

export const contactCreateSchema = contactSchema.omit({ id: true });
export const contactUpdateSchema = contactSchema.partial();

// ============================================================================
// SCHEMAS DE CONVERSA
// ============================================================================

export const conversationSchema = z.object({
  id: optionalIdSchema,
  subject: requiredStringSchema.min(2, 'Assunto deve ter pelo menos 2 caracteres'),
  content: requiredStringSchema.min(10, 'Conteúdo deve ter pelo menos 10 caracteres'),
  type: z.enum(['email', 'phone', 'meeting', 'whatsapp']),
  status: z.enum(['open', 'closed', 'pending', 'follow_up']),
  supplierId: idSchema,
  userId: idSchema,
});

export const conversationCreateSchema = conversationSchema.omit({ id: true });
export const conversationUpdateSchema = conversationSchema.partial();

// ============================================================================
// SCHEMAS DE MATERIAL
// ============================================================================

export const materialTypeSchema = z.object({
  id: optionalIdSchema,
  name: requiredStringSchema.min(2, 'Nome deve ter pelo menos 2 caracteres'),
  icon: requiredStringSchema,
  viewerType: z.enum(['download', 'preview', 'video', 'document']),
  allowedExtensions: z.array(z.string()),
  maxFileSize: positiveNumberSchema,
  isActive: booleanSchema,
});

export const materialSchema = z.object({
  id: optionalIdSchema,
  title: requiredStringSchema.min(2, 'Título deve ter pelo menos 2 caracteres'),
  description: requiredStringSchema.min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  type: materialTypeSchema,
  accessLevel: z.enum(['public', 'private', 'shared', 'restricted']),
  tags: z.array(z.string()),
  fileUrl: urlSchema,
  thumbnailUrl: urlSchema,
  duration: nonNegativeNumberSchema.optional(),
  size: positiveNumberSchema.optional(),
  isActive: booleanSchema,
  createdBy: idSchema,
});

export const materialCreateSchema = materialSchema.omit({ id: true });
export const materialUpdateSchema = materialSchema.partial();

// ============================================================================
// SCHEMAS DE AGENTE
// ============================================================================

export const agentConfigSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: positiveNumberSchema.optional(),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  systemPrompt: optionalStringSchema,
  tools: z.array(z.string()).optional(),
  customInstructions: optionalStringSchema,
});

export const agentSchema = z.object({
  id: optionalIdSchema,
  name: requiredStringSchema.min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: requiredStringSchema.min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  type: z.enum([
    'amazon_listing_optimizer',
    'html_description_generator',
    'bullet_points_generator',
    'customer_service',
    'negative_reviews_handler',
    'product_photography',
    'infographic_generator',
    'keyword_researcher',
    'competitor_analyzer',
    'pricing_optimizer'
  ]),
  provider: z.enum(['openai', 'anthropic', 'google', 'deepseek', 'xai']),
  model: requiredStringSchema,
  config: agentConfigSchema,
  isActive: booleanSchema,
  costPerToken: positiveNumberSchema,
  maxTokens: positiveNumberSchema,
});

export const agentCreateSchema = agentSchema.omit({ id: true });
export const agentUpdateSchema = agentSchema.partial();

// ============================================================================
// SCHEMAS DE SIMULAÇÃO
// ============================================================================

export const simulationSummarySchema = z.object({
  totalCost: nonNegativeNumberSchema,
  totalRevenue: nonNegativeNumberSchema,
  profit: z.number(),
  margin: z.number().min(-100).max(100),
  roi: z.number(),
  breakEvenPoint: nonNegativeNumberSchema.optional(),
});

export const chartDataSchema = z.object({
  type: z.enum(['line', 'bar', 'pie', 'scatter']),
  title: requiredStringSchema,
  data: z.array(z.object({
    label: requiredStringSchema,
    value: z.number(),
    color: optionalStringSchema,
  })),
});

export const simulationResultsSchema = z.object({
  summary: simulationSummarySchema,
  details: z.record(z.any()),
  charts: z.array(chartDataSchema).optional(),
  recommendations: z.array(z.string()).optional(),
});

export const simulationSchema = z.object({
  id: optionalIdSchema,
  name: requiredStringSchema.min(2, 'Nome deve ter pelo menos 2 caracteres'),
  type: z.enum([
    'import_simplified',
    'import_formal',
    'simples_nacional',
    'investment_roi',
    'pricing_analysis',
    'cost_breakdown'
  ]),
  userId: idSchema,
  data: z.record(z.any()),
  results: simulationResultsSchema,
  status: z.enum(['draft', 'completed', 'archived']),
});

export const simulationCreateSchema = simulationSchema.omit({ id: true });
export const simulationUpdateSchema = simulationSchema.partial();

// ============================================================================
// SCHEMAS DE RELATÓRIO
// ============================================================================

export const reportFiltersSchema = z.object({
  dateRange: z.object({
    start: z.date(),
    end: z.date(),
  }).optional(),
  products: z.array(idSchema).optional(),
  channels: z.array(z.string()).optional(),
  suppliers: z.array(idSchema).optional(),
  categories: z.array(z.string()).optional(),
});

export const reportSummarySchema = z.object({
  totalRecords: nonNegativeNumberSchema,
  totalValue: nonNegativeNumberSchema,
  averageValue: z.number(),
  topPerformers: z.array(z.object({
    name: requiredStringSchema,
    value: z.number(),
    percentage: z.number().min(0).max(100),
  })),
});

export const reportDataSchema = z.object({
  summary: reportSummarySchema,
  details: z.record(z.any()),
  charts: z.array(chartDataSchema),
  insights: z.array(z.string()),
});

export const reportSchema = z.object({
  id: optionalIdSchema,
  name: requiredStringSchema.min(2, 'Nome deve ter pelo menos 2 caracteres'),
  type: z.enum([
    'sales_analysis',
    'cost_analysis',
    'profitability',
    'competitor_analysis',
    'market_research',
    'performance_metrics'
  ]),
  userId: idSchema,
  filters: reportFiltersSchema,
  data: reportDataSchema,
  format: z.enum(['pdf', 'excel', 'csv', 'json']),
  status: z.enum(['generating', 'completed', 'failed']),
});

export const reportCreateSchema = reportSchema.omit({ id: true });
export const reportUpdateSchema = reportSchema.partial();

// ============================================================================
// SCHEMAS DE VALIDAÇÃO CUSTOMIZADOS
// ============================================================================

// Schema para validação de CNPJ
export const cnpjSchema = z.string()
  .regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos')
  .refine((cnpj) => {
    // Validação do algoritmo de CNPJ
    if (cnpj.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cnpj)) return false;
    
    // Validação dos dígitos verificadores
    let soma = 0;
    let peso = 2;
    
    for (let i = 11; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    const digito1 = ((soma % 11) < 2) ? 0 : 11 - (soma % 11);
    
    soma = 0;
    peso = 2;
    
    for (let i = 12; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    const digito2 = ((soma % 11) < 2) ? 0 : 11 - (soma % 11);
    
    return parseInt(cnpj.charAt(12)) === digito1 && 
           parseInt(cnpj.charAt(13)) === digito2;
  }, 'CNPJ inválido');

// Schema para validação de telefone brasileiro
export const phoneSchema = z.string()
  .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, 'Telefone deve estar no formato (11) 99999-9999')
  .optional();

// Schema para validação de CEP brasileiro
export const cepSchema = z.string()
  .regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 12345-678')
  .optional();

// Schema para validação de preços
export const priceSchema = z.number()
  .min(0, 'Preço deve ser maior ou igual a zero')
  .max(999999.99, 'Preço muito alto');

// Schema para validação de percentuais
export const percentageSchema = z.number()
  .min(0, 'Percentual deve ser maior ou igual a zero')
  .max(100, 'Percentual deve ser menor ou igual a 100');

// ============================================================================
// TIPOS INFERIDOS DOS SCHEMAS
// ============================================================================

export type UserSchema = z.infer<typeof userSchema>;
export type ProductSchema = z.infer<typeof productSchema>;
export type SupplierSchema = z.infer<typeof supplierSchema>;
export type BrandSchema = z.infer<typeof brandSchema>;
export type ContactSchema = z.infer<typeof contactSchema>;
export type ConversationSchema = z.infer<typeof conversationSchema>;
export type MaterialSchema = z.infer<typeof materialSchema>;
export type AgentSchema = z.infer<typeof agentSchema>;
export type SimulationSchema = z.infer<typeof simulationSchema>;
export type ReportSchema = z.infer<typeof reportSchema>;

// ============================================================================
// TIPOS PARA VALIDAÇÃO DE FORMULÁRIOS
// ============================================================================

export interface FormValidationState {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings?: Record<string, string[]>;
  touched: Record<string, boolean>;
  dirty: boolean;
}

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
}

export interface FieldValidation {
  field: string;
  value: any;
  rules: ValidationRule[];
  isValid: boolean;
  errors: string[];
}

export type ValidationFunction<T> = (data: T) => FormValidationState;
export type FieldValidationFunction = (field: string, value: any) => string[];

// ============================================================================
// UTILITÁRIOS DE VALIDAÇÃO
// ============================================================================

export const createValidationFunction = <T>(schema: z.ZodSchema<T>): ValidationFunction<T> => {
  return (data: T): FormValidationState => {
    try {
      schema.parse(data);
      return {
        isValid: true,
        errors: {},
        warnings: {},
        touched: {},
        dirty: false,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) {
            errors[field] = [];
          }
          errors[field].push(err.message);
        });
        
        return {
          isValid: false,
          errors,
          warnings: {},
          touched: {},
          dirty: false,
        };
      }
      
      return {
        isValid: false,
        errors: { general: ['Erro de validação desconhecido'] },
        warnings: {},
        touched: {},
        dirty: false,
      };
    }
  };
};

export const validateField = (schema: z.ZodSchema<any>, value: any): string[] => {
  try {
    schema.parse(value);
    return [];
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map(err => err.message);
    }
    return ['Erro de validação desconhecido'];
  }
}; 