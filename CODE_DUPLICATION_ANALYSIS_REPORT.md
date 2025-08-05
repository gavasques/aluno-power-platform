# 🔍 Relatório de Análise de Duplicação de Código

**Data**: 05 de Agosto de 2025  
**Objetivo**: Identificar padrões de código duplicados e sugerir refatorações seguindo o princípio DRY

---

## 📊 Resumo Executivo

### Principais Áreas de Duplicação Identificadas:
- **CRUD Managers**: 8+ componentes com lógica similar
- **Hooks de Estado**: 12+ hooks com padrões repetitivos  
- **Serviços de API**: 6+ serviços com estruturas duplicadas
- **Formulários**: 10+ formulários com validação similar
- **Componentes UI**: 15+ componentes com estruturas repetitivas

### Impacto Estimado da Refatoração:
- **Redução de Código**: 30-40% menos linhas de código duplicado
- **Manutenibilidade**: Mudanças centralizadas em utilitários reutilizáveis
- **Consistência**: Padrões uniformes em toda a aplicação
- **Performance**: Redução de bundle size e re-renders desnecessários

---

## 🎯 Padrão 1: CRUD Managers Duplicados

### ❌ Problema Identificado
Múltiplos managers com estruturas praticamente idênticas:

**Arquivos Afetados:**
- `client/src/components/financas360/ContasBancariasManager.tsx` (~666 linhas)
- `client/src/components/financas360/EmpresasManager.tsx` (~400 linhas)
- `client/src/components/financas360/CanaisManager.tsx` (~500 linhas)
- `client/src/components/financas360/LancamentosManager.tsx` (~550 linhas)
- `client/src/components/financas360/BancosManager.tsx` (~450 linhas)

**Código Duplicado Comum:**
```typescript
// ❌ DUPLICADO em todos os managers:
const [isDialogOpen, setIsDialogOpen] = useState(false);
const [editingItem, setEditingItem] = useState<Entity | null>(null);
const [searchTerm, setSearchTerm] = useState('');
const [formData, setFormData] = useState<FormData>(initialState);

// Query padrão duplicado
const { data: items = [], isLoading } = useQuery({
  queryKey: ['entity-name'],
  queryFn: async () => {
    const response = await fetch(`/api/entity`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // ... resto da lógica similar
  },
  enabled: !!token && !authLoading
});

// Mutations duplicadas
const createMutation = useMutation({
  mutationFn: async (data: FormData) => {
    const response = await fetch(`/api/entity`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    // ... lógica similar
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['entity-name'] });
    setIsDialogOpen(false);
    toast({ title: "Sucesso", description: "Item criado com sucesso" });
  }
});
```

### ✅ Solução Proposta: Hook `useEntityCRUD`

**Novo Arquivo:** `client/src/shared/hooks/useEntityCRUD.ts`

```typescript
interface EntityCRUDConfig<T, TInsert> {
  entityName: string;
  apiEndpoint: string;
  queryKey: string[];
  initialFormData: TInsert;
  validationSchema?: any;
  onSuccessMessage?: string;
}

export function useEntityCRUD<T, TInsert>(config: EntityCRUDConfig<T, TInsert>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<TInsert>(config.initialFormData);
  
  // Query padrão
  const query = useQuery({
    queryKey: config.queryKey,
    queryFn: () => apiRequest(config.apiEndpoint),
    enabled: !!token && !authLoading
  });
  
  // Mutations padronizadas
  const createMutation = useMutation({
    mutationFn: (data: TInsert) => apiRequest(config.apiEndpoint, { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: config.queryKey });
      handleSuccess(`${config.entityName} criado com sucesso`);
    }
  });
  
  // Retorna interface unificada
  return {
    // Estados
    isDialogOpen, setIsDialogOpen,
    editingItem, setEditingItem,
    searchTerm, setSearchTerm,
    formData, setFormData,
    
    // Query data
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    
    // Actions
    create: createMutation.mutate,
    update: updateMutation.mutate,
    delete: deleteMutation.mutate,
    
    // Utils
    handleEdit: (item: T) => { setEditingItem(item); setIsDialogOpen(true); },
    handleCreate: () => { setEditingItem(null); setIsDialogOpen(true); },
    handleClose: () => { setIsDialogOpen(false); setEditingItem(null); }
  };
}
```

### 🔧 Refatoração de Exemplo

**Antes:** `ContasBancariasManager.tsx` (666 linhas)
```typescript
// ❌ 666 linhas de código duplicado
export default function ContasBancariasManager() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConta, setEditingConta] = useState<ContaBancaria | null>(null);
  // ... 600+ linhas de lógica repetitiva
}
```

**Depois:** `ContasBancariasManager.tsx` (~150 linhas)
```typescript
// ✅ Redução de 77% no código
export default function ContasBancariasManager() {
  const crud = useEntityCRUD<ContaBancaria, ContaBancariaInsert>({
    entityName: 'Conta Bancária',
    apiEndpoint: '/api/financas360/contas-bancarias',
    queryKey: ['financas360-contas-bancarias'],
    initialFormData: initialContaFormData
  });
  
  return (
    <EntityManagerLayout
      title="Contas Bancárias"
      icon={<CreditCard />}
      crud={crud}
      renderForm={(item, onSubmit) => <ContaBancariaForm item={item} onSubmit={onSubmit} />}
      renderList={(items, onEdit, onDelete) => <ContaBancariaList items={items} onEdit={onEdit} onDelete={onDelete} />}
      searchFields={['agencia', 'conta', 'banco.nome']}
    />
  );
}
```

**Redução de Código:** 666 → 150 linhas (77% redução)

---

## 🎯 Padrão 2: Hooks de Créditos Duplicados

### ❌ Problema Identificado

**Arquivos com Lógica Duplicada:**
- `client/src/hooks/useCreditSystem.ts` - Sistema principal de créditos
- `client/src/hooks/useUserCredits.ts` - Hook deprecated mas ainda usado
- `client/src/hooks/useUnifiedUserProfile.ts` - Dados de perfil incluindo créditos
- `client/src/hooks/useFeatureCosts.ts` - Custos de features

**Código Duplicado:**
```typescript
// ❌ Lógica similar de verificação de créditos em múltiplos hooks
const checkCredits = async (featureCode: string) => {
  // Lógica duplicada de fetch de saldo
  let currentBalance = 0;
  if (userProfile?.credits?.current !== undefined) {
    currentBalance = userProfile.credits.current;
  } else if (user?.credits) {
    currentBalance = parseFloat(user.credits.toString());
  }
  
  // Lógica duplicada de verificação
  const requiredCredits = getFeatureCost(featureCode);
  return currentBalance >= requiredCredits;
};
```

### ✅ Solução Proposta: Hook Unificado `useCreditManager`

**Novo Arquivo:** `client/src/shared/hooks/useCreditManager.ts`

```typescript
interface CreditOperation {
  featureCode: string;
  amount?: number;
  metadata?: any;
}

interface CreditState {
  current: number;
  isLoading: boolean;
  error: any;
}

export function useCreditManager() {
  const { data: userProfile } = useUnifiedUserProfile();
  
  // Estado consolidado
  const creditState: CreditState = {
    current: userProfile?.credits?.current || 0,
    isLoading: userProfile?.isLoading || false,
    error: userProfile?.error
  };
  
  // Operações centralizadas
  const operations = {
    check: useCallback(async (operation: CreditOperation) => {
      const requiredCredits = getFeatureCost(operation.featureCode);
      return {
        canProcess: creditState.current >= requiredCredits,
        requiredCredits,
        currentBalance: creditState.current,
        deficit: Math.max(0, requiredCredits - creditState.current)
      };
    }, [creditState.current]),
    
    deduct: useCallback(async (operation: CreditOperation) => {
      // Lógica centralizada de dedução
      return await apiRequest('/api/credits/deduct', {
        method: 'POST',
        body: operation
      });
    }, []),
    
    add: useCallback(async (amount: number, reason: string) => {
      return await apiRequest('/api/credits/add', {
        method: 'POST',
        body: { amount, reason }
      });
    }, [])
  };
  
  return {
    credits: creditState,
    ...operations,
    // Utilitários
    formatBalance: (amount: number) => `${amount} créditos`,
    isInsufficient: (requiredAmount: number) => creditState.current < requiredAmount
  };
}
```

**Eliminação de Hooks Duplicados:**
- `useUserCredits` → deprecado, redireciona para `useCreditManager`
- `useCreditSystem` → refatorado para usar `useCreditManager` internamente
- Lógica duplicada consolidada em um só lugar

---

## 🎯 Padrão 3: Serviços AI com Métodos Duplicados

### ❌ Problema Identificado

**Arquivo:** `server/services/aiProviderService.ts`

```typescript
// ❌ Métodos praticamente idênticos para cada provider
async generateOpenAI(request: AIRequest): Promise<AIResponse> {
  return this.generateResponse({ ...request, provider: 'openai' });
}

async generateAnthropic(request: AIRequest): Promise<AIResponse> {
  return this.generateResponse({ ...request, provider: 'anthropic' });
}

async generateGemini(request: AIRequest): Promise<AIResponse> {
  return this.generateResponse({ ...request, provider: 'gemini' });
}

async generateDeepSeek(request: AIRequest): Promise<AIResponse> {
  return this.generateResponse({ ...request, provider: 'deepseek' });
}

async generateXAI(request: AIRequest): Promise<AIResponse> {
  return this.generateResponse({ ...request, provider: 'xai' });
}
```

### ✅ Solução Proposta: Pattern Method Dinâmico

```typescript
export class AIProviderService {
  private static readonly SUPPORTED_PROVIDERS = [
    'openai', 'anthropic', 'gemini', 'deepseek', 'xai', 'openrouter'
  ] as const;

  // ✅ Método dinâmico que substitui todos os métodos duplicados
  async generate(provider: AIProvider, request: Omit<AIRequest, 'provider'>): Promise<AIResponse> {
    if (!this.SUPPORTED_PROVIDERS.includes(provider)) {
      throw new Error(`Unsupported provider: ${provider}`);
    }
    
    return this.generateResponse({ ...request, provider });
  }
  
  // ✅ Factory method para providers específicos (se necessário)
  provider(name: AIProvider) {
    return {
      generate: (request: Omit<AIRequest, 'provider'>) => this.generate(name, request)
    };
  }
}

// ✅ Uso simplificado:
const ai = new AIProviderService();

// Ao invés de: ai.generateOpenAI(request)
await ai.generate('openai', request);

// Ou com factory:
const openai = ai.provider('openai');
await openai.generate(request);
```

**Redução:** 6 métodos duplicados → 1 método genérico (83% redução)

---

## 🎯 Padrão 4: Formulários com Estruturas Similares

### ❌ Problema Identificado

**Arquivos com Formulários Similares:**
- `client/src/components/supplier/SupplierEditDialog.tsx`
- `client/src/components/product/ProductSupplierForm.tsx`
- `client/src/components/financas360/*/Form.tsx` (múltiplos)

**Código Duplicado:**
```typescript
// ❌ Estrutura repetitiva em todos os formulários
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues: initialValues
});

const [isSubmitting, setIsSubmitting] = useState(false);

const onSubmit = async (data: FormData) => {
  setIsSubmitting(true);
  try {
    await apiCall(data);
    toast({ title: "Sucesso", description: "Dados salvos" });
    onSuccess();
  } catch (error) {
    toast({ title: "Erro", description: "Falha ao salvar" });
  } finally {
    setIsSubmitting(false);
  }
};

// JSX repetitivo para cada campo
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Label</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

### ✅ Solução Proposta: Hook `useFormManager` + Componente `DynamicForm`

**Novo Hook:** `client/src/shared/hooks/useFormManager.ts`
```typescript
interface FormConfig<T> {
  schema: z.ZodSchema<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<void> | void;
  onSuccess?: () => void;
  successMessage?: string;
}

export function useFormManager<T>(config: FormConfig<T>) {
  const form = useForm<T>({
    resolver: zodResolver(config.schema),
    defaultValues: config.defaultValues
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = form.handleSubmit(async (data: T) => {
    setIsSubmitting(true);
    try {
      await config.onSubmit(data);
      toast({ 
        title: "Sucesso", 
        description: config.successMessage || "Dados salvos com sucesso" 
      });
      config.onSuccess?.();
    } catch (error) {
      toast({ 
        title: "Erro", 
        description: error instanceof Error ? error.message : "Falha ao salvar dados" 
      });
    } finally {
      setIsSubmitting(false);
    }
  });
  
  return {
    form,
    isSubmitting,
    handleSubmit,
    reset: form.reset,
    setValue: form.setValue,
    watch: form.watch,
    formState: form.formState
  };
}
```

**Componente Dinâmico:** `client/src/shared/components/DynamicForm.tsx`
```typescript
interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'switch';
  placeholder?: string;
  options?: { value: string; label: string }[];
  required?: boolean;
  description?: string;
}

interface DynamicFormProps<T> {
  formManager: ReturnType<typeof useFormManager<T>>;
  fields: FieldConfig[];
  submitLabel?: string;
  onCancel?: () => void;
}

export function DynamicForm<T>({ formManager, fields, submitLabel, onCancel }: DynamicFormProps<T>) {
  return (
    <Form {...formManager.form}>
      <form onSubmit={formManager.handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.name}
            control={formManager.form.control}
            name={field.name as any}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  {renderFieldComponent(field, formField)}
                </FormControl>
                {field.description && <FormDescription>{field.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={formManager.isSubmitting}>
            {formManager.isSubmitting ? "Salvando..." : (submitLabel || "Salvar")}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

**Refatoração de Exemplo:**

**Antes:** `SupplierEditDialog.tsx` (~200 linhas)
```typescript
// ❌ 200 linhas de código repetitivo
export function SupplierEditDialog({ supplier, onSave }) {
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: { /* ... */ }
  });
  
  // ... 150+ linhas de lógica duplicada
}
```

**Depois:** `SupplierEditDialog.tsx` (~50 linhas)
```typescript
// ✅ 75% redução de código
export function SupplierEditDialog({ supplier, onSave }) {
  const formManager = useFormManager({
    schema: supplierSchema,
    defaultValues: supplier || defaultSupplierValues,
    onSubmit: onSave,
    successMessage: "Fornecedor salvo com sucesso"
  });
  
  const fields: FieldConfig[] = [
    { name: 'name', label: 'Nome', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email' },
    { name: 'phone', label: 'Telefone', type: 'text' },
    { name: 'active', label: 'Ativo', type: 'switch' }
  ];
  
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Fornecedor</DialogTitle>
        </DialogHeader>
        <DynamicForm
          formManager={formManager}
          fields={fields}
          submitLabel="Salvar Fornecedor"
        />
      </DialogContent>
    </Dialog>
  );
}
```

---

## 🎯 Padrão 5: Componentes de Loading Duplicados

### ❌ Problema Identificado

**Loading States Repetitivos em:**
- Múltiplos managers têm loading states similares
- Cards de loading duplicados
- Skeleton components repetitivos

### ✅ Solução: Componente `UnifiedLoadingState`

```typescript
interface LoadingStateProps {
  type: 'card' | 'table' | 'list' | 'form' | 'full-page';
  count?: number;
  message?: string;
}

export function UnifiedLoadingState({ type, count = 3, message }: LoadingStateProps) {
  switch (type) {
    case 'card':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      );
    case 'table':
      return <TableSkeleton rows={count} />;
    case 'list':
      return <ListSkeleton items={count} />;
    // ... outros tipos
  }
}
```

---

## 🎯 Padrão 6: Validação de Dados Duplicada

### ❌ Problema Identificado

**Validações similares espalhadas em:**
- `server/services/authService.ts` - Validação de email
- `server/services/creditService.ts` - Validação de números
- Múltiplos formulários - Validações similares

### ✅ Solução: Utilitários de Validação Centralizados

**Novo Arquivo:** `shared/utils/validators.ts`
```typescript
export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  static isValidCNPJ(cnpj: string): boolean {
    // Lógica centralizada de validação CNPJ
  }
  
  static isPositiveNumber(value: any): boolean {
    return typeof value === 'number' && value > 0;
  }
  
  // Validadores Zod reutilizáveis
  static emailSchema = z.string().email().max(254);
  static cnpjSchema = z.string().refine(ValidationUtils.isValidCNPJ, "CNPJ inválido");
  static positiveNumberSchema = z.number().positive("Deve ser um número positivo");
}
```

---

## 📝 Plano de Implementação Sugerido

### 🎯 Fase 1: Hooks e Utilitários Base (1-2 dias)
1. **Criar hooks fundamentais:**
   - `useEntityCRUD` - Para managers CRUD
   - `useFormManager` - Para formulários
   - `useCreditManager` - Sistema de créditos unificado

2. **Criar utilitários centralizados:**
   - `ValidationUtils` - Validações reutilizáveis
   - `UnifiedLoadingState` - Loading states padronizados
   - `DynamicForm` - Formulários dinâmicos

### 🎯 Fase 2: Refatoração de Managers (2-3 dias)
1. **Migrar managers financas360:**
   - ContasBancariasManager (666 → ~150 linhas)
   - EmpresasManager (400 → ~120 linhas)
   - CanaisManager (500 → ~140 linhas)
   - BancosManager (450 → ~130 linhas)

### 🎯 Fase 3: Serviços e APIs (1-2 dias)
1. **Refatorar AIProviderService:**
   - Eliminar métodos duplicados
   - Implementar pattern method dinâmico

2. **Consolidar serviços de autenticação:**
   - Centralizar validações
   - Unificar error handling

### 🎯 Fase 4: Formulários (2-3 dias)
1. **Migrar formulários para DynamicForm:**
   - SupplierEditDialog
   - ProductSupplierForm
   - Formulários de managers

### 🎯 Fase 5: Testes e Otimização (1 dia)
1. **Validar funcionamento**
2. **Medir redução de código**
3. **Performance testing**

---

## 📊 Benefícios Esperados

### Redução de Código
- **CRUD Managers**: 2.500+ linhas → ~800 linhas (68% redução)
- **Formulários**: 1.500+ linhas → ~500 linhas (67% redução)  
- **Hooks**: 800+ linhas → ~300 linhas (62% redução)
- **Serviços**: 600+ linhas → ~250 linhas (58% redução)

### Melhoria na Manutenibilidade
- **DRY Compliance**: Eliminação de duplicação
- **Single Source of Truth**: Mudanças centralizadas
- **Type Safety**: TypeScript em todos os utilitários
- **Consistent Patterns**: Padrões uniformes

### Performance
- **Bundle Size**: Redução estimada de 15-20%
- **Memory Usage**: Menos componentes duplicados em memória
- **Development Speed**: Componentes reutilizáveis aceleram desenvolvimento

---

## 🎯 Próximos Passos Recomendados

1. **Aprovar plano de refatoração**
2. **Criar branch específica para refatoração**
3. **Implementar fase por fase com testes**
4. **Manter backward compatibility durante migração**
5. **Documentar novos padrões para equipe**

---

**Conclusão**: A implementação dessas refatorações resultará em um codebase mais limpo, maintível e performático, seguindo rigorosamente o princípio DRY e estabelecendo padrões consistentes para desenvolvimento futuro.