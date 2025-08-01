# Webhook Bullet Points Generator

## Visão Geral
O Gerador de Bullet Points foi migrado de providers de IA para um webhook n8n personalizado, oferecendo maior controle e flexibilidade no processamento.

## Configuração do Webhook

### URL do Webhook
```
https://n8n.guivasques.app/webhook-test/gerar-bullet-points
```

### Método
`POST`

### Headers
```json
{
  "Content-Type": "application/json"
}
```

## Estrutura de Dados Enviados

### Payload JSON
```json
{
  "productName": "Nome do produto",
  "brand": "Marca do produto",
  "targetAudience": "Público-alvo",
  "warranty": "Garantia",
  "keywords": "Palavras-chave",
  "uniqueDifferential": "Diferencial único",
  "materials": "Materiais",
  "productInfo": "Informações detalhadas do produto",
  "config": {
    "provider": "webhook",
    "model": "n8n-bullet-points",
    "temperature": 0.7,
    "maxTokens": 6000
  },
  "prompt": "Prompt completo formatado com variáveis substituídas",
  "userId": 2,
  "timestamp": "2025-08-01T03:43:00.000Z"
}
```

### Campos Obrigatórios
- `productName`: Nome do produto (máx. 120 caracteres)
- `productInfo`: Informações detalhadas (máx. 2000 caracteres)

### Campos Opcionais
- `brand`: Marca (máx. 40 caracteres)
- `targetAudience`: Público-alvo (máx. 150 caracteres)
- `warranty`: Garantia (máx. 15 caracteres)
- `keywords`: Palavras-chave (máx. 150 caracteres)
- `uniqueDifferential`: Diferencial único (máx. 100 caracteres)
- `materials`: Materiais (máx. 120 caracteres)

## Estrutura de Resposta Esperada

### Resposta de Sucesso
```json
{
  "bulletPoints": "1. BULLET POINT 1 - Texto persuasivo com 200-275 caracteres...\n2. BULLET POINT 2 - Texto persuasivo com 200-275 caracteres...\n..."
}
```

### Campos de Resposta Aceitos
O sistema processa a resposta na seguinte ordem de prioridade:
1. `bulletPoints` - Campo preferencial
2. `response` - Campo alternativo
3. `content` - Campo alternativo
4. `message` - Campo alternativo
5. JSON completo como string (fallback)

### Resposta de Erro
```json
{
  "error": "Descrição do erro"
}
```

## Especificações dos Bullet Points

### Formato Requerido
- **Quantidade**: Exatamente 8 bullet points
- **Tamanho**: 200-275 caracteres cada (incluindo espaços)
- **Estrutura**: 
  1. Público-alvo + Proposta Única de Valor
  2. Benefício Emocional Principal
  3. Características Técnicas + "ADICIONAR AO CARRINHO"
  4. Facilidade de Uso
  5. GARANTIA OFICIAL (obrigatório)
  6. Transformação/Resultado Final
  7. Exclusividade/Inovação
  8. Call to Action Final

### Regras de Conteúdo
- Tom comercial e persuasivo
- Foco em benefícios, não características
- Uso de gatilhos mentais e urgência
- Linguagem simples e clara
- NUNCA inventar características não informadas
- NUNCA mencionar preço, envio ou estoque

## Monitoramento e Logs

### Sistema de Logs
- Tokens estimados: `Math.ceil(prompt.length / 4)` para input
- Tokens estimados: `Math.ceil(response.length / 4)` para output  
- Custo estimado: `((inputTokens + outputTokens) / 1000) * 0.0125`
- Duração de processamento registrada

### Métricas Registradas
- Feature Code: `agents.bullet_points`
- Input/Output tokens estimados
- Custo total da operação
- Tempo de processamento
- Log de uso para auditoria

## Tratamento de Erros

### Erros do Webhook
- Timeout de conexão
- Resposta HTTP não-200
- JSON inválido na resposta
- Campos obrigatórios não fornecidos

### Fallbacks
- Mensagem de erro amigável ao usuário
- Log detalhado para debugging
- Manutenção do estado da interface
- Opção de retry manual

## Migração de AI Provider

### Alterações Realizadas
1. ✅ Substituição de `/api/ai-providers/test` por webhook n8n
2. ✅ Remoção de dependência de configurações de agente IA
3. ✅ Estruturação de dados JSON para webhook
4. ✅ Adaptação do tratamento de resposta
5. ✅ Manutenção do sistema de logs e créditos
6. ✅ Atualização de mensagens de feedback

### Benefícios da Migração
- **Flexibilidade**: Controle total sobre o processamento
- **Customização**: Lógica específica no n8n
- **Escalabilidade**: Independência de providers de IA
- **Monitoramento**: Logs detalhados no n8n
- **Integração**: Conexão com outros sistemas via n8n