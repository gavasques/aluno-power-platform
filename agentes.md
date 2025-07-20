# Guia Completo de Implementação de Agentes de IA

## Visão Geral

Este documento detalha todos os requisitos e procedimentos para criar e implementar agentes de IA no Aluno Power Platform. Aqui você encontrará tudo o que precisa para fazer um agente funcionar completamente desde a primeira execução.

## Sumário

1. [Arquitetura do Sistema](#arquitetura-do-sistema)
2. [Provedores de IA](#provedores-de-ia)
3. [Banco de Dados](#banco-de-dados)
4. [API Routes](#api-routes)
5. [Permissões e Autenticação](#permissões-e-autenticação)
6. [Upload de Arquivos](#upload-de-arquivos)
7. [Frontend - Componentes](#frontend---componentes)
8. [Custos e Créditos](#custos-e-créditos)
9. [Exemplos Práticos](#exemplos-práticos)
10. [Checklist de Implementação](#checklist-de-implementação)

## Arquitetura do Sistema

### Stack Tecnológico
- **Backend**: Node.js + Express + TypeScript
- **Frontend**: React + TypeScript + Vite
- **Banco de Dados**: PostgreSQL + Drizzle ORM
- **Autenticação**: JWT com middleware personalizado
- **IA**: Múltiplos provedores (OpenAI, Anthropic, Gemini, DeepSeek, XAI, OpenRouter)
- **Upload**: Multer com validação de segurança
- **Estado**: TanStack Query + Context API

### Fluxo de Dados
```
1. Usuário → Frontend (React)
2. Frontend → API Routes (Express)
3. API → Validação de Permissões
4. API → Processamento de Arquivos
5. API → Provedor de IA
6. Provedor IA → Resposta processada
7. API → Banco de Dados (logs/resultados)
8. API → Frontend (resultado final)
```

## Provedores de IA

### Estrutura Base
Todos os provedores implementam a classe `BaseProvider`:

```typescript
// server/services/providers/BaseProvider.ts
export abstract class BaseProvider {
  protected abstract providerName: string;
  
  abstract isConfigured(): boolean;
  abstract getAvailableModels(): ModelConfig[];
  abstract generateResponse(request: AIRequest): Promise<AIResponse>;
  
  protected countTokens(text: string): number;
  protected calculateCost(inputTokens: number, outputTokens: number, modelConfig: ModelConfig): number;
  protected validateRequest(request: AIRequest): void;
}
```

### Provedores Disponíveis

#### 1. OpenAI Provider
```typescript
// Localização: server/services/providers/OpenAIProvider.ts
// Variável de ambiente: OPENAI_API_KEY
// Modelos: gpt-4o, gpt-4o-mini, o1-preview, o1-mini, gpt-image-1
// Recursos especiais: Reasoning, Fine-tuning, Tools, Visão
```

#### 2. Anthropic Provider
```typescript
// Localização: server/services/providers/AnthropicProvider.ts
// Variável de ambiente: ANTHROPIC_API_KEY
// Modelos: claude-3-5-sonnet, claude-3-haiku, claude-3-opus
// Recursos especiais: Análise de imagens, contexto longo
```

#### 3. Gemini Provider
```typescript
// Localização: server/services/providers/GeminiProvider.ts
// Variável de ambiente: GOOGLE_AI_API_KEY
// Modelos: gemini-1.5-pro, gemini-1.5-flash
// Recursos especiais: Multimodal, contexto extenso
```

#### 4. DeepSeek Provider
```typescript
// Localização: server/services/providers/DeepSeekProvider.ts
// Variável de ambiente: DEEPSEEK_API_KEY
// Modelos: deepseek-chat, deepseek-coder
// Recursos especiais: Código especializado
```

#### 5. XAI Provider (Grok)
```typescript
// Localização: server/services/providers/XAIProvider.ts
// Variável de ambiente: XAI_API_KEY
// Modelos: grok-beta, grok-vision-beta
// Recursos especiais: Search, Reasoning levels
```

#### 6. OpenRouter Provider
```typescript
// Localização: server/services/providers/OpenRouterProvider.ts
// Variável de ambiente: OPENROUTER_API_KEY
// Recursos especiais: Acesso a múltiplos modelos via proxy
```

### Configuração de Provedores

```typescript
// server/services/ProviderManager.ts
export class ProviderManager {
  private providers: Map<AIProvider, BaseProvider>;
  
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }
  
  private initializeProviders() {
    this.providers.set('openai', new OpenAIProvider());
    this.providers.set('anthropic', new AnthropicProvider());
    // ... outros provedores
  }
}
```

### Uso dos Provedores

```typescript
// Exemplo de chamada de IA
const aiRequest: AIRequest = {
  provider: 'openai',
  model: 'gpt-4o',
  messages: [
    { role: 'system', content: 'Você é um assistente especializado em...' },
    { role: 'user', content: 'Analise este produto...' }
  ],
  temperature: 0.7,
  maxTokens: 2000,
  referenceImages: ['base64ImageData1', 'base64ImageData2'] // Opcional
};

const response = await aiProviderService.generateResponse(aiRequest);
```

## Banco de Dados

### Tabelas Essenciais para Agentes

#### 1. Tabela `agents`
```sql
-- shared/schema.ts
export const agents = pgTable("agents", {
  id: text("id").primaryKey(), // UUID
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  icon: text("icon").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  provider: text("provider").notNull(), // openai, anthropic, etc.
  model: text("model").notNull(),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).notNull().default("0.70"),
  maxTokens: integer("max_tokens").notNull().default(2000),
  costPer1kTokens: decimal("cost_per_1k_tokens", { precision: 10, scale: 6 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

#### 2. Tabela `agent_prompts`
```sql
export const agentPrompts = pgTable("agent_prompts", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").references(() => agents.id).notNull(),
  promptType: text("prompt_type").notNull(), // system, analysis, title, bulletPoints, description
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

#### 3. Tabela `agent_usage`
```sql
export const agentUsage = pgTable("agent_usage", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").references(() => agents.id).notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name").notNull(),
  inputTokens: integer("input_tokens").notNull(),
  outputTokens: integer("output_tokens").notNull(),
  totalTokens: integer("total_tokens").notNull(),
  costUsd: decimal("cost_usd", { precision: 10, scale: 6 }).notNull(),
  processingTimeMs: integer("processing_time_ms").notNull(),
  status: text("status").notNull(), // success, error
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

#### 4. Tabela `agent_generations`
```sql
export const agentGenerations = pgTable("agent_generations", {
  id: text("id").primaryKey(),
  usageId: text("usage_id").references(() => agentUsage.id).notNull(),
  productName: text("product_name").notNull(),
  productInfo: jsonb("product_info"),
  reviewsData: jsonb("reviews_data"),
  analysisResult: jsonb("analysis_result"),
  titles: jsonb("titles"),
  bulletPoints: jsonb("bullet_points"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
```

#### 5. Tabela `agent_sessions`
```sql
export const agentSessions = pgTable("agent_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  agentType: text("agent_type").notNull(),
  sessionHash: text("session_hash").unique().notNull(),
  status: text("status").notNull().default("active"), // active, completed, error
  metadata: jsonb("metadata"),
  result: jsonb("result"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
```

#### 6. Tabela `agent_session_files`
```sql
export const agentSessionFiles = pgTable("agent_session_files", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").references(() => agentSessions.id).notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  fileData: text("file_data"), // Base64 para arquivos pequenos
  fileUrl: text("file_url"), // URL para arquivos grandes
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});
```

### Operações de Banco Essenciais

```typescript
// server/storage.ts - Exemplos de métodos necessários

// Criar sessão de agente
async createAgentSession(session: InsertAgentSession): Promise<AgentSession>;

// Buscar sessão por hash
async getAgentSessionByHash(sessionHash: string): Promise<AgentSessionWithFiles | null>;

// Salvar arquivo da sessão
async createAgentSessionFile(file: InsertAgentSessionFile): Promise<AgentSessionFile>;

// Registrar uso do agente
async createAgentUsage(usage: InsertAgentUsage): Promise<AgentUsage>;

// Salvar geração do agente
async createAgentGeneration(generation: InsertAgentGeneration): Promise<AgentGeneration>;
```

## API Routes

### Estrutura de Rotas para Agentes

#### 1. Rota Principal de Teste de Provedores
```typescript
// server/routes/aiProviders.ts
POST /api/ai-providers/test
// Testa conexão e configuração de qualquer provedor
// Requer: requireAuth middleware
// Valida: provider, model, prompt
// Retorna: resposta da IA + métricas de uso
```

#### 2. Rotas de Status e Modelos
```typescript
GET /api/ai-providers/status
// Retorna status de todos os provedores (configurado ou não)

GET /api/ai-providers/models
// Lista todos os modelos disponíveis de todos os provedores

GET /api/ai-providers/models/:provider
// Lista modelos de um provedor específico
```

#### 3. Rotas de Agentes Específicos
```typescript
// Exemplo: Amazon Listing Optimizer
POST /api/agents/amazon-listing-optimizer/process
// Middleware: requireAuth, requireAgentAccess('amazon-listing')
// Validação: Zod schema específico
// Upload: Suporte a CSV (Helium10) ou texto
// Processamento: Multi-step AI prompts
// Resposta: Títulos, bullet points, descrição otimizados
```

#### 4. Estrutura de Rota para Novo Agente
```typescript
// server/routes/agents/[nome-do-agente].ts
import { Router } from 'express';
import { requireAuth } from '../../security';
import { requireAgentAccess } from '../../middleware/permissions';
import { z } from 'zod';

const router = Router();

// Schema de validação
const processSchema = z.object({
  // Definir campos específicos do agente
  productInfo: z.string().optional(),
  customInput: z.string(),
  referenceImages: z.array(z.string()).optional(),
  // Parâmetros de IA
  provider: z.enum(['openai', 'anthropic', 'gemini', 'deepseek', 'xai']).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(50000).optional(),
});

router.post('/process', 
  requireAuth, 
  requireAgentAccess('nome-do-agente'),
  async (req, res) => {
    try {
      // 1. Validar dados de entrada
      const validatedData = processSchema.parse(req.body);
      
      // 2. Criar sessão do agente
      const sessionHash = crypto.randomUUID();
      await storage.createAgentSession({
        id: crypto.randomUUID(),
        userId: req.user.id.toString(),
        agentType: 'nome-do-agente',
        sessionHash,
        status: 'active',
        metadata: { ...validatedData }
      });
      
      // 3. Processar com IA
      const aiRequest = {
        provider: validatedData.provider || 'openai',
        model: validatedData.model || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Prompt do sistema...' },
          { role: 'user', content: validatedData.customInput }
        ],
        temperature: validatedData.temperature || 0.7,
        maxTokens: validatedData.maxTokens || 2000,
        referenceImages: validatedData.referenceImages
      };
      
      const response = await aiProviderService.generateResponse(aiRequest);
      
      // 4. Registrar uso e custo
      await storage.createAgentUsage({
        id: crypto.randomUUID(),
        agentId: 'agent-id',
        userId: req.user.id.toString(),
        userName: req.user.name,
        inputTokens: response.usage.inputTokens,
        outputTokens: response.usage.outputTokens,
        totalTokens: response.usage.totalTokens,
        costUsd: response.cost.toString(),
        processingTimeMs: response.processingTime || 0,
        status: 'success'
      });
      
      // 5. Salvar resultado
      await storage.updateAgentSession(sessionId, {
        status: 'completed',
        result: { response: response.content }
      });
      
      // 6. Retornar resultado
      res.json({
        success: true,
        sessionHash,
        result: response.content,
        usage: response.usage,
        cost: response.cost
      });
      
    } catch (error) {
      console.error('Erro no agente:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Erro interno'
      });
    }
  }
);

export default router;
```

## Permissões e Autenticação

### Sistema de Permissões

#### 1. Middleware de Autenticação
```typescript
// server/middleware/auth.ts
export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction);
// Valida JWT token e adiciona req.user
```

#### 2. Middleware de Permissões
```typescript
// server/middleware/permissions.ts
export const requireAgentAccess = (agentType: string) => requirePermission(`agents.${agentType}`);
export const requireSimulatorAccess = (type: string) => requirePermission(`simulators.${type}`);
export const requireAdminAccess = requirePermission('admin.access');
```

#### 3. Permissões Específicas para Agentes
```typescript
// Exemplo de permissões necessárias:
'agents.amazon-listing' - Amazon Listing Optimizer
'agents.bullet-points' - Bullet Points Generator  
'agents.html-description' - HTML Description Generator
'agents.infographic' - Advanced Infographic Generator
'agents.product-photography' - Amazon Product Photography
'agents.lifestyle-model' - Lifestyle with Model
'agents.customer-service' - Amazon Customer Service
'agents.negative-reviews' - Amazon Negative Reviews
```

#### 4. Validação de Permissões
```typescript
// server/services/permissionService.ts
export class PermissionService {
  static async hasAccess(userId: number, feature: string): Promise<boolean> {
    // Verificar permissões do usuário para o feature específico
    // Considerar role (admin, user) e grupos de usuário
  }
}
```

## Upload de Arquivos

### Configuração de Upload

#### 1. Middleware de Upload Seguro
```typescript
// server/middleware/secureUpload.ts
export const imageUpload = createSecureUpload({
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  maxFileSize: 10 * 1024 * 1024, // 10MB
  fieldName: 'image'
});

export const documentUpload = createSecureUpload({
  allowedTypes: ['text/csv', 'text/plain', 'application/pdf'],
  maxFileSize: 25 * 1024 * 1024, // 25MB
  fieldName: 'document'
});
```

#### 2. Validação de Arquivos
```typescript
// Validações automáticas:
- MIME type verification
- File extension matching  
- Size limit enforcement
- Filename sanitization
- Path traversal prevention
```

#### 3. Storage Options
```typescript
// Opções de armazenamento:
1. Memory Storage (multer.memoryStorage()) - Para processamento imediato
2. Disk Storage (multer.diskStorage()) - Para arquivos persistentes
3. Database Storage (base64) - Para arquivos temporários pequenos
```

### Tipos de Upload Suportados

#### 1. Imagens para IA
```typescript
// Configuração para agentes que processam imagens
const imageProcessingUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
});
```

#### 2. CSV/Excel para Análise
```typescript
// Para agentes que analisam dados de planilhas (ex: Amazon Listing)
const dataFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos CSV e Excel são aceitos'));
    }
  }
});
```

#### 3. Processamento de Base64
```typescript
// Para imagens que vêm como base64 do frontend
function processBase64Image(base64Data: string): Buffer {
  const base64WithoutHeader = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
  return Buffer.from(base64WithoutHeader, 'base64');
}
```

## Frontend - Componentes

### Estrutura de Componentes

#### 1. Página Principal do Agente
```tsx
// client/src/pages/agents/[NomeDoAgente].tsx
import React, { useState } from 'react';
import { useApiRequest } from '../../hooks/useApiRequest';
import { AgentCostDisplay } from '../../components/AgentCostDisplay';
import { ImageUploader } from '../../components/ai/ImageUploader';

export default function NomeDoAgente() {
  const [inputData, setInputData] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [result, setResult] = useState(null);
  
  const { execute: processAgent, loading } = useApiRequest({
    url: '/api/agents/nome-do-agente/process',
    method: 'POST'
  });
  
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('customInput', inputData);
    
    files.forEach((file, index) => {
      formData.append(`image`, file);
    });
    
    try {
      const response = await processAgent(formData);
      setResult(response.data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Nome do Agente</h1>
      
      {/* Custo estimado */}
      <AgentCostDisplay 
        agentType="nome-do-agente"
        inputLength={inputData.length}
        fileCount={files.length}
      />
      
      {/* Input de texto */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          Descrição do Produto
        </label>
        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          className="w-full p-3 border rounded-lg"
          rows={6}
          placeholder="Digite as informações do produto..."
        />
      </div>
      
      {/* Upload de imagens */}
      <ImageUploader
        files={files}
        onFilesChange={setFiles}
        maxFiles={5}
        accept="image/*"
      />
      
      {/* Botão de processar */}
      <button
        onClick={handleSubmit}
        disabled={loading || !inputData.trim()}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Processando...' : 'Processar com IA'}
      </button>
      
      {/* Resultado */}
      {result && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Resultado</h3>
          <pre className="whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
```

#### 2. Componente de Upload de Imagem
```tsx
// client/src/components/ai/ImageUploader.tsx
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
}

export function ImageUploader({ files, onFilesChange, maxFiles = 5, accept = "image/*" }: ImageUploaderProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles);
    onFilesChange(newFiles);
  }, [files, onFilesChange, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    maxFiles: maxFiles - files.length,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        Imagens de Referência (máx. {maxFiles})
      </label>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Solte os arquivos aqui...</p>
        ) : (
          <p>Arraste imagens aqui ou clique para selecionar</p>
        )}
      </div>
      
      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded"
              />
              <button
                onClick={() => {
                  const newFiles = files.filter((_, i) => i !== index);
                  onFilesChange(newFiles);
                }}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

#### 3. Hook de API Request
```tsx
// client/src/hooks/useApiRequest.ts
import { useState, useCallback } from 'react';

interface UseApiRequestOptions {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
}

export function useApiRequest({ url, method, headers = {} }: UseApiRequestOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const execute = useCallback(async (data?: any) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('auth_token');
      
      const config: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          ...headers
        }
      };
      
      if (data) {
        if (data instanceof FormData) {
          config.body = data;
        } else {
          config.headers = { ...config.headers, 'Content-Type': 'application/json' };
          config.body = JSON.stringify(data);
        }
      }
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return { data: result, status: response.status };
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [url, method, headers]);
  
  return { execute, loading, error };
}
```

#### 4. Componente de Exibição de Custo
```tsx
// client/src/components/AgentCostDisplay.tsx
import React, { useEffect, useState } from 'react';

interface AgentCostDisplayProps {
  agentType: string;
  inputLength: number;
  fileCount: number;
}

export function AgentCostDisplay({ agentType, inputLength, fileCount }: AgentCostDisplayProps) {
  const [estimatedCost, setEstimatedCost] = useState(0);
  
  useEffect(() => {
    // Calcular custo estimado baseado no agente e inputs
    const baseCost = 0.01; // $0.01 base
    const textCost = (inputLength / 1000) * 0.005; // $0.005 por 1k chars
    const imageCost = fileCount * 0.02; // $0.02 por imagem
    
    setEstimatedCost(baseCost + textCost + imageCost);
  }, [agentType, inputLength, fileCount]);
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-medium text-blue-900">Custo Estimado</h4>
          <p className="text-sm text-blue-700">
            Baseado no texto ({inputLength} chars) e {fileCount} imagens
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-blue-900">
            ${estimatedCost.toFixed(4)}
          </span>
          <p className="text-sm text-blue-700">USD</p>
        </div>
      </div>
    </div>
  );
}
```

## Custos e Créditos

### Sistema de Créditos

#### 1. Estrutura de Créditos
```typescript
// client/src/hooks/useCreditSystem.ts
export function useCreditSystem() {
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const checkCredits = async () => {
    // Verificar créditos disponíveis do usuário
  };
  
  const deductCredits = async (amount: number) => {
    // Deduzir créditos após uso bem-sucedido
  };
  
  const refundCredits = async (amount: number) => {
    // Reembolsar créditos em caso de erro
  };
  
  return { credits, checkCredits, deductCredits, refundCredits, loading };
}
```

#### 2. Integração com Stripe
```typescript
// server/services/stripeService.ts
export class StripeService {
  static async createCreditsPurchase(userId: number, amount: number): Promise<string> {
    // Criar checkout session do Stripe para compra de créditos
  }
  
  static async processCreditsPurchase(sessionId: string): Promise<void> {
    // Processar compra de créditos após pagamento confirmado
  }
}
```

#### 3. Logging de Custos
```typescript
// Todos os agentes devem registrar uso e custo:
await storage.createAgentUsage({
  id: crypto.randomUUID(),
  agentId: 'agent-id',
  userId: req.user.id.toString(),
  userName: req.user.name,
  inputTokens: response.usage.inputTokens,
  outputTokens: response.usage.outputTokens,
  totalTokens: response.usage.totalTokens,
  costUsd: response.cost.toString(),
  processingTimeMs: Date.now() - startTime,
  status: 'success'
});
```

## Exemplos Práticos

### Exemplo 1: Agente de Análise de Produto Simples

#### Backend Route
```typescript
// server/routes/agents/produto-analise.ts
import { Router } from 'express';
import { requireAuth } from '../../security';
import { aiProviderService } from '../../services/aiProviderService';
import { storage } from '../../storage';
import { z } from 'zod';
import crypto from 'crypto';

const router = Router();

const analyzeProductSchema = z.object({
  productName: z.string().min(1, 'Nome do produto é obrigatório'),
  productDescription: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  targetMarket: z.string().optional(),
  provider: z.enum(['openai', 'anthropic', 'gemini']).default('openai'),
  model: z.string().optional(),
});

router.post('/analyze', requireAuth, async (req, res) => {
  const startTime = Date.now();
  
  try {
    // 1. Validar entrada
    const { productName, productDescription, targetMarket, provider, model } = 
      analyzeProductSchema.parse(req.body);
    
    // 2. Criar sessão
    const sessionHash = crypto.randomUUID();
    const session = await storage.createAgentSession({
      id: crypto.randomUUID(),
      userId: req.user.id.toString(),
      agentType: 'produto-analise',
      sessionHash,
      status: 'active',
      metadata: { productName, productDescription, targetMarket }
    });
    
    // 3. Preparar prompt
    const systemPrompt = `Você é um especialista em análise de produtos para e-commerce.
Analise o produto fornecido e retorne:
1. Pontos fortes do produto
2. Pontos de melhoria
3. Público-alvo recomendado
4. Sugestões de preço
5. Estratégias de marketing

Retorne em formato JSON estruturado.`;

    const userPrompt = `
Produto: ${productName}
Descrição: ${productDescription}
${targetMarket ? `Mercado alvo: ${targetMarket}` : ''}

Por favor, analise este produto detalhadamente.`;

    // 4. Chamar IA
    const aiRequest = {
      provider: provider as any,
      model: model || (provider === 'openai' ? 'gpt-4o-mini' : 'claude-3-5-sonnet'),
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      maxTokens: 2000,
      response_format: { type: 'json_object' as const }
    };
    
    const response = await aiProviderService.generateResponse(aiRequest);
    
    // 5. Registrar uso
    const processingTime = Date.now() - startTime;
    await storage.createAgentUsage({
      id: crypto.randomUUID(),
      agentId: 'produto-analise',
      userId: req.user.id.toString(),
      userName: req.user.name,
      inputTokens: response.usage.inputTokens,
      outputTokens: response.usage.outputTokens,
      totalTokens: response.usage.totalTokens,
      costUsd: response.cost.toString(),
      processingTimeMs: processingTime,
      status: 'success'
    });
    
    // 6. Salvar resultado
    const analysisResult = JSON.parse(response.content);
    await storage.updateAgentSession(session.id, {
      status: 'completed',
      result: analysisResult
    });
    
    // 7. Retornar resultado
    res.json({
      success: true,
      sessionHash,
      analysis: analysisResult,
      usage: response.usage,
      cost: response.cost,
      processingTime
    });
    
  } catch (error) {
    console.error('❌ [PRODUTO_ANALISE] Error:', error);
    
    if (session?.id) {
      await storage.updateAgentSession(session.id, {
        status: 'error',
        result: { error: error instanceof Error ? error.message : 'Erro desconhecido' }
      });
    }
    
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
});

export default router;
```

#### Frontend Component
```tsx
// client/src/pages/agents/ProdutoAnalise.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AnalysisResult {
  pontos_fortes: string[];
  pontos_melhoria: string[];
  publico_alvo: string;
  sugestao_preco: string;
  estrategias_marketing: string[];
}

export default function ProdutoAnalise() {
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    targetMarket: '',
    provider: 'openai'
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [usage, setUsage] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productName.trim() || !formData.productDescription.trim()) {
      toast.error('Nome e descrição do produto são obrigatórios');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/agents/produto-analise/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setResult(data.analysis);
        setUsage(data.usage);
        toast.success('Análise concluída com sucesso!');
      } else {
        throw new Error(data.error || 'Erro na análise');
      }

    } catch (error) {
      console.error('Erro:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao processar análise');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Análise de Produto com IA</h1>
        <p className="text-gray-600 mt-2">
          Analise qualquer produto e receba insights detalhados sobre pontos fortes, melhorias e estratégias de marketing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Nome do Produto *
                </label>
                <Input
                  value={formData.productName}
                  onChange={(e) => setFormData({...formData, productName: e.target.value})}
                  placeholder="Ex: Smartphone XYZ Pro Max"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Descrição do Produto *
                </label>
                <Textarea
                  value={formData.productDescription}
                  onChange={(e) => setFormData({...formData, productDescription: e.target.value})}
                  placeholder="Descreva detalhadamente o produto, suas características, benefícios..."
                  rows={6}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mercado Alvo (opcional)
                </label>
                <Input
                  value={formData.targetMarket}
                  onChange={(e) => setFormData({...formData, targetMarket: e.target.value})}
                  placeholder="Ex: Jovens 18-25 anos, Profissionais liberais..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Provedor de IA
                </label>
                <Select value={formData.provider} onValueChange={(value) => setFormData({...formData, provider: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI (GPT-4o Mini)</SelectItem>
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="gemini">Google (Gemini)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  'Analisar Produto'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Resultado */}
        <div className="space-y-6">
          {result && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">✅ Pontos Fortes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.pontos_fortes?.map((ponto, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {ponto}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-amber-600">⚠️ Pontos de Melhoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.pontos_melhoria?.map((ponto, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-amber-500 mr-2">•</span>
                        {ponto}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600">🎯 Público-Alvo</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{result.publico_alvo}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-purple-600">💰 Sugestão de Preço</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{result.sugestao_preco}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-indigo-600">📢 Estratégias de Marketing</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.estrategias_marketing?.map((estrategia, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-indigo-500 mr-2">•</span>
                        {estrategia}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {usage && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-gray-600">📊 Métricas de Uso</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-600">
                    <p>Tokens de entrada: {usage.inputTokens}</p>
                    <p>Tokens de saída: {usage.outputTokens}</p>
                    <p>Total de tokens: {usage.totalTokens}</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

### Exemplo 2: Agente com Upload de Imagem

#### Backend Route
```typescript
// server/routes/agents/analise-imagem.ts
import { Router } from 'express';
import { requireAuth } from '../../security';
import { aiProviderService } from '../../services/aiProviderService';
import multer from 'multer';
import crypto from 'crypto';

const router = Router();

// Configurar upload de imagem
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
});

router.post('/analyze', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Nenhuma imagem foi enviada'
      });
    }

    const { prompt = 'Analise esta imagem detalhadamente' } = req.body;

    // Converter imagem para base64
    const imageBase64 = req.file.buffer.toString('base64');
    const imageMimeType = req.file.mimetype;

    // Preparar request para IA
    const aiRequest = {
      provider: 'openai' as any,
      model: 'gpt-4o',
      messages: [
        {
          role: 'user' as const,
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMimeType};base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      temperature: 0.7,
      maxTokens: 1500
    };

    const response = await aiProviderService.generateResponse(aiRequest);

    res.json({
      success: true,
      analysis: response.content,
      usage: response.usage,
      cost: response.cost,
      fileName: req.file.originalname,
      fileSize: req.file.size
    });

  } catch (error) {
    console.error('❌ [ANALISE_IMAGEM] Error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro interno'
    });
  }
});

export default router;
```

## Checklist de Implementação

### ✅ Pré-requisitos
- [ ] Node.js e npm instalados
- [ ] PostgreSQL configurado
- [ ] Variáveis de ambiente configuradas (chaves de API)
- [ ] Dependências instaladas (`npm install`)

### ✅ Backend Setup
- [ ] Criar tabelas no banco de dados (migrations)
- [ ] Configurar provedores de IA necessários
- [ ] Implementar route do agente em `server/routes/agents/`
- [ ] Adicionar validação Zod para inputs
- [ ] Configurar middleware de upload (se necessário)
- [ ] Implementar sistema de permissões
- [ ] Testar endpoint via Postman/Insomnia

### ✅ Integração com IA
- [ ] Escolher provedor (OpenAI, Anthropic, etc.)
- [ ] Configurar modelo apropriado
- [ ] Criar prompts de sistema e usuário
- [ ] Implementar tratamento de erros
- [ ] Configurar logging de uso e custos
- [ ] Testar com dados reais

### ✅ Frontend Setup
- [ ] Criar página do agente em `client/src/pages/agents/`
- [ ] Implementar formulário de entrada
- [ ] Adicionar upload de arquivos (se necessário)
- [ ] Criar componentes de resultado
- [ ] Implementar loading states
- [ ] Adicionar tratamento de erros
- [ ] Integrar com sistema de navegação

### ✅ Segurança e Validação
- [ ] Implementar autenticação JWT
- [ ] Configurar permissões específicas
- [ ] Validar tipos de arquivo
- [ ] Limitar tamanhos de upload
- [ ] Sanitizar inputs de usuário
- [ ] Implementar rate limiting
- [ ] Testar cenários de erro

### ✅ Sistema de Custos
- [ ] Configurar cálculo de custos por modelo
- [ ] Implementar dedução de créditos
- [ ] Registrar uso no banco de dados
- [ ] Criar relatórios de uso
- [ ] Implementar reembolso em caso de erro
- [ ] Testar fluxo de pagamento

### ✅ Testes e Validação
- [ ] Testar com diferentes tipos de entrada
- [ ] Validar respostas da IA
- [ ] Testar upload de arquivos
- [ ] Verificar permissões
- [ ] Testar cenários de erro
- [ ] Validar cálculos de custo
- [ ] Testar em diferentes dispositivos

### ✅ Deploy e Monitoramento
- [ ] Configurar variáveis de ambiente em produção
- [ ] Implementar logging adequado
- [ ] Configurar monitoramento de performance
- [ ] Documentar API endpoints
- [ ] Criar guia de uso para usuários
- [ ] Configurar backup de dados
- [ ] Testar em ambiente de produção

### ✅ Documentação
- [ ] Documentar inputs e outputs do agente
- [ ] Criar exemplos de uso
- [ ] Documentar custos estimados
- [ ] Atualizar este guia com especificidades
- [ ] Criar troubleshooting guide
- [ ] Documentar limitações conhecidas

---

## Considerações Finais

### Boas Práticas
1. **Sempre validar inputs** tanto no frontend quanto no backend
2. **Implementar tratamento de erros robusto** em todas as camadas
3. **Registrar logs detalhados** para debugging e análise
4. **Usar TypeScript** para maior segurança de tipos
5. **Implementar testes unitários** para funções críticas
6. **Monitorar custos** de IA regularmente
7. **Manter prompts versionados** no banco de dados

### Limitações Conhecidas
- Tamanho máximo de arquivo: 25MB para imagens
- Timeout de processamento: 120 segundos
- Limite de tokens por modelo varia conforme provedor
- Alguns modelos não suportam imagens
- Rate limiting pode afetar uso intensivo

### Próximos Passos
- Implementar cache de respostas para prompts similares
- Adicionar suporte a mais tipos de arquivo
- Criar sistema de templates de prompts
- Implementar webhooks para notificações
- Adicionar analytics avançados de uso

Este guia deve cobrir todos os aspectos necessários para implementar um agente de IA funcional no sistema. Para dúvidas específicas ou problemas durante a implementação, consulte os exemplos de código e a documentação das APIs dos provedores de IA.