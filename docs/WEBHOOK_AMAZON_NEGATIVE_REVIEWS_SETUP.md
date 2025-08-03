# Amazon Negative Reviews Webhook - Configuração Completa

## 📋 Visão Geral

Sistema completamente refatorado para processar respostas de avaliações negativas da Amazon via webhook n8n.

## 🔗 Endpoints da API

### 1. Iniciar Processamento
```
POST /api/agents/amazon-negative-reviews/generate
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "negativeReview": "Texto da avaliação negativa (obrigatório)",
  "userInfo": "Informações adicionais (opcional)",
  "sellerName": "Nome do vendedor (opcional)",
  "sellerPosition": "Cargo do vendedor (opcional)", 
  "customerName": "Nome do cliente (opcional)",
  "orderId": "ID do pedido (opcional)"
}
```

**Response:**
```json
{
  "sessionId": "nr-1754185123456-abc123def",
  "status": "processing",
  "message": "Processamento iniciado com sucesso"
}
```

### 2. Webhook Callback
```
POST /api/agents/amazon-negative-reviews/webhook-callback
```

**Formatos Suportados:**

#### Formato Array (n8n padrão):
```json
[
  {
    "retorno": "Prezado João Silva,\n\nAgradecemos seu contato...",
    "userId": "2",
    "sessionId": "nr-1754185123456-abc123def",
    "timestamp": "2025-08-03T01:30:10.310Z"
  }
]
```

#### Formato Objeto Direto:
```json
{
  "retorno": "Prezado João Silva,\n\nAgradecemos seu contato...",
  "userId": "2", 
  "sessionId": "nr-1754185123456-abc123def",
  "timestamp": "2025-08-03T01:30:10.310Z"
}
```

### 3. Consultar Status
```
GET /api/agents/amazon-negative-reviews/sessions/{sessionId}
```

**Response:**
```json
{
  "id": "nr-1754185123456-abc123def",
  "status": "completed",
  "input_data": {
    "negativeReview": "Produto chegou quebrado...",
    "userInfo": "Cliente primeira compra",
    "sellerName": "Carlos Silva",
    "sellerPosition": "Gerente",
    "customerName": "João Santos",
    "orderId": "123-456-789"
  },
  "result_data": {
    "response": "Prezado João Santos,\n\nAgradecemos...",
    "analysis": {
      "sentiment": "Negativo - Processado",
      "urgency": "Resolvido via IA", 
      "keyIssues": ["Análise automática concluída"]
    }
  },
  "created_at": "2025-08-03T01:30:10.310Z",
  "completed_at": "2025-08-03T01:30:45.123Z"
}
```

## ⚙️ Configuração do n8n

### URL do Webhook:
```
https://webhook.guivasques.app/webhook/amazon-negative-feedback
```

### Payload para n8n:
O sistema envia automaticamente os seguintes dados para o webhook:
```json
{
  "sessionId": "nr-1754185123456-abc123def",
  "userId": "2",
  "avaliacaoNegativa": "Produto chegou quebrado...",
  "informacoesAdicionais": "Cliente primeira compra",
  "nomeVendedor": "Carlos Silva",
  "cargoVendedor": "Gerente",
  "nomeCliente": "João Santos", 
  "idPedido": "123-456-789",
  "timestamp": "2025-08-03T01:30:10.310Z"
}
```

### Resposta Esperada do n8n:
- **Campo obrigatório:** `retorno` - texto da resposta gerada
- **Campo obrigatório:** `sessionId` - mesmo ID enviado
- **Campo obrigatório:** `userId` - mesmo user ID enviado
- **Campo opcional:** `timestamp` - data/hora da geração

## 🔄 Fluxo Completo

1. **Frontend envia dados** → `/api/agents/amazon-negative-reviews/generate`
2. **Sistema cria sessão** com status "processing"
3. **Sistema envia payload** → webhook n8n
4. **n8n processa com IA** e gera resposta
5. **n8n retorna callback** → `/api/agents/amazon-negative-reviews/webhook-callback`
6. **Sistema atualiza sessão** com resultado
7. **Sistema deduz créditos** automaticamente
8. **Frontend polling** → `/api/agents/amazon-negative-reviews/sessions/{sessionId}`

## 🛡️ Validações

### No Generate:
- ✅ Usuário autenticado
- ✅ `negativeReview` obrigatório e não vazio
- ✅ Outros campos opcionais

### No Callback:
- ✅ `sessionId` presente no payload
- ✅ `retorno` presente no payload  
- ✅ Sessão existe e está ativa
- ✅ Formato suportado (array ou objeto)

### No Status:
- ✅ Usuário autenticado
- ✅ Sessão pertence ao usuário
- ✅ SessionId válido

## 📊 Sistema de Créditos

- **Dedução automática** quando callback é processado
- **Log completo** de usage salvo no banco
- **Feature code:** `agents.negative_reviews`
- **Custo estimado:** definido pelo sistema de créditos

## 🔍 Logs e Debug

### Logs do Generate:
```
🚀 [NEGATIVE_REVIEWS] Iniciando geração: {sessionId, userId, hasReview, customerName}
✅ [NEGATIVE_REVIEWS] Webhook enviado com sucesso
❌ [NEGATIVE_REVIEWS] Erro no webhook: {error}
```

### Logs do Callback:
```
📥 [NEGATIVE_REVIEWS] Callback recebido - Body: {dados completos}
✅ [NEGATIVE_REVIEWS] Dados extraídos do array: {sessionId, userId, hasContent}
✅ [NEGATIVE_REVIEWS] Log de usage salvo e créditos deduzidos
🎉 [NEGATIVE_REVIEWS] Processamento concluído com sucesso: {sessionId}
```

### Logs do Status:
```
📊 [NEGATIVE_REVIEWS] Status da sessão consultado: {sessionId, status, hasResult}
```

## 🚨 Tratamento de Erros

### Erros Comuns:
- **400:** Dados obrigatórios ausentes
- **401:** Usuário não autenticado  
- **403:** Acesso negado (sessão de outro usuário)
- **404:** Sessão não encontrada
- **500:** Erro interno do servidor/webhook

### Recovery:
- Sistema mantém sessões em memória
- Logs detalhados para debugging
- Validação robusta de formatos
- Timeouts configurados para webhook

## ✅ Status do Sistema

**Sistema totalmente refatorado e funcional:**
- ✅ Endpoints limpos e organizados
- ✅ Validações robustas implementadas
- ✅ Suporte a múltiplos formatos n8n
- ✅ Sistema de créditos integrado
- ✅ Logs detalhados para debug
- ✅ Frontend atualizado
- ✅ Tratamento de erros completo