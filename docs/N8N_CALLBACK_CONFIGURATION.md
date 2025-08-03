# Configuração N8N - Callback para Amazon Negative Reviews

## 🎯 Problema Identificado

O webhook n8n está funcionando perfeitamente e gerando respostas, mas **não está configurado para fazer callback** para a aplicação após processar a solicitação.

## 🔍 Diagnóstico Completo

### ✅ O que está funcionando:
1. **Aplicação → n8n**: Webhook está sendo enviado com sucesso
2. **N8n processamento**: IA está gerando respostas corretamente
3. **Callback endpoint**: `/api/agents/amazon-negative-reviews/webhook-callback` está funcionando

### ❌ O que está faltando:
- **N8n → Aplicação**: N8n não está fazendo callback após processar

## 🛠️ Solução: Configurar Callback no N8N

O workflow n8n precisa incluir um passo adicional para fazer callback:

### URL do Callback:
```
https://seu-dominio.replit.app/api/agents/amazon-negative-reviews/webhook-callback
```

### Método: POST

### Headers:
```json
{
  "Content-Type": "application/json"
}
```

### Body do Callback:
```json
[{
  "retorno": "{{ $node['IA_Response'].json.response }}",
  "sessionId": "{{ $node['Webhook'].json.body.sessionId }}",
  "userId": "{{ $node['Webhook'].json.body.userId }}",
  "timestamp": "{{ new Date().toISOString() }}"
}]
```

## 🔗 Estrutura do Workflow N8N

```
1. Webhook Trigger (recebe dados da aplicação)
   ↓
2. IA Processing Node (processa com ChatGPT/Claude)
   ↓
3. HTTP Request Node (faz callback para aplicação)
   ↓
4. Response Node (responde ao webhook inicial)
```

## 📊 Teste de Conectividade

### Teste Realizado:
- **Endpoint n8n**: ✅ Acessível e funcionando
- **Resposta gerada**: ✅ Formato correto com todos os campos
- **Callback local**: ✅ Endpoint de callback funciona perfeitamente

### Exemplo de Resposta N8N:
```json
{
  "retorno": "Olá Cliente Teste,\n\nAgradeço pelo seu feedback...",
  "userId": "2",
  "sessionId": "test-session-123", 
  "timestamp": "2025-08-03T05:02:20.000Z"
}
```

## 🎯 Próximos Passos

1. **Acesse o workflow n8n** em `https://webhook.guivasques.app`
2. **Adicione node HTTP Request** após o processamento da IA
3. **Configure URL callback** para sua aplicação Replit
4. **Teste o fluxo completo**

## 🧪 Teste Manual

Para verificar se a configuração está funcionando:

```bash
# Fazer requisição via aplicação
curl -X POST -H "Authorization: Bearer <seu-token>" \
  -H "Content-Type: application/json" \
  -d '{"negativeReview": "Produto com defeito", "customerName": "João"}' \
  https://seu-dominio.replit.app/api/agents/amazon-negative-reviews/generate

# Verificar se callback foi recebido nos logs da aplicação
```

## 📋 Checklist de Configuração

- [ ] Workflow n8n acessível
- [ ] Node de callback adicionado
- [ ] URL do callback configurada
- [ ] Headers corretos configurados  
- [ ] Body com formato array configurado
- [ ] Teste end-to-end realizado
- [ ] Logs de callback aparecem na aplicação

## 🔧 Configuração Detalhada

### Node HTTP Request no N8N:
- **Method**: POST
- **URL**: `https://seu-dominio.replit.app/api/agents/amazon-negative-reviews/webhook-callback`
- **Headers**: `Content-Type: application/json`
- **Body**: 
```json
[{
  "retorno": "{{ $json.response }}",
  "sessionId": "{{ $('Webhook').item.json.body.sessionId }}",
  "userId": "{{ $('Webhook').item.json.body.userId }}"
}]
```

Com essa configuração, o sistema funcionará completamente end-to-end.