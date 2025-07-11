// Unified Provider Configuration Constants - Centralized configuration data

import { ProviderInfo, ProviderConfiguration } from './types';

export const PROVIDERS: ProviderInfo[] = [
  { 
    value: 'openai', 
    label: 'OpenAI (ChatGPT)', 
    icon: '🤖', 
    color: 'bg-green-100 text-green-800',
    description: 'State-of-the-art language models with reasoning, vision, and tools',
    capabilities: ['chat', 'vision', 'tools', 'reasoning', 'json', 'web_search'],
    features: ['Code Interpreter', 'Retrieval', 'Response Format', 'Reasoning Mode', 'Fine-tuning']
  },
  { 
    value: 'anthropic', 
    label: 'Anthropic (Claude)', 
    icon: '🧠', 
    color: 'bg-purple-100 text-purple-800',
    description: 'Constitutional AI with extended thinking and advanced reasoning',
    capabilities: ['chat', 'vision', 'reasoning', 'json', 'extended_thinking'],
    features: ['Extended Thinking', 'Constitutional AI', 'Long Context', 'Safety Focus']
  },
  { 
    value: 'gemini', 
    label: 'Google Gemini', 
    icon: '⭐', 
    color: 'bg-blue-100 text-blue-800',
    description: 'Google\'s multimodal AI with native vision and reasoning capabilities',
    capabilities: ['chat', 'vision', 'reasoning', 'json', 'multimodal'],
    features: ['Multimodal', 'Native Vision', 'Fast Processing', 'Google Integration']
  },
  { 
    value: 'deepseek', 
    label: 'DeepSeek AI', 
    icon: '🔍', 
    color: 'bg-orange-100 text-orange-800',
    description: 'Advanced reasoning AI with strong coding and analysis capabilities',
    capabilities: ['chat', 'reasoning', 'coding', 'analysis'],
    features: ['Code Generation', 'Deep Reasoning', 'Cost Effective', 'Analysis Focus']
  },
  { 
    value: 'xai', 
    label: 'xAI (Grok)', 
    icon: '🧪', 
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Real-time AI with live web search and image understanding',
    capabilities: ['chat', 'vision', 'web_search', 'real_time', 'image_generation'],
    features: ['Live Search', 'Real-time Data', 'Image Understanding', 'Reasoning Levels', 'Image Generation']
  },
  { 
    value: 'openrouter', 
    label: 'OpenRouter (400+ Models)', 
    icon: '🌐', 
    color: 'bg-teal-100 text-teal-800',
    description: 'Access to 400+ AI models through unified API with auto-routing',
    capabilities: ['chat', 'vision', 'reasoning', 'tools', 'auto_routing'],
    features: ['400+ Models', 'Auto-routing', 'Cost Optimization', 'Model Diversity', 'Unified API']
  }
];

export const REASONING_MODELS = ['o3', 'o4-mini', 'o3-mini'];

export const CLAUDE_EXTENDED_THINKING_MODELS = [
  'claude-opus-4-20250514',
  'claude-sonnet-4-20250514', 
  'claude-3-7-sonnet-20250219'
];

export const VISION_MODELS = [
  'gpt-4.1', 'gpt-4o', 'gpt-4o-mini', 'o4-mini', 'o3',
  'claude-opus-4-20250514', 'claude-sonnet-4-20250514',
  'gemini-1.5-pro', 'gemini-1.5-flash',
  'grok-2-vision-1212', 'grok-4-0709'
];

export const IMAGE_GENERATION_MODELS = [
  'gpt-image-1', 'grok-2-image-1212'
];

export const DEFAULT_CONFIGURATION: ProviderConfiguration = {
  name: 'Nova Configuração',
  description: 'Configuração padrão para provider de IA',
  provider: 'openai',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000,
  reasoning_effort: 'medium',
  responseFormat: 'text',
  reasoningLevel: 'disabled',
  enableSearch: false,
  enableImageUnderstanding: false,
  enableCodeInterpreter: false,
  enableRetrieval: false,
  selectedCollections: [],
  enableExtendedThinking: false,
  thinkingBudgetTokens: 10000,
  systemPrompt: 'Você é um assistente de IA útil e inteligente.',
  promptTemplate: '{{user_input}}',
  placeholders: [
    {
      key: 'user_input',
      label: 'Entrada do Usuário',
      description: 'Texto de entrada fornecido pelo usuário',
      type: 'textarea',
      required: true,
      defaultValue: ''
    }
  ],
  isActive: true
};

export const DEFAULT_WORKFLOW = {
  name: 'Novo Fluxo',
  description: 'Fluxo de trabalho padrão',
  steps: [],
  isMultiStep: false
};

export const QUERY_CONFIG = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  refetchOnMount: false
};

export const COMMON_PLACEHOLDERS = [
  {
    key: 'product_name',
    label: 'Nome do Produto',
    description: 'Nome do produto a ser analisado',
    type: 'text' as const,
    required: true
  },
  {
    key: 'product_description',
    label: 'Descrição do Produto',
    description: 'Descrição detalhada do produto',
    type: 'textarea' as const,
    required: true
  },
  {
    key: 'target_audience',
    label: 'Público-Alvo',
    description: 'Definição do público-alvo do produto',
    type: 'text' as const,
    required: false
  },
  {
    key: 'brand_name',
    label: 'Nome da Marca',
    description: 'Nome da marca do produto',
    type: 'text' as const,
    required: false
  },
  {
    key: 'category',
    label: 'Categoria',
    description: 'Categoria do produto',
    type: 'select' as const,
    required: false,
    options: ['Eletrônicos', 'Casa e Jardim', 'Roupas', 'Esportes', 'Livros', 'Outros']
  }
];

export const PROMPT_TEMPLATES = {
  amazon_listing: `Analise os seguintes dados do produto e crie uma listagem otimizada para Amazon:

Produto: {{product_name}}
Descrição: {{product_description}}
Público-Alvo: {{target_audience}}
Marca: {{brand_name}}
Categoria: {{category}}

Dados de entrada: {{user_input}}

Gere:
1. Título otimizado (150-200 caracteres)
2. 5 bullet points persuasivos
3. Descrição detalhada
4. Palavras-chave sugeridas`,

  content_generation: `Crie conteúdo de qualidade com base nas seguintes informações:

Tópico: {{topic}}
Tom: {{tone}}
Público: {{target_audience}}
Formato: {{format}}

Instruções: {{user_input}}`,

  product_analysis: `Analise o produto abaixo considerando os seguintes aspectos:

Produto: {{product_name}}
Categoria: {{category}}
Mercado: {{market}}

Dados para análise: {{user_input}}

Forneça:
1. Análise de mercado
2. Pontos fortes e fracos
3. Oportunidades de melhoria
4. Recomendações estratégicas`
};