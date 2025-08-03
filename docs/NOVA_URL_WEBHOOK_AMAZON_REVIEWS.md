# Atualização URL Webhook - Amazon Negative Reviews

## 🔄 Nova URL Configurada

A URL do webhook foi atualizada no sistema:

**URL Anterior:** `https://webhook.guivasques.app/webhook/amazon-negative-feedback`
**URL Nova:** `https://webhook.guivasques.app/webhook/amazon-negative-reviews`

## ✅ Alterações Realizadas

### 1. Código Atualizado:
- ✅ Endpoint de geração atualizado
- ✅ Endpoint de teste atualizado  
- ✅ Database webhookUrl atualizado
- ✅ Documentação atualizada

### 2. Arquivos Modificados:
- `server/routes.ts` - URLs atualizadas
- `docs/WEBHOOK_AMAZON_NEGATIVE_REVIEWS_SETUP.md` - Documentação atualizada
- `docs/N8N_CALLBACK_CONFIGURATION.md` - Instruções atualizadas

## 🧪 Teste da Nova URL

**Status Atual:** ❌ URL ainda não configurada no n8n
```
HTTP/2 404 - This webhook is not registered for POST requests
```

## 🛠️ Próximos Passos

### 1. Configurar Webhook N8N:
- Acesse o n8n em `https://webhook.guivasques.app`
- Configure o webhook para a nova URL: `/webhook/amazon-negative-reviews`
- Certifique-se que aceita requisições POST

### 2. Configurar Callback:
O workflow n8n deve incluir um node HTTP Request para fazer callback:

**URL do Callback:**
```
https://seu-dominio.replit.app/api/agents/amazon-negative-reviews/webhook-callback
```

**Payload do Callback:**
```json
[{
  "retorno": "{{ $json.retorno }}",
  "sessionId": "{{ $('Webhook').item.json.body.sessionId }}",
  "userId": "{{ $('Webhook').item.json.body.userId }}"
}]
```

## 🧪 Comando de Teste

Após configurar o n8n, teste com:

```bash
curl -X POST "https://webhook.guivasques.app/webhook/amazon-negative-reviews" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "test-123",
    "userId": "2",
    "avaliacaoNegativa": "Produto chegou com defeito",
    "nomeCliente": "João"
  }'
```

**Resposta Esperada:**
```json
{
  "retorno": "Prezado João, agradeço pelo feedback...",
  "sessionId": "test-123", 
  "userId": "2"
}
```

## 📋 Checklist

- ✅ Código atualizado com nova URL
- ✅ Documentação atualizada
- ❌ Webhook n8n configurado na nova URL
- ❌ Callback configurado no workflow n8n
- ❌ Teste end-to-end funcionando

## 🎯 Resultado Final

Quando tudo estiver configurado, o fluxo será:
1. **Frontend** → Sistema cria sessão
2. **Sistema** → Envia para nova URL n8n
3. **N8n** → Processa e gera resposta
4. **N8n** → Faz callback para sistema
5. **Sistema** → Atualiza sessão como completa
6. **Frontend** → Recebe resultado final

Assim que o n8n estiver configurado na nova URL, o sistema funcionará completamente.