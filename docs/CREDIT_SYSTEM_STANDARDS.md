# Padrão do Sistema de Créditos

## ✅ Padrão Correto (OBRIGATÓRIO)

### Hook Unificado: `useCreditSystem`

Todos os agentes devem usar o hook unificado `useCreditSystem` para:

1. **Verificação de créditos**: `checkCredits(featureCode)`
2. **Log de IA**: `logAIGeneration(params)`
3. **Mensagens padronizadas**: `showInsufficientCreditsToast()` e `showCreditCheckErrorToast()`

### Exemplo de Implementação:

```typescript
import { useCreditSystem } from '@/hooks/useCreditSystem';

const { logAIGeneration, checkCredits } = useCreditSystem();

// 1. Verificar créditos antes do processamento
const creditCheck = await checkCredits(FEATURE_CODE);
if (!creditCheck.canProcess) {
  showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
  return;
}

// 2. Processar IA
const response = await fetch('/api/ai-providers/test', {
  // ... configuração
});

// 3. Log automático com dedução de créditos
await logAIGeneration({
  featureCode: FEATURE_CODE,
  provider: config.provider,
  model: config.model,
  prompt: prompt,
  response: responseText,
  // ... outros parâmetros
});
```

## ❌ Padrões Incorretos (NÃO USAR)

### 1. Chamada manual para `/api/credits/deduct`
```typescript
// ❌ NÃO FAZER ISSO:
await fetch('/api/credits/deduct', {
  method: 'POST',
  body: JSON.stringify({ amount: 10, reason: 'xyz' })
});
```

### 2. Log manual para `/api/ai-generation-logs`
```typescript
// ❌ NÃO FAZER ISSO:
await fetch('/api/ai-generation-logs', {
  method: 'POST',
  body: JSON.stringify({ creditsUsed: 5, feature: 'xyz' })
});
```

### 3. Verificação manual de créditos
```typescript
// ❌ NÃO FAZER ISSO:
const dashboardResponse = await fetch('/api/dashboard/summary');
if (dashboardResponse.user.creditBalance < 10) {
  // verificação manual
}
```

## 🔧 Backend: LoggingService

O backend já tem LoggingService configurado para dedução automática quando `creditsUsed = 0`:

```typescript
await LoggingService.saveAiLog(
  userId,
  featureCode,    // Feature correto para dedução
  prompt,
  response,
  provider,
  model,
  inputTokens,
  outputTokens,
  totalTokens,
  cost,
  0,              // creditsUsed = 0 para dedução automática
  duration
);
```

## 📝 Agentes para Refatorar

### Alto Prioridade (Padrão Incorreto):
1. `HtmlDescriptionAgent.tsx` - usa `/api/credits/deduct` manual
2. `amazon-listings-optimizer-new.tsx` - usa `/api/credits/deduct` manual
3. `amazon-listings-optimizer-new-broken.tsx` - arquivo duplicado para remover

### Médio Prioridade (Verificar):
1. `amazon-product-photography.tsx` - verificar padrão usado
2. `lifestyle-with-model.tsx` - verificar padrão usado
3. `infographic-generator.tsx` - verificar padrão usado

## 🎯 Objetivos

1. **Unificação**: Todos os agentes usam `useCreditSystem`
2. **Redução de código**: Eliminar duplicações de lógica de créditos
3. **Consistência**: Mesmo comportamento em todos os agentes
4. **Manutenibilidade**: Mudanças futuras em um local só
5. **Prevenção de bugs**: Sistema centralizado evita erros

## 🚨 Pontos Críticos

1. **Feature Code**: Sempre usar o código correto (ex: `agents.bullet_points`)
2. **LoggingService**: Sempre usar `creditsUsed = 0` para dedução automática
3. **Endpoint único**: `/api/ai-generation-logs` é o único endpoint necessário
4. **Verificação prévia**: Sempre verificar créditos antes de processar
5. **Error handling**: Usar mensagens padronizadas do hook