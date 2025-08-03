# Configuração do Webhook Amazon Negative Reviews no n8n

## Problema Identificado
O webhook não está retornando automaticamente a resposta para o sistema após processar. Isso faz com que a página fique eternamente em "Processando...".

## URLs Corretas do Sistema

### URL do Webhook (onde o n8n recebe os dados)
```
https://webhook.guivasques.app/webhook/amazon-negative-feedback
```

### URL de Callback (onde o n8n deve enviar a resposta)
```
https://aluno-power.replit.app/api/agents/amazon-negative-reviews/webhook-callback
```

## Estrutura do Webhook no n8n

### 1. Webhook Trigger
- URL: `https://webhook.guivasques.app/webhook/amazon-negative-feedback`
- Método: POST
- Recebe os dados do formulário

### 2. Processamento (ChatGPT ou outro)
- Processa os dados recebidos
- Gera a resposta personalizada

### 3. HTTP Request (IMPORTANTE - Este passo está faltando!)
Após gerar a resposta, o n8n precisa fazer um POST para o callback:

**URL:** `https://aluno-power.replit.app/api/agents/amazon-negative-reviews/webhook-callback?sessionId={{ $json.sessionId }}&userId={{ $json.userId }}`

**Método:** POST

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body (JSON - Formato Array):**
```json
[
  {
    "retorno": "{{ resposta gerada pelo ChatGPT }}"
  }
]
```

**IMPORTANTE:** O sessionId e userId devem ser enviados como query parameters na URL, não no body!

## Dados Recebidos pelo Webhook

O webhook recebe os seguintes dados:
```json
{
  "sessionId": "nr-1754183221026-m2bjouq9m",
  "avaliacaoNegativa": "texto da avaliação",
  "informacoesAdicionais": "informações extras",
  "nomeVendedor": "nome",
  "cargoVendedor": "cargo",
  "nomeCliente": "cliente",
  "idPedido": "123456",
  "userId": 2,
  "timestamp": "2025-08-03T01:07:01.000Z"
}
```

## Exemplo de Resposta Esperada

O callback espera receber:

**URL:** `https://aluno-power.replit.app/api/agents/amazon-negative-reviews/webhook-callback?sessionId=nr-1754183221026-m2bjouq9m&userId=2`

**Body:**
```json
[
  {
    "retorno": "Olá [Nome],\n\nTexto da resposta..."
  }
]
```

## Teste Manual

Para testar se o callback está funcionando, você pode usar este comando curl:

```bash
curl -X POST "https://aluno-power.replit.app/api/agents/amazon-negative-reviews/webhook-callback?sessionId=COLOQUE_O_SESSION_ID_AQUI&userId=2" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "retorno": "Resposta de teste"
    }
  ]'
```

## Resumo

O fluxo correto deve ser:
1. Sistema envia dados → Webhook n8n
2. n8n processa com ChatGPT
3. n8n envia resposta → Callback do sistema (ESTE PASSO ESTÁ FALTANDO)
4. Sistema atualiza a página com a resposta