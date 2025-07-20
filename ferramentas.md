# Guia Completo para Criação de Ferramentas
## Aluno Power Platform - Sistema de Ferramentas AI

Este documento fornece todas as informações necessárias para criar uma nova ferramenta no sistema, seguindo os padrões estabelecidos, fluxo de IA, permissões, liberações e tudo o que é necessário para uma ferramenta funcionar perfeitamente na primeira implementação.

---

## 📋 Índice

1. [Visão Geral do Sistema](#1-visão-geral-do-sistema)
2. [Arquitetura das Ferramentas](#2-arquitetura-das-ferramentas)
3. [Pré-requisitos](#3-pré-requisitos)
4. [Estrutura do Banco de Dados](#4-estrutura-do-banco-de-dados)
5. [Sistema de Permissões](#5-sistema-de-permissões)
6. [Sistema de Créditos](#6-sistema-de-créditos)
7. [Integração com IA](#7-integração-com-ia)
8. [Estrutura Frontend](#8-estrutura-frontend)
9. [Estrutura Backend](#9-estrutura-backend)
10. [Guia Passo a Passo](#10-guia-passo-a-passo)
11. [Padrões de Código](#11-padrões-de-código)
12. [Checklist Final](#12-checklist-final)

---

## 1. Visão Geral do Sistema

### Arquitetura Principal
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Backend**: Node.js + Express + PostgreSQL + Drizzle ORM
- **IA**: Múltiplos provedores (OpenAI, Anthropic, Gemini, DeepSeek, XAI, OpenRouter)
- **Autenticação**: JWT + Role-based access control
- **Estado**: TanStack Query para server state + React Context

### Tipos de Ferramentas Suportadas
1. **Processamento de Imagem** (Background Removal, Upscale, Logo Generator)
2. **Ferramentas Amazon** (Ads Editor, Reviews Extractor, Keyword Research)
3. **Ferramentas de Negócio** (CNPJ Consultation, Simulators)
4. **Ferramentas AI** (Content Generation, Analysis, Optimization)

---

## 2. Arquitetura das Ferramentas

### Estrutura de Dados Principal

```typescript
// Schema das Ferramentas (/shared/schema.ts)
tools: {
  id: serial primary key
  name: text (nome da ferramenta)
  description: text (descrição detalhada)
  typeId: integer (referencia toolTypes)
  logo: text (URL do logo)
  website: text (site externo)
  features: text[] (lista de funcionalidades)
  pros: text[] (vantagens)
  cons: text[] (desvantagens)
  brazilSupport: "works" | "partial" | "no"
  verified: boolean
  averageRating: decimal
  totalReviews: integer
  created_at: timestamp
  updated_at: timestamp
}
```

### Tabelas Relacionadas
- **toolTypes**: Categorização das ferramentas
- **toolReviews**: Avaliações dos usuários
- **toolDiscounts**: Ofertas promocionais
- **featureCosts**: Sistema de preços em créditos
- **toolUsageLogs**: Logs de uso e auditoria

---

## 3. Pré-requisitos

### 3.1 Definição da Ferramenta
Antes de começar, defina:
- **Nome da ferramenta**
- **Categoria/Tipo**
- **Funcionalidade principal**
- **Custo em créditos**
- **Provedores de IA necessários**
- **Permissões requiridas**
- **Formato de entrada/saída**

### 3.2 Recursos Necessários
- [ ] Chave de API do provedor de IA (se aplicável)
- [ ] Logo/ícone da ferramenta (SVG recomendado)
- [ ] Documentação da API externa (se aplicável)
- [ ] Definição dos parâmetros de entrada
- [ ] Estrutura dos dados de saída

---

## 4. Estrutura do Banco de Dados

### 4.1 Tabela de Configuração da Ferramenta

```sql
-- Exemplo para uma nova ferramenta
CREATE TABLE nova_ferramenta_configs (
  id SERIAL PRIMARY KEY,
  tool_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  cost_per_use DECIMAL(10,2) NOT NULL,
  default_parameters JSONB,
  supported_formats TEXT[],
  max_file_size BIGINT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 Tabela de Sessões

```sql
-- Para ferramentas que processam arquivos ou têm estado
CREATE TABLE nova_ferramenta_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'processing',
  input_data JSONB,
  result_data JSONB,
  parameters JSONB,
  original_file_url TEXT,
  processed_file_url TEXT,
  duration INTEGER,
  credits_used DECIMAL(10,2),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### 4.3 Inserção no Sistema Principal

```sql
-- 1. Adicionar tipo de ferramenta
INSERT INTO tool_types (name, description) 
VALUES ('Nova Categoria', 'Descrição da categoria');

-- 2. Adicionar ferramenta
INSERT INTO tools (name, description, type_id, features, pros, cons, brazil_support, verified)
VALUES (
  'Nome da Ferramenta',
  'Descrição detalhada',
  (SELECT id FROM tool_types WHERE name = 'Nova Categoria'),
  ARRAY['Funcionalidade 1', 'Funcionalidade 2'],
  ARRAY['Vantagem 1', 'Vantagem 2'],
  ARRAY['Limitação 1'],
  'works',
  true
);

-- 3. Configurar custo em créditos
INSERT INTO feature_costs (feature_name, cost_per_use, description, category, is_active)
VALUES (
  'tools.nova_ferramenta',
  5.00,
  'Nova Ferramenta - processamento por uso',
  'Ferramentas',
  true
);
```

---

## 5. Sistema de Permissões

### 5.1 Definição da Permissão

```typescript
// Em server/services/permissionService.ts
// Adicionar na função initializeFeatures()
{
  code: 'tools.nova_ferramenta',
  name: 'Nova Ferramenta',
  category: 'Ferramentas',
  description: 'Acesso à nova ferramenta',
  sortOrder: 15
}
```

### 5.2 Middleware de Permissão

```typescript
// Em server/middleware/permissions.ts
export const requireNovaFerramentaAccess = requirePermission('tools.nova_ferramenta');
```

### 5.3 Configuração no Frontend

```typescript
// Em client/src/components/guards/PermissionGuard.tsx
<PermissionGuard featureCode="tools.nova_ferramenta">
  <NovaFerramentaComponent />
</PermissionGuard>
```

---

## 6. Sistema de Créditos

### 6.1 Integração com Hook de Créditos

```typescript
// Em sua ferramenta frontend
import { useCreditSystem } from '@/hooks/useCreditSystem';

const { checkCredits, logAIGeneration } = useCreditSystem();

// Antes do processamento
const creditCheck = await checkCredits('tools.nova_ferramenta');
if (!creditCheck.canProcess) {
  toast.error(`Créditos insuficientes. Necessário: ${creditCheck.requiredCredits}, Disponível: ${creditCheck.availableCredits}`);
  return;
}

// Após o processamento bem-sucedido
await logAIGeneration({
  featureCode: 'tools.nova_ferramenta',
  provider: 'openai',
  model: 'gpt-4o-mini',
  inputTokens: response.usage.inputTokens,
  outputTokens: response.usage.outputTokens,
  totalTokens: response.usage.totalTokens,
  cost: response.cost,
  prompt: prompt.substring(0, 1000),
  response: result.substring(0, 1000)
});
```

### 6.2 Dedução Automática no Backend

```typescript
// Em seu service backend
import { CreditService } from '../services/creditService';

try {
  // Deduzir créditos antes do processamento
  const creditsUsed = await CreditService.deductCredits(userId, 'tools.nova_ferramenta');
  
  // Processar com IA...
  const result = await processWithAI(data);
  
  // Log da geração
  await this.saveAiGenerationLog(
    userId,
    'tools.nova_ferramenta',
    prompt,
    result,
    provider,
    model,
    usage.inputTokens,
    usage.outputTokens,
    usage.totalTokens,
    cost,
    duration
  );
  
  return result;
} catch (error) {
  // Em caso de erro, os créditos já foram deduzidos
  // Considere implementar sistema de reembolso se necessário
  throw error;
}
```

---

## 7. Integração com IA

### 7.1 Padrão de Serviço de IA

```typescript
// server/services/novaFerramentaService.ts
import { aiProviderService } from './aiProviderService';

export class NovaFerramentaService {
  async processWithAI(
    userId: number,
    inputData: InputType,
    parameters: ParameterType
  ): Promise<ProcessingResult> {
    const startTime = Date.now();
    
    // 1. Criar sessão para tracking
    const sessionId = await this.createSession({
      userId,
      tool: 'nova_ferramenta',
      originalData: inputData,
      parameters
    });

    try {
      // 2. Construir prompt estruturado
      const messages = this.buildMessages(inputData, parameters);
      
      // 3. Chamar provedor de IA
      const aiResponse = await aiProviderService.generateResponse({
        provider: "openai",
        model: "gpt-4o-mini",
        messages: messages,
        temperature: 0.7,
        maxTokens: 2000
      });

      // 4. Processar resposta
      const result = this.processAIResponse(aiResponse.content);

      // 5. Atualizar sessão com resultados
      await this.updateSession(sessionId, {
        status: 'completed',
        result: result,
        duration: Date.now() - startTime
      });

      return {
        sessionId,
        result,
        usage: aiResponse.usage,
        cost: aiResponse.cost
      };

    } catch (error) {
      await this.updateSession(sessionId, {
        status: 'failed',
        errorMessage: error.message
      });
      throw error;
    }
  }

  private buildMessages(inputData: InputType, parameters: ParameterType) {
    return [
      {
        role: 'system',
        content: 'Você é um assistente especializado em...'
      },
      {
        role: 'user',
        content: `Processe os seguintes dados: ${JSON.stringify(inputData)}`
      }
    ];
  }

  private processAIResponse(content: string): ProcessingResult {
    // Processar e validar a resposta da IA
    try {
      return JSON.parse(content);
    } catch (error) {
      // Fallback para resposta em texto
      return { text: content };
    }
  }
}
```

### 7.2 Configuração de Provedores

```typescript
// Tipos de provedor suportados
type AIProvider = 'openai' | 'anthropic' | 'gemini' | 'deepseek' | 'xai' | 'openrouter';

// Exemplo de configuração por funcionalidade
const getProviderConfig = (toolType: string) => {
  switch (toolType) {
    case 'text_generation':
      return { provider: 'openai', model: 'gpt-4o-mini' };
    case 'image_analysis':
      return { provider: 'openai', model: 'gpt-4o' };
    case 'reasoning_task':
      return { provider: 'openai', model: 'o4-mini' };
    default:
      return { provider: 'openai', model: 'gpt-4o-mini' };
  }
};
```

---

## 8. Estrutura Frontend

### 8.1 Página Principal da Ferramenta

```typescript
// client/src/pages/tools/NovaFerramenta.tsx
import { useState } from 'react';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import { NovaFerramentaComponent } from '@/components/nova-ferramenta/NovaFerramentaComponent';

export default function NovaFerramentaPro() {
  return (
    <PermissionGuard featureCode="tools.nova_ferramenta">
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Nova Ferramenta PRO
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Descrição da funcionalidade da ferramenta
                </p>
              </div>
              <Badge variant="secondary" className="text-sm">
                5 créditos por uso
              </Badge>
            </div>
          </div>
        </div>

        {/* Features Banner */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg font-semibold mb-4">
              Tecnologia de Última Geração
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <span>✨ Funcionalidade 1</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🚀 Funcionalidade 2</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🎯 Funcionalidade 3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Component */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <NovaFerramentaComponent />
        </div>
      </div>
    </PermissionGuard>
  );
}
```

### 8.2 Componente Principal

```typescript
// client/src/components/nova-ferramenta/NovaFerramentaComponent.tsx
import { useState } from 'react';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';

interface ProcessingResult {
  sessionId: string;
  result: any;
  usage: any;
  cost: number;
}

export function NovaFerramentaComponent() {
  const [inputData, setInputData] = useState('');
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { checkCredits, logAIGeneration } = useCreditSystem();

  const handleProcess = async () => {
    if (!inputData.trim()) {
      toast.error('Por favor, insira os dados para processamento');
      return;
    }

    setIsProcessing(true);
    
    try {
      // 1. Verificar créditos
      const creditCheck = await checkCredits('tools.nova_ferramenta');
      if (!creditCheck.canProcess) {
        toast.error(`Créditos insuficientes. Necessário: ${creditCheck.requiredCredits}, Disponível: ${creditCheck.availableCredits}`);
        return;
      }

      // 2. Processar com a API
      const response = await fetch('/api/nova-ferramenta/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          inputData,
          parameters: { /* parâmetros específicos */ }
        })
      });

      if (!response.ok) {
        throw new Error('Erro no processamento');
      }

      const result = await response.json();
      setResult(result);
      
      // 3. Log da geração para tracking
      await logAIGeneration({
        featureCode: 'tools.nova_ferramenta',
        provider: 'openai',
        model: 'gpt-4o-mini',
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
        cost: result.cost,
        prompt: inputData.substring(0, 1000),
        response: JSON.stringify(result.result).substring(0, 1000)
      });

      toast.success('Processamento concluído com sucesso!');
      
    } catch (error) {
      console.error('Erro no processamento:', error);
      toast.error('Erro no processamento. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle>Dados de Entrada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={inputData}
            onChange={(e) => setInputData(e.target.value)}
            placeholder="Insira os dados para processamento..."
            rows={6}
            disabled={isProcessing}
          />
          <Button 
            onClick={handleProcess}
            disabled={isProcessing || !inputData.trim()}
            className="w-full"
          >
            {isProcessing ? (
              <>
                <LoadingSpinner className="mr-2" />
                Processando...
              </>
            ) : (
              'Processar (5 créditos)'
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado do Processamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(result.result, null, 2)}
                </pre>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sessão: {result.sessionId} | Tokens: {result.usage.totalTokens} | Custo: ${result.cost.toFixed(4)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### 8.3 Registro da Rota

```typescript
// client/src/App.tsx
// Adicionar na seção de rotas
<Route path="/ferramentas/nova-ferramenta">
  <ProtectedRoute>
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <NovaFerramentaPro />
      </Suspense>
    </Layout>
  </ProtectedRoute>
</Route>
```

### 8.4 Adição ao Catálogo

```typescript
// client/src/pages/Ferramentas.tsx
// Adicionar ao array ferramentas
{
  title: "Nova Ferramenta PRO",
  description: "Descrição da nova ferramenta com suas principais funcionalidades",
  href: "/ferramentas/nova-ferramenta",
  icon: IconName, // Importar ícone apropriado
  category: "Categoria",
  credits: 5,
  permission: "tools.nova_ferramenta"
}
```

---

## 9. Estrutura Backend

### 9.1 Controller

```typescript
// server/controllers/NovaFerramentaController.ts
import { Request, Response } from 'express';
import { NovaFerramentaService } from '../services/NovaFerramentaService';

export class NovaFerramentaController {
  static async process(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Usuário não autenticado' });
      }

      const { inputData, parameters } = req.body;

      if (!inputData) {
        return res.status(400).json({ error: 'Dados de entrada são obrigatórios' });
      }

      const result = await NovaFerramentaService.processWithAI(
        userId,
        inputData,
        parameters || {}
      );

      res.json({
        success: true,
        data: result
      });

    } catch (error: any) {
      console.error('Erro no processamento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor',
        message: error.message
      });
    }
  }

  static async getSession(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const userId = req.user?.id;

      const session = await NovaFerramentaService.getSession(sessionId, userId);
      
      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }

      res.json(session);
    } catch (error: any) {
      console.error('Erro ao buscar sessão:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
```

### 9.2 Rotas

```typescript
// server/routes/novaFerramentaRoutes.ts
import { Router } from 'express';
import { NovaFerramentaController } from '../controllers/NovaFerramentaController';
import { requireAuth } from '../middleware/auth';
import { requirePermission } from '../middleware/permissions';

const router = Router();

// Aplicar middleware de autenticação e permissão
router.use(requireAuth);
router.use(requirePermission('tools.nova_ferramenta'));

// Rotas principais
router.post('/process', NovaFerramentaController.process);
router.get('/session/:sessionId', NovaFerramentaController.getSession);

export default router;
```

### 9.3 Integração nas Rotas Principais

```typescript
// server/routes/index.ts
import novaFerramentaRoutes from './novaFerramentaRoutes';

// Adicionar ao conjunto de rotas
router.use('/api/nova-ferramenta', novaFerramentaRoutes);
```

## 9.4 Documentação Completa de Endpoints

### Estrutura Base de Endpoints

Todos os endpoints seguem o padrão REST e incluem autenticação JWT:

```
Base URL: https://api.alunopowerplatform.com
Authentication: Bearer Token (JWT)
Content-Type: application/json
```

### Endpoints de Ferramentas

#### 1. Processamento Principal
```
POST /api/nova-ferramenta/process
Content-Type: application/json
Authorization: Bearer <jwt_token>

Request Body:
{
  "inputData": "dados de entrada",
  "parameters": {
    "option1": "valor1",
    "option2": 123,
    "option3": true
  }
}

Response:
{
  "success": true,
  "data": {
    "sessionId": "uuid-session",
    "result": {
      "processedData": "resultado processado",
      "metadata": {
        "processingTime": 1500,
        "model": "gpt-4o-mini",
        "tokensUsed": 250
      }
    },
    "usage": {
      "inputTokens": 100,
      "outputTokens": 150,
      "totalTokens": 250
    },
    "cost": 0.0025
  }
}
```

#### 2. Consulta de Sessão
```
GET /api/nova-ferramenta/session/:sessionId
Authorization: Bearer <jwt_token>

Response:
{
  "id": "uuid-session",
  "userId": 123,
  "status": "completed",
  "inputData": { ... },
  "result": { ... },
  "createdAt": "2024-01-01T00:00:00Z",
  "completedAt": "2024-01-01T00:00:01Z"
}
```

### Endpoints de Sistema

#### 1. Autenticação
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

#### 2. Créditos
```
GET /api/credits/balance
GET /api/credits/history
POST /api/credits/purchase
```

#### 3. Permissões
```
GET /api/permissions/user
GET /api/permissions/groups
POST /api/permissions/check
```

#### 4. Dashboard
```
GET /api/dashboard/stats
GET /api/dashboard/recent-activity
GET /api/dashboard/usage-analytics
```

### Endpoints de IA

#### 1. Provedores de IA
```
GET /api/ai-providers/status
POST /api/ai-providers/test
GET /api/ai-providers/config
```

#### 2. Geração de Conteúdo
```
POST /api/ai/generate
POST /api/ai/analyze
POST /api/ai/optimize
```

### Endpoints de Ferramentas Específicas

#### 1. Background Removal
```
POST /api/background-removal/process
GET /api/background-removal/session/:id
POST /api/background-removal/download/:id
```

#### 2. Amazon Tools
```
POST /api/amazon/ads-editor/optimize
POST /api/amazon/reviews/extract
POST /api/amazon/keywords/research
```

#### 3. Simuladores
```
GET /api/simulations/simples-nacional
POST /api/simulations/simples-nacional
PUT /api/simulations/simples-nacional/:id
DELETE /api/simulations/simples-nacional/:id

GET /api/simulations/import
POST /api/simulations/import
PUT /api/simulations/import/:id
DELETE /api/simulations/import/:id

GET /api/investment-simulations
POST /api/investment-simulations
PUT /api/investment-simulations/:id
DELETE /api/investment-simulations/:id
```

### Códigos de Status HTTP

```
200 - Sucesso
201 - Criado com sucesso
400 - Dados inválidos
401 - Não autenticado
403 - Acesso negado
404 - Não encontrado
429 - Rate limit excedido
500 - Erro interno do servidor
```

### Headers de Resposta

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-Request-ID: uuid-request
X-Processing-Time: 1500ms
```

### Tratamento de Erros

```json
{
  "error": "Descrição do erro",
  "message": "Detalhes técnicos (apenas em desenvolvimento)",
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T00:00:00Z",
  "requestId": "uuid-request"
}
```

### Rate Limiting

- **Autenticação**: 10 requests por 15 minutos
- **Ferramentas**: 100 requests por 15 minutos
- **Simuladores**: 100 requests por 15 minutos
- **Uploads**: 50 requests por 15 minutos

### Webhooks (se aplicável)

```
POST /webhook/nova-ferramenta/status
Content-Type: application/json

{
  "sessionId": "uuid-session",
  "status": "completed",
  "result": { ... },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Exemplo de Integração Completa

```typescript
// Cliente JavaScript/TypeScript
class NovaFerramentaAPI {
  private baseURL = 'https://api.alunopowerplatform.com';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  async process(inputData: any, parameters: any = {}) {
    const response = await fetch(`${this.baseURL}/api/nova-ferramenta/process`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ inputData, parameters })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erro na requisição');
    }

    return response.json();
  }

  async getSession(sessionId: string) {
    const response = await fetch(`${this.baseURL}/api/nova-ferramenta/session/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    if (!response.ok) {
      throw new Error('Sessão não encontrada');
    }

    return response.json();
  }
}

// Uso
const api = new NovaFerramentaAPI('jwt-token');
const result = await api.process('dados de entrada', { option1: 'valor' });
console.log(result.data);
```

---

## 10. Guia Passo a Passo

### Passo 1: Definição e Planejamento
1. [ ] Definir nome, categoria e funcionalidade
2. [ ] Determinar custo em créditos
3. [ ] Escolher provedor de IA
4. [ ] Definir estrutura de dados entrada/saída
5. [ ] Criar wireframes/mockups da interface

### Passo 2: Configuração do Banco de Dados
1. [ ] Criar tabelas específicas (configs, sessions)
2. [ ] Inserir registro na tabela `tools`
3. [ ] Configurar `feature_costs`
4. [ ] Testar estrutura com dados de exemplo

### Passo 3: Backend - Serviço e API
1. [ ] Criar Service class seguindo padrão
2. [ ] Implementar integração com IA
3. [ ] Criar Controller com validações
4. [ ] Configurar rotas com middleware
5. [ ] Testar endpoints via Postman/curl

### Passo 4: Sistema de Permissões
1. [ ] Adicionar feature ao PermissionService
2. [ ] Criar middleware específico
3. [ ] Configurar grupos de acesso
4. [ ] Testar permissões via API

### Passo 5: Frontend - Componentes
1. [ ] Criar página principal da ferramenta
2. [ ] Implementar componente de processamento
3. [ ] Integrar com sistema de créditos
4. [ ] Adicionar guards de permissão
5. [ ] Configurar rotas e navegação

### Passo 6: Integração e Catálogo
1. [ ] Adicionar ao catálogo de ferramentas
2. [ ] Configurar ícone e descrições
3. [ ] Testar fluxo completo
4. [ ] Validar sistema de créditos

### Passo 7: Testes e Validação
1. [ ] Teste funcional completo
2. [ ] Verificar logs e auditoria
3. [ ] Validar performance
4. [ ] Testar cenários de erro

### Passo 8: Documentação e Deploy
1. [ ] Documentar API endpoints
2. [ ] Criar guia de uso para usuários
3. [ ] Commit e deploy para produção
4. [ ] Monitorar logs iniciais

---

## 11. Padrões de Código

### 11.1 Nomenclatura
- **Arquivos**: PascalCase para componentes, camelCase para utilitários
- **Variáveis**: camelCase
- **Constantes**: UPPER_SNAKE_CASE
- **Interfaces**: PascalCase com prefixo I (opcional)
- **Types**: PascalCase

### 11.2 Estrutura de Pastas
```
/client/src/
├── components/nova-ferramenta/
│   ├── NovaFerramentaComponent.tsx
│   ├── NovaFerramentaUpload.tsx
│   ├── NovaFerramentaResult.tsx
│   └── index.ts
├── pages/tools/
│   └── NovaFerramenta.tsx
├── hooks/
│   └── useNovaFerramenta.ts (se necessário)
└── types/
    └── nova-ferramenta.ts

/server/
├── controllers/
│   └── NovaFerramentaController.ts
├── services/
│   └── NovaFerramentaService.ts
├── routes/
│   └── novaFerramentaRoutes.ts
└── types/
    └── nova-ferramenta.ts
```

### 11.3 TypeScript Interfaces

```typescript
// Tipos compartilhados
export interface NovaFerramentaInput {
  inputData: string;
  parameters: {
    option1?: string;
    option2?: number;
    option3?: boolean;
  };
}

export interface NovaFerramentaResult {
  processedData: any;
  metadata: {
    processingTime: number;
    model: string;
    tokensUsed: number;
  };
}

export interface NovaFerramentaSession {
  id: string;
  userId: number;
  status: 'processing' | 'completed' | 'failed';
  inputData: NovaFerramentaInput;
  result?: NovaFerramentaResult;
  createdAt: Date;
  completedAt?: Date;
}
```

### 11.4 Error Handling Padrão

```typescript
// Frontend
try {
  const result = await processFunction();
  toast.success('Processamento concluído!');
} catch (error: any) {
  console.error('Erro:', error);
  toast.error(error.message || 'Erro no processamento');
}

// Backend
try {
  const result = await service.process(data);
  res.json({ success: true, data: result });
} catch (error: any) {
  console.error(`[NOVA_FERRAMENTA] Erro:`, error);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Erro no processamento'
  });
}
```

---

## 12. Checklist Final

### Banco de Dados ✅
- [ ] Tabelas criadas e estruturadas
- [ ] Registro na tabela `tools`
- [ ] Configuração em `feature_costs`
- [ ] Permissão adicionada ao sistema
- [ ] Migração/seed executado

### Backend ✅
- [ ] Service implementado com padrão AI
- [ ] Controller com validações adequadas
- [ ] Rotas configuradas com middleware
- [ ] Integração com sistema de créditos
- [ ] Logs e auditoria implementados
- [ ] Testes de API funcionando

### Frontend ✅
- [ ] Página principal criada
- [ ] Componente de processamento implementado
- [ ] Guards de permissão aplicados
- [ ] Integração com sistema de créditos
- [ ] Loading states e feedback visual
- [ ] Tratamento de erros adequado

### Integração ✅
- [ ] Rota adicionada ao App.tsx
- [ ] Ferramenta no catálogo (Ferramentas.tsx)
- [ ] Navegação funcionando
- [ ] Permissões testadas
- [ ] Fluxo de créditos validado

### Qualidade ✅
- [ ] Código seguindo padrões estabelecidos
- [ ] TypeScript sem erros
- [ ] Componentes responsivos
- [ ] Acessibilidade básica
- [ ] Performance adequada
- [ ] Logs implementados

### Documentação ✅
- [ ] README da ferramenta atualizado
- [ ] Comentários no código crítico
- [ ] API documentada
- [ ] Guia de uso para usuários
- [ ] Registro de mudanças atualizado

---

## Exemplo Completo: Ferramenta de Análise de Texto

### Definição
- **Nome**: Analisador de Sentimentos PRO
- **Categoria**: Ferramentas de IA
- **Funcionalidade**: Análise de sentimentos em textos
- **Custo**: 3 créditos por análise
- **IA**: OpenAI GPT-4o-mini

### Implementação Resumida

```sql
-- 1. Banco de dados
INSERT INTO tools (name, description, type_id, features, brazil_support, verified)
VALUES ('Analisador de Sentimentos PRO', 'Análise avançada de sentimentos em textos', 1, 
        ARRAY['Análise de sentimentos', 'Classificação emocional', 'Relatório detalhado'], 
        'works', true);

INSERT INTO feature_costs (feature_name, cost_per_use, description, category)
VALUES ('tools.sentiment_analyzer', 3.00, 'Análise de Sentimentos - por texto', 'Ferramentas');
```

```typescript
// 2. Backend Service
export class SentimentAnalyzerService {
  async analyzeSentiment(userId: number, text: string) {
    const sessionId = await this.createSession({ userId, tool: 'sentiment_analyzer', originalText: text });
    
    try {
      const aiResponse = await aiProviderService.generateResponse({
        provider: "openai",
        model: "gpt-4o-mini",
        messages: [
          { role: 'system', content: 'Você é um analisador de sentimentos especializado...' },
          { role: 'user', content: `Analise o sentimento do seguinte texto: "${text}"` }
        ],
        temperature: 0.3,
        maxTokens: 500
      });
      
      const analysis = JSON.parse(aiResponse.content);
      await this.updateSession(sessionId, { status: 'completed', result: analysis });
      
      return { sessionId, analysis, usage: aiResponse.usage, cost: aiResponse.cost };
    } catch (error) {
      await this.updateSession(sessionId, { status: 'failed', errorMessage: error.message });
      throw error;
    }
  }
}
```

```typescript
// 3. Frontend Component
export function SentimentAnalyzerComponent() {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { checkCredits, logAIGeneration } = useCreditSystem();

  const handleAnalyze = async () => {
    const creditCheck = await checkCredits('tools.sentiment_analyzer');
    if (!creditCheck.canProcess) {
      toast.error(`Créditos insuficientes. Necessário: ${creditCheck.requiredCredits}`);
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch('/api/sentiment-analyzer/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ text })
      });
      
      const result = await response.json();
      setResult(result);
      
      await logAIGeneration({
        featureCode: 'tools.sentiment_analyzer',
        provider: 'openai',
        model: 'gpt-4o-mini',
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
        cost: result.cost,
        prompt: text.substring(0, 1000),
        response: JSON.stringify(result.analysis).substring(0, 1000)
      });
      
      toast.success('Análise concluída!');
    } catch (error) {
      toast.error('Erro na análise');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Texto para Análise</CardTitle></CardHeader>
        <CardContent>
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} />
          <Button onClick={handleAnalyze} disabled={isProcessing || !text.trim()} className="w-full mt-4">
            {isProcessing ? 'Analisando...' : 'Analisar Sentimento (3 créditos)'}
          </Button>
        </CardContent>
      </Card>
      
      {result && (
        <Card>
          <CardHeader><CardTitle>Resultado da Análise</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-lg">Sentimento: <strong>{result.analysis.sentiment}</strong></div>
              <div>Confiança: {(result.analysis.confidence * 100).toFixed(1)}%</div>
              <div className="text-sm text-gray-600">
                Tokens: {result.usage.totalTokens} | Custo: ${result.cost.toFixed(4)}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Conclusão

Este guia fornece toda a estrutura necessária para criar ferramentas robustas no Aluno Power Platform. Seguindo estes padrões, você garante:

- **Consistência** com o sistema existente
- **Segurança** através do sistema de permissões
- **Sustentabilidade** via sistema de créditos
- **Qualidade** seguindo padrões de código estabelecidos
- **Manutenibilidade** com arquitetura bem estruturada

**Próximos Passos**: Use este documento como referência para implementar sua nova ferramenta e consulte os exemplos existentes no código para padrões específicos.