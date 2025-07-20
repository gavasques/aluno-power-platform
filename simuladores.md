# Sistema de Simuladores - Documentação Completa

## Visão Geral

O sistema de simuladores é uma parte fundamental da plataforma Aluno Power Platform, oferecendo ferramentas de cálculo e simulação para diferentes cenários empresariais. Cada simulador segue um padrão arquitetural consistente e possui controle granular de permissões.

## Arquitetura do Sistema

### Estrutura de Diretórios

```
client/src/
├── pages/simuladores/           # Páginas principais dos simuladores
│   ├── SimplesNacional.tsx
│   ├── ImportacaoSimplificada.tsx
│   ├── InvestimentosROI.tsx
│   └── SimplesNacionalCompleto.tsx
├── components/simulators/       # Componentes refatorados dos simuladores
│   ├── investment-roi/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── InvestimentosROIRefactored.tsx
│   ├── informal-import/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types.ts
│   │   ├── utils.ts
│   │   └── ImportacaoSimplificadaRefactored.tsx
│   └── simples-nacional-completo/
│       ├── components/
│       ├── hooks/
│       ├── types.ts
│       ├── utils.ts
│       └── constants.ts
```

### Simuladores Disponíveis

1. **Simples Nacional** (`simples_nacional`)
   - Cálculo de tarifas do Simples Nacional
   - Análise de faturamento e alíquotas
   - Suporte a ST (Substituição Tributária)

2. **Importação Simplificada** (`import_calculator`)
   - Cálculo de custos de importação
   - Rateio de frete e despesas
   - Análise de impostos (II, ICMS)

3. **Investimentos ROI** (`investment_roi`)
   - Simulação de investimentos com giros
   - Cálculo de retorno sobre investimento
   - Análise de ciclos de investimento

4. **Importação Formal** (`formal_import`)
   - Cálculo baseado em CBM (Cubic Meter)
   - Análise completa de custos de importação
   - Gestão de despachante e agente de cargas

## Sistema de Permissões

### Estrutura de Permissões

Cada simulador possui permissões granulares definidas no sistema:

```typescript
// Padrão de permissão: simulators.{tipo_simulador}
requireSimulatorAccess('simples_nacional')
requireSimulatorAccess('import_calculator')
requireSimulatorAccess('investment_roi')
requireSimulatorAccess('formal_import')
```

### Middleware de Permissões

```typescript
// server/middleware/permissions.ts
export const requireSimulatorAccess = (simulatorType: string) => 
  requirePermission(`simulators.${simulatorType}`);
```

### Verificação de Acesso

O sistema verifica permissões em:
- **Rotas de API**: Todos os endpoints `/api/simulations/*`
- **Páginas Frontend**: Componentes de simuladores
- **Operações CRUD**: Create, Read, Update, Delete de simulações

## Banco de Dados

### Tabelas de Simuladores

#### 1. Investment Simulations (`investment_simulations`)
```sql
CREATE TABLE investment_simulations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  name TEXT NOT NULL DEFAULT 'Nova Simulação',
  initial_investment INTEGER NOT NULL DEFAULT 10000,
  cycle_duration INTEGER NOT NULL DEFAULT 45,
  cycle_unit TEXT NOT NULL DEFAULT 'Dias',
  number_of_cycles INTEGER NOT NULL DEFAULT 12,
  cycles JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

#### 2. Import Simulations (`import_simulations`)
```sql
CREATE TABLE import_simulations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  nome_simulacao TEXT NOT NULL,
  codigo_simulacao TEXT NOT NULL,
  nome_fornecedor TEXT,
  observacoes TEXT,
  data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
  data_ultima_modificacao TIMESTAMP NOT NULL DEFAULT NOW(),
  configuracoes_gerais JSONB NOT NULL,
  produtos JSONB NOT NULL
);
```

#### 3. Formal Import Simulations (`formal_import_simulations`)
```sql
CREATE TABLE formal_import_simulations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  nome TEXT NOT NULL,
  data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
  data_modificacao TIMESTAMP NOT NULL DEFAULT NOW(),
  fornecedor TEXT,
  despachante TEXT,
  agente_cargas TEXT,
  status TEXT NOT NULL DEFAULT 'Em andamento',
  taxa_dolar DECIMAL(10,4) NOT NULL,
  valor_fob_dolar DECIMAL(15,2) NOT NULL,
  valor_frete_dolar DECIMAL(15,2) NOT NULL,
  percentual_seguro DECIMAL(5,2) NOT NULL DEFAULT 0.5,
  impostos JSONB NOT NULL,
  despesas_adicionais JSONB NOT NULL,
  produtos JSONB NOT NULL,
  resultados JSONB NOT NULL,
  codigo_simulacao TEXT NOT NULL UNIQUE
);
```

#### 4. Simples Nacional Simulations (`simples_nacional_simulations`)
```sql
CREATE TABLE simples_nacional_simulations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) NOT NULL,
  nome_simulacao TEXT NOT NULL,
  codigo_simulacao TEXT NOT NULL,
  observacoes TEXT,
  faturamento_12_meses DECIMAL(15,2) NOT NULL,
  faturamento_sem_st DECIMAL(15,2) NOT NULL,
  faturamento_com_st DECIMAL(15,2) NOT NULL,
  faturamento_total DECIMAL(15,2) NOT NULL,
  aliquota_base DECIMAL(8,6) NOT NULL,
  valor_reduzir DECIMAL(15,2) NOT NULL,
  aliquota_efetiva DECIMAL(8,6) NOT NULL,
  percentual_icms DECIMAL(8,6) NOT NULL,
  valor_simples_sem_st DECIMAL(15,2) NOT NULL,
  valor_simples_com_st DECIMAL(15,2) NOT NULL,
  valor_total_simples DECIMAL(15,2) NOT NULL,
  data_criacao TIMESTAMP NOT NULL DEFAULT NOW(),
  data_ultima_modificacao TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Índices de Performance

```sql
-- Índices para otimização de consultas
CREATE INDEX investment_simulations_user_idx ON investment_simulations(user_id);
CREATE INDEX investment_simulations_created_idx ON investment_simulations(created_at);

CREATE INDEX import_simulations_user_idx ON import_simulations(user_id);
CREATE INDEX import_simulations_codigo_idx ON import_simulations(codigo_simulacao);

CREATE INDEX formal_import_simulations_user_idx ON formal_import_simulations(user_id);
CREATE INDEX formal_import_simulations_codigo_idx ON formal_import_simulations(codigo_simulacao);
CREATE INDEX formal_import_simulations_status_idx ON formal_import_simulations(status);
CREATE INDEX formal_import_simulations_data_modificacao_idx ON formal_import_simulations(data_modificacao);

CREATE INDEX simples_nacional_simulations_user_idx ON simples_nacional_simulations(user_id);
CREATE INDEX simples_nacional_simulations_codigo_idx ON simples_nacional_simulations(codigo_simulacao);
```

## API Endpoints

### Estrutura Base de Endpoints

Todos os simuladores seguem o padrão REST:

```
GET    /api/simulations/{tipo}           # Listar simulações
GET    /api/simulations/{tipo}/:id       # Obter simulação específica
POST   /api/simulations/{tipo}           # Criar nova simulação
PUT    /api/simulations/{tipo}/:id       # Atualizar simulação
DELETE /api/simulations/{tipo}/:id       # Excluir simulação
```

### Endpoints por Simulador

#### Investment ROI
```
GET    /api/investment-simulations
GET    /api/investment-simulations/:id
POST   /api/investment-simulations
PUT    /api/investment-simulations/:id
DELETE /api/investment-simulations/:id
```

#### Import Simplificada
```
GET    /api/simulations/import
GET    /api/simulations/import/:id
POST   /api/simulations/import
PUT    /api/simulations/import/:id
DELETE /api/simulations/import/:id
```

#### Simples Nacional
```
GET    /api/simulations/simples-nacional
GET    /api/simulations/simples-nacional/:id
POST   /api/simulations/simples-nacional
PUT    /api/simulations/simples-nacional/:id
DELETE /api/simulations/simples-nacional/:id
```

#### Importação Formal
```
GET    /api/simulations/formal-import
GET    /api/simulations/formal-import/:id
POST   /api/simulations/formal-import
PUT    /api/simulations/formal-import/:id
DELETE /api/simulations/formal-import/:id
```

## Padrões de Código

### 1. Estrutura de Types

Cada simulador deve ter um arquivo `types.ts`:

```typescript
// Exemplo: client/src/components/simulators/investment-roi/types.ts

export interface ConfiguracaoSimulacao {
  investimentoInicial: number;
  duracaoGiro: number;
  unidadeTempo: 'Dias' | 'Semanas' | 'Meses';
  numeroGiros: number;
}

export interface SimulationMetadata {
  id?: number;
  nomeSimulacao: string;
  codigoSimulacao?: string;
  observacoes?: string;
  dataCriacao?: string;
  dataModificacao?: string;
}

export interface SimulacaoCompleta extends SimulationMetadata {
  // Campos específicos do simulador
}

export interface CalculatedResults {
  // Resultados calculados
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

// Constantes padrão
export const DEFAULT_CONFIG: ConfiguracaoSimulacao = {
  // Valores padrão
};

export const VALIDATION_RULES = {
  // Regras de validação
};
```

### 2. Estrutura de Utils

Cada simulador deve ter um arquivo `utils.ts`:

```typescript
// Exemplo: client/src/components/simulators/investment-roi/utils.ts

export function calcularSimulacao(dados: SimulacaoCompleta): CalculatedResults {
  // Lógica de cálculo específica do simulador
}

export function validarDados(dados: SimulacaoCompleta): ValidationResult {
  // Validação específica do simulador
}

export function formatarResultados(resultados: CalculatedResults): string {
  // Formatação para exibição
}

export function exportarParaPDF(simulacao: SimulacaoCompleta): void {
  // Exportação para PDF
}
```

### 3. Estrutura de Componentes

Cada simulador deve ter um componente principal:

```typescript
// Exemplo: client/src/components/simulators/investment-roi/InvestimentosROIRefactored.tsx

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useCreditSystem } from '@/hooks/useCreditSystem';
import { apiRequest } from '@/lib/queryClient';
import { 
  SimulacaoCompleta, 
  CalculatedResults, 
  DEFAULT_CONFIG 
} from './types';
import { calcularSimulacao, validarDados } from './utils';

const FEATURE_CODE = 'simulators.investment_roi';

export default function InvestimentosROIRefactored() {
  // State management
  const [activeSimulation, setActiveSimulation] = useState<SimulacaoCompleta>(DEFAULT_CONFIG);
  const [simulationId, setSimulationId] = useState<number | null>(null);
  const [calculatedResults, setCalculatedResults] = useState<CalculatedResults | null>(null);

  // Hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();

  // API queries
  const { data: simulations = [], isLoading } = useQuery({
    queryKey: ['/api/investment-simulations'],
    enabled: true,
  });

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (data: SimulacaoCompleta) => {
      if (simulationId) {
        return apiRequest(`/api/investment-simulations/${simulationId}`, {
          method: 'PUT',
          body: data
        });
      } else {
        return apiRequest('/api/investment-simulations', {
          method: 'POST',
          body: data
        });
      }
    },
    onSuccess: async (data) => {
      // Lógica de sucesso
    },
    onError: (error) => {
      // Tratamento de erro
    }
  });

  // Event handlers
  const handleSave = async () => {
    // Lógica de salvamento
  };

  const handleCalculate = () => {
    // Lógica de cálculo
  };

  // Render
  return (
    <div>
      {/* Interface do simulador */}
    </div>
  );
}
```

## Sistema de Créditos

### Integração com Sistema de Créditos

Cada simulador deve integrar com o sistema de créditos:

```typescript
const FEATURE_CODE = 'simulators.{tipo_simulador}';

// Verificação de créditos antes de salvar
const handleSave = async () => {
  const hasCredits = await checkCredits(FEATURE_CODE);
  if (!hasCredits) {
    showInsufficientCreditsToast();
    return;
  }

  // Lógica de salvamento
  await saveMutation.mutateAsync(activeSimulation);
  
  // Log de uso
  await logAIGeneration({
    featureCode: FEATURE_CODE,
    provider: 'simulation',
    model: 'calculation',
    prompt: `Nova simulação ${activeSimulation.nomeSimulacao}`,
    response: `Simulação criada com sucesso`,
    inputTokens: 0,
    outputTokens: 0,
    cost: 0
  });
};
```

## Validação e Segurança

### Validação de Dados

```typescript
// Exemplo de validação
export function validarSimulacao(dados: SimulacaoCompleta): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // Validações obrigatórias
  if (!dados.nomeSimulacao?.trim()) {
    errors.push({
      field: 'nomeSimulacao',
      message: 'Nome da simulação é obrigatório',
      type: 'required'
    });
  }

  // Validações de formato
  if (dados.valorInicial < 0) {
    errors.push({
      field: 'valorInicial',
      message: 'Valor inicial deve ser positivo',
      type: 'range'
    });
  }

  // Avisos de performance
  if (dados.numeroGiros > 100) {
    warnings.push({
      field: 'numeroGiros',
      message: 'Muitos giros podem afetar a performance',
      type: 'performance'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

### Sanitização de Input

```typescript
// Sanitização de valores monetários
export function sanitizeCurrency(value: string): number {
  if (!value) return 0;
  const cleanValue = value.replace(/R\$\s?/g, '').replace(/\./g, '').replace(/,/g, '.');
  const numValue = parseFloat(cleanValue);
  return isNaN(numValue) ? 0 : numValue;
}

// Sanitização de texto
export function sanitizeText(value: string): string {
  return value?.trim().replace(/[<>]/g, '') || '';
}
```

## Sistema de Auditoria

### Logs de Acesso

O sistema registra automaticamente:

```typescript
// Log de acesso bem-sucedido
await AuditService.logSuccessfulAccess(
  userId,
  req.method,
  req.path,
  feature,
  { userAgent: req.get('User-Agent'), ipAddress: req.ip }
);

// Log de acesso negado
await AuditService.logDeniedAccess(
  userId,
  req.method,
  req.path,
  feature,
  'Insufficient permissions'
);
```

### Rate Limiting

```typescript
// Rate limiting específico para simuladores
// 100 requests por 15 minutos por usuário
const simulatorRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests
  message: 'Muitas requisições para simuladores. Tente novamente em 15 minutos.'
});
```

## Criação de Novo Simulador

### Passo a Passo

1. **Definir Schema no Banco**
```typescript
// shared/schema.ts
export const novoSimuladorSimulations = pgTable("novo_simulador_simulations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  nomeSimulacao: text("nome_simulacao").notNull(),
  codigoSimulacao: text("codigo_simulacao").notNull(),
  // Campos específicos do simulador
  dataCreated: timestamp("data_criacao").notNull().defaultNow(),
  dataLastModified: timestamp("data_ultima_modificacao").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("novo_simulador_simulations_user_idx").on(table.userId),
  codigoIdx: index("novo_simulador_simulations_codigo_idx").on(table.codigoSimulacao),
}));
```

2. **Criar Types**
```typescript
// client/src/components/simulators/novo-simulador/types.ts
export interface NovoSimuladorConfig {
  // Configurações específicas
}

export interface NovoSimuladorSimulation {
  id?: number;
  nomeSimulacao: string;
  codigoSimulacao?: string;
  // Campos específicos
}

export const DEFAULT_CONFIG: NovoSimuladorConfig = {
  // Valores padrão
};
```

3. **Criar Utils**
```typescript
// client/src/components/simulators/novo-simulador/utils.ts
export function calcularNovoSimulador(dados: NovoSimuladorSimulation): CalculatedResults {
  // Lógica de cálculo
}

export function validarNovoSimulador(dados: NovoSimuladorSimulation): ValidationResult {
  // Validação
}
```

4. **Criar Componente Principal**
```typescript
// client/src/components/simulators/novo-simulador/NovoSimuladorRefactored.tsx
const FEATURE_CODE = 'simulators.novo_simulador';

export default function NovoSimuladorRefactored() {
  // Implementação seguindo o padrão
}
```

5. **Criar Página**
```typescript
// client/src/pages/simuladores/NovoSimulador.tsx
import NovoSimuladorRefactored from '@/components/simulators/novo-simulador/NovoSimuladorRefactored';

export default function NovoSimulador() {
  return <NovoSimuladorRefactored />;
}
```

6. **Adicionar Rotas API**
```typescript
// server/routes/simulators.ts
// GET /api/simulations/novo-simulador
// POST /api/simulations/novo-simulador
// PUT /api/simulations/novo-simulador/:id
// DELETE /api/simulations/novo-simulador/:id
```

7. **Configurar Permissões**
```typescript
// Adicionar permissão no sistema
// simulators.novo_simulador
```

8. **Adicionar ao Menu**
```typescript
// Adicionar item no menu de simuladores
```

## Padrões de UI/UX

### Layout Consistente

```typescript
// Estrutura padrão de layout
<div className="container mx-auto p-6">
  <div className="mb-6">
    <h1 className="text-2xl font-bold">Nome do Simulador</h1>
    <p className="text-muted-foreground">Descrição do simulador</p>
  </div>
  
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Formulário de entrada */}
    <Card>
      <CardHeader>
        <CardTitle>Configurações</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Campos do formulário */}
      </CardContent>
    </Card>
    
    {/* Resultados */}
    <Card>
      <CardHeader>
        <CardTitle>Resultados</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Exibição dos resultados */}
      </CardContent>
    </Card>
  </div>
</div>
```

### Componentes Reutilizáveis

```typescript
// Componentes padrão para simuladores
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Calculator, FileText, AlertTriangle } from "lucide-react";
```

## Monitoramento e Analytics

### Métricas de Uso

```typescript
// Log de uso de simuladores
await logAIGeneration({
  featureCode: FEATURE_CODE,
  provider: 'simulation',
  model: 'calculation',
  prompt: `Simulação ${tipo} - ${nomeSimulacao}`,
  response: `Resultados calculados com sucesso`,
  inputTokens: 0,
  outputTokens: 0,
  cost: 0
});
```

### Performance Monitoring

```typescript
// Monitoramento de performance
console.time('simulation-calculation');
const results = calcularSimulacao(dados);
console.timeEnd('simulation-calculation');
```

## Troubleshooting

### Problemas Comuns

1. **Erro de Permissão**
   - Verificar se o usuário tem a permissão `simulators.{tipo}`
   - Verificar se o grupo do usuário tem acesso ao simulador

2. **Erro de Validação**
   - Verificar se todos os campos obrigatórios estão preenchidos
   - Verificar se os valores estão dentro dos limites aceitáveis

3. **Erro de Cálculo**
   - Verificar se os dados de entrada são válidos
   - Verificar se as fórmulas estão corretas

4. **Erro de Salvamento**
   - Verificar se o usuário tem créditos suficientes
   - Verificar se a conexão com o banco está funcionando

### Logs de Debug

```typescript
// Logs para debug
console.log('🔧 [SIMULATOR] Iniciando cálculo:', dados);
console.log('🔧 [SIMULATOR] Resultados calculados:', resultados);
console.log('🔧 [SIMULATOR] Salvando simulação:', simulacao);
```

## Conclusão

Este documento fornece uma visão completa do sistema de simuladores, incluindo arquitetura, permissões, padrões de código e processo de criação de novos simuladores. Seguindo estes padrões, é possível criar novos simuladores de forma consistente e segura. 