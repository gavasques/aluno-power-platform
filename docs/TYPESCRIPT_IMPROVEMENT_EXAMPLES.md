# Exemplos Práticos de Melhorias de Tipos TypeScript

## 1. Substituindo `any` por Tipos Específicos

### Antes (Problema)
```typescript
// client/src/services/productService.ts
async updateChannels(id: number, channels: any[]): Promise<DbProduct> {
  return apiRequest<DbProduct>(`/api/products/${id}/channels`, {
    method: "PUT",
    body: JSON.stringify({ channels }),
  });
}

async updateCosts(id: number, costs: any): Promise<DbProduct> {
  return apiRequest<DbProduct>(`/api/products/${id}/costs`, {
    method: "PUT",
    body: JSON.stringify(costs),
  });
}
```

### Depois (Solução)
```typescript
// client/src/services/productService.ts
import { SalesChannel, ChannelUpdateData, CostUpdateData } from '@/types/core';

async updateChannels(id: number, channels: SalesChannel[]): Promise<DbProduct> {
  const updateData: ChannelUpdateData = { channels };
  return apiRequest<DbProduct>(`/api/products/${id}/channels`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
}

async updateCosts(id: number, costs: CostUpdateData): Promise<DbProduct> {
  return apiRequest<DbProduct>(`/api/products/${id}/costs`, {
    method: "PUT",
    body: JSON.stringify(costs),
  });
}
```

## 2. Adicionando Interfaces para Props de Componentes

### Antes (Problema)
```typescript
// client/src/pages/myarea/ProductPreview.tsx
export default function ProductPreview() {
  const [, setLocation] = useLocation();
  const params = useParams();
  const productId = params.id;
  // ...
}
```

### Depois (Solução)
```typescript
// client/src/pages/myarea/ProductPreview.tsx
import { ProductPageProps } from '@/types/core';

interface ProductPreviewProps extends ProductPageProps {
  showActions?: boolean;
  onEdit?: (productId: string) => void;
  onDelete?: (productId: string) => void;
}

export default function ProductPreview({ 
  productId, 
  showActions = true, 
  onEdit, 
  onDelete 
}: ProductPreviewProps) {
  const [, setLocation] = useLocation();
  
  const handleEdit = () => {
    if (onEdit && productId) {
      onEdit(productId);
    } else {
      setLocation(`/minha-area/produtos/${productId}/editar`);
    }
  };

  const handleDelete = () => {
    if (onDelete && productId) {
      onDelete(productId);
    }
  };

  // ...
}
```

## 3. Tipos Específicos para Event Handlers

### Antes (Problema)
```typescript
// client/src/pages/myarea/MyMaterials.tsx
<Select 
  value={filters.accessLevel} 
  onValueChange={(value: any) => setFilters({ accessLevel: value })}
>
```

### Depois (Solução)
```typescript
// client/src/pages/myarea/MyMaterials.tsx
import { SelectValueChangeHandler } from '@/types/core';

interface MaterialFilters {
  accessLevel: 'public' | 'private' | 'shared';
  category?: string;
  search?: string;
}

const handleAccessLevelChange: SelectValueChangeHandler = (value) => {
  setFilters(prev => ({ ...prev, accessLevel: value as MaterialFilters['accessLevel'] }));
};

<Select 
  value={filters.accessLevel} 
  onValueChange={handleAccessLevelChange}
>
```

## 4. Tratamento de Erros Tipado

### Antes (Problema)
```typescript
// client/src/pages/LoginNew.tsx
} catch (error: any) {
  console.error('Login error:', error);
  setError(error.message || 'Erro desconhecido');
}
```

### Depois (Solução)
```typescript
// client/src/pages/LoginNew.tsx
import { ApiError, AuthError, ErrorHandler } from '@/types/core';

const handleLoginError: ErrorHandler = (error: ApiError) => {
  console.error('Login error:', error);
  
  if (isAuthError(error)) {
    setError(getAuthErrorMessage(error));
  } else {
    setError(error.message || 'Erro desconhecido');
  }
};

const isAuthError = (error: ApiError): error is AuthError => {
  return error.code === 'INVALID_CREDENTIALS' || 
         error.code === 'TOKEN_EXPIRED' || 
         error.code === 'INSUFFICIENT_PERMISSIONS';
};

const getAuthErrorMessage = (error: AuthError): string => {
  switch (error.code) {
    case 'INVALID_CREDENTIALS':
      return 'Email ou senha incorretos';
    case 'TOKEN_EXPIRED':
      return 'Sessão expirada. Faça login novamente.';
    case 'INSUFFICIENT_PERMISSIONS':
      return 'Você não tem permissão para acessar este recurso.';
    default:
      return 'Erro de autenticação';
  }
};

try {
  // login logic
} catch (error) {
  handleLoginError(error as ApiError);
}
```

## 5. Tipos Específicos para Cálculos

### Antes (Problema)
```typescript
// client/src/pages/myarea/MyProductsListRefactored.tsx
const getChannelCalculations = (product: any): { channel: any; calculation: ChannelCalculationResult }[] => {
  const activeChannels = product.channels?.filter((ch: any) => ch.isActive) || [];
  return activeChannels.map((channel: any) => ({
    channel,
    calculation: calculateChannel(channel, product)
  }));
};
```

### Depois (Solução)
```typescript
// client/src/pages/myarea/MyProductsListRefactored.tsx
import { 
  Product, 
  SalesChannel, 
  ChannelCalculation, 
  ChannelCalculationFunction,
  ProductCalculationFunction 
} from '@/types/core';

const calculateChannel: ChannelCalculationFunction = (
  channel: SalesChannel, 
  product: Product
): ChannelCalculationResult => {
  // cálculo específico
};

const getChannelCalculations = (product: Product): ChannelCalculation[] => {
  const activeChannels = product.channels?.filter((ch: SalesChannel) => ch.isActive) || [];
  
  return activeChannels.map((channel: SalesChannel): ChannelCalculation => ({
    channel,
    calculation: calculateChannel(channel, product)
  }));
};

const calculateProductMetrics: ProductCalculationFunction = (
  product: Product, 
  channels: SalesChannel[]
): ProductCalculations => {
  const channelCalculations = getChannelCalculations(product);
  
  return {
    product,
    channels: channelCalculations,
    totalRevenue: channelCalculations.reduce((sum, calc) => sum + calc.calculation.grossRevenue, 0),
    totalCosts: channelCalculations.reduce((sum, calc) => sum + calc.calculation.totalCosts, 0),
    totalProfit: channelCalculations.reduce((sum, calc) => sum + calc.calculation.netProfit, 0),
    averageMargin: channelCalculations.length > 0 
      ? channelCalculations.reduce((sum, calc) => sum + calc.calculation.marginPercent, 0) / channelCalculations.length 
      : 0,
    bestChannel: channelCalculations.reduce((best, current) => 
      current.calculation.marginPercent > best.calculation.marginPercent ? current : best
    ),
    worstChannel: channelCalculations.reduce((worst, current) => 
      current.calculation.marginPercent < worst.calculation.marginPercent ? current : worst
    )
  };
};
```

## 6. Componentes com Props Tipadas

### Antes (Problema)
```typescript
// client/src/components/product/ProductCard.tsx
export default function ProductCard({ product, onEdit, onDelete }) {
  // sem tipos definidos
}
```

### Depois (Solução)
```typescript
// client/src/components/product/ProductCard.tsx
import { Product, ListItemProps } from '@/types/core';

interface ProductCardProps extends ListItemProps<Product> {
  showActions?: boolean;
  showMetrics?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export default function ProductCard({ 
  item: product, 
  onEdit, 
  onDelete, 
  showActions = true, 
  showMetrics = false,
  variant = 'default',
  className 
}: ProductCardProps) {
  const handleEdit = () => {
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(product);
    }
  };

  return (
    <div className={`product-card ${variant} ${className || ''}`}>
      <h3>{product.name}</h3>
      {showMetrics && (
        <div className="metrics">
          <span>Custo: {formatCurrency(product.costItem)}</span>
          <span>Margem: {product.marginPercent}%</span>
        </div>
      )}
      {showActions && (
        <div className="actions">
          <button onClick={handleEdit}>Editar</button>
          <button onClick={handleDelete}>Excluir</button>
        </div>
      )}
    </div>
  );
}
```

## 7. Hooks com Tipos Específicos

### Antes (Problema)
```typescript
// client/src/hooks/useProductCalculations.ts
export const useProductCalculations = (productId: any) => {
  const [calculations, setCalculations] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const calculate = async (channels: any[]) => {
    // cálculo
  };

  return { calculations, loading, error, calculate };
};
```

### Depois (Solução)
```typescript
// client/src/hooks/useProductCalculations.ts
import { 
  Product, 
  SalesChannel, 
  ProductCalculations, 
  CalculationConfig,
  AsyncCalculationRequest,
  AsyncCalculationResponse 
} from '@/types/core';

interface UseProductCalculationsProps {
  productId: string;
  config?: Partial<CalculationConfig>;
}

interface UseProductCalculationsReturn {
  calculations: ProductCalculations | null;
  loading: boolean;
  error: string | null;
  calculate: (channels: SalesChannel[]) => Promise<ProductCalculations>;
  reset: () => void;
}

export const useProductCalculations = ({ 
  productId, 
  config = {} 
}: UseProductCalculationsProps): UseProductCalculationsReturn => {
  const [calculations, setCalculations] = useState<ProductCalculations | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async (channels: SalesChannel[]): Promise<ProductCalculations> => {
    setLoading(true);
    setError(null);

    try {
      const request: AsyncCalculationRequest = {
        id: crypto.randomUUID(),
        productId,
        channels,
        config: {
          includeTaxes: true,
          includeShipping: true,
          includeMarketing: true,
          includeOperational: true,
          currency: 'BRL',
          decimalPlaces: 2,
          ...config
        },
        priority: 'normal'
      };

      const response = await fetch('/api/calculations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error('Falha ao calcular métricas');
      }

      const result: AsyncCalculationResponse = await response.json();
      
      if (result.status === 'completed' && result.result) {
        setCalculations(result.result);
        return result.result;
      } else {
        throw new Error(result.error || 'Erro no cálculo');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setCalculations(null);
    setError(null);
  };

  return { calculations, loading, error, calculate, reset };
};
```

## 8. Validação de Formulários com Tipos

### Antes (Problema)
```typescript
// client/src/components/forms/ProductForm.tsx
const validateForm = (data: any) => {
  const errors: any = {};
  
  if (!data.name) errors.name = 'Nome é obrigatório';
  if (!data.costItem) errors.costItem = 'Custo é obrigatório';
  
  return errors;
};
```

### Depois (Solução)
```typescript
// client/src/components/forms/ProductForm.tsx
import { z } from 'zod';
import { ProductFormData, FormErrors, ValidationError } from '@/types/core';

const productSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  costItem: z.number().min(0, 'Custo deve ser maior que zero'),
  taxPercent: z.number().min(0).max(100, 'Imposto deve estar entre 0 e 100%'),
  brandName: z.string().optional(),
  observations: z.string().optional(),
  dimensions: z.object({
    length: z.number().min(0),
    width: z.number().min(0),
    height: z.number().min(0)
  }).optional(),
  weight: z.number().min(0).optional()
});

type ProductFormSchema = z.infer<typeof productSchema>;

const validateForm = (data: ProductFormData): FormErrors => {
  try {
    productSchema.parse(data);
    return {};
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: FormErrors = {};
      
      error.errors.forEach((err: ValidationError) => {
        const field = err.field;
        if (!errors[field]) {
          errors[field] = [];
        }
        errors[field].push({
          field,
          message: err.message,
          value: err.value
        });
      });
      
      return errors;
    }
    
    return {
      general: [{
        field: 'general',
        message: 'Erro de validação',
        value: data
      }]
    };
  }
};

const hasErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

const getFieldError = (errors: FormErrors, field: string): string | undefined => {
  return errors[field]?.[0]?.message;
};
```

## 9. Configuração de ESLint para Forçar Tipos

### .eslintrc.json
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-var-requires": "error",
    "@typescript-eslint/ban-ts-comment": "warn",
    "@typescript-eslint/no-non-null-assertion": "warn"
  }
}
```

## 10. Benefícios Alcançados

### 10.1 Segurança de Tipos
- ✅ Eliminação de erros em runtime
- ✅ Detecção precoce de problemas
- ✅ Melhor IntelliSense

### 10.2 Manutenibilidade
- ✅ Código auto-documentado
- ✅ Refatorações mais seguras
- ✅ Melhor onboarding

### 10.3 Performance
- ✅ Melhor tree-shaking
- ✅ Otimizações de compilação
- ✅ Redução de bundle size

## Conclusão

Estes exemplos demonstram como aplicar as melhorias de tipos de forma prática e incremental. A migração pode ser feita gradualmente, começando pelos componentes mais críticos e expandindo para o resto da aplicação. 