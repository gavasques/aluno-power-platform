# 🔧 Troubleshooting - Callback n8n Amazon Negative Reviews

## ⚠️ Problema Comum: Resposta não aparece após processamento

### Sintomas:
- Sistema redireciona para página de resultado ✅
- Página fica travada em "Processando..." ❌
- Nenhum erro aparece nos logs ❌

### Causa:
O n8n **não está enviando o callback** de volta após processar a resposta da IA.

## 🛠️ Como Verificar se o Callback está Funcionando

### 1. Teste Manual do Callback
```bash
curl -X POST https://seu-dominio.com/api/agents/amazon-negative-reviews/webhook-callback \
  -H "Content-Type: application/json" \
  -d '[{
    "retorno": "Teste de resposta",
    "sessionId": "nr-xxx-xxx",
    "userId": "2"
  }]'
```

Se retornar `{"success":true,"status":"completed"}`, o sistema está OK.

### 2. Verificar Logs do n8n
No workflow do n8n, adicione um nó de "Console" antes do HTTP Request para ver os dados.

## ✅ Configuração Correta do Callback no n8n

### HTTP Request Node - Configuração
```
Method: POST
URL: https://458f27c9-f0ef-45e1-a369-5a5222f6fa0a-00-1ikswi66hbb6h.riker.replit.dev/api/agents/amazon-negative-reviews/webhook-callback
Authentication: None
Body Content Type: JSON
```

### Body Format (IMPORTANTE!)
O corpo DEVE ser um array JSON:
```json
[
  {
    "retorno": "{{ $json.resposta }}",
    "sessionId": "{{ $json.sessionId }}",
    "userId": "{{ $json.userId }}"
  }
]
```

### Headers
```
Content-Type: application/json
```

## 🚨 Erros Comuns

### 1. Formato Incorreto do Body
❌ **Errado** (objeto direto):
```json
{
  "retorno": "...",
  "sessionId": "...",
  "userId": "..."
}
```

✅ **Correto** (array):
```json
[
  {
    "retorno": "...",
    "sessionId": "...",
    "userId": "..."
  }
]
```

### 2. URL Incorreta
❌ `/api/agents/amazon-negative-reviews/callback`
✅ `/api/agents/amazon-negative-reviews/webhook-callback`

### 3. Campos Faltando
Todos os 3 campos são obrigatórios:
- `retorno` - A resposta gerada pela IA
- `sessionId` - O ID da sessão (formato: `nr-xxx-xxx`)
- `userId` - O ID do usuário (string)

## 📊 Monitoramento

### Logs para Verificar:
1. **No servidor da aplicação:**
   - `📥 [NEGATIVE_REVIEWS] Callback recebido`
   - `🎉 [NEGATIVE_REVIEWS] Processamento concluído com sucesso`

2. **No n8n:**
   - Verifique se o HTTP Request retorna status 200
   - Response deve ser: `{"success":true,"status":"completed"}`

## 🔄 Fluxo Completo Esperado

1. User envia avaliação → Status: `processing`
2. Sistema envia para n8n webhook ✅
3. N8n processa com IA ✅
4. **N8n envia callback** ← PONTO CRÍTICO
5. Sistema atualiza status → `completed`
6. Frontend mostra resultado ✅

## 💡 Dica de Debug

Se o callback não estiver funcionando, teste cada parte isoladamente:

1. **Teste o endpoint de callback** (curl manual)
2. **Verifique logs do n8n** (o request está sendo feito?)
3. **Verifique formato do JSON** (é um array?)
4. **Confirme a URL** (está correta e acessível?)

---

**Última atualização:** 03/08/2025
**Status:** Sistema 100% funcional quando callback configurado corretamente