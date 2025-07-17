# Guia de Configuração SMTP - Core Guilherme Vasques

## Como Configurar o SMTP no Replit

### 1. Acesse os Secrets do Replit
1. Vá para a aba **Secrets** (ícone de chave 🔑) no painel lateral esquerdo
2. Ou acesse: `https://replit.com/@SEU_USERNAME/NOME_DO_REPL/~` → Tools → Secrets

### 2. Adicione as Seguintes Variáveis

#### Configurações Obrigatórias:

**SMTP_HOST**
- Valor: `smtp.gmail.com` (para Gmail)
- Outros exemplos: `smtp.outlook.com`, `smtp.yahoo.com`, `mail.suaempresa.com`

**SMTP_PORT** 
- Valor: `587` (TLS - recomendado)
- Alternativa: `465` (SSL)

**SMTP_USER**
- Valor: Seu email completo (ex: `seuemail@gmail.com`)

**SMTP_PASS**
- Valor: Sua senha do email ou **senha de app** (recomendado)
- Para Gmail: Use uma senha de app específica

**SMTP_FROM** (opcional)
- Valor: Email que aparecerá como remetente
- Se não configurado, usará o SMTP_USER

#### Configurações Opcionais:

**SMTP_SECURE**
- Valor: `false` (para porta 587)
- Valor: `true` (para porta 465)

**APP_URL**
- Valor: URL da sua aplicação (ex: `https://seu-repl.replit.app`)
- Usado nos links de reset de senha

### 3. Configuração para Gmail

#### Opção 1: Senha de App (Recomendado)
1. Acesse sua conta Google
2. Vá em **Segurança** → **Verificação em duas etapas**
3. Em **Senhas de app**, gere uma nova senha
4. Use essa senha no **SMTP_PASS**

#### Opção 2: OAuth2 (Avançado)
- Mais seguro, mas requer configuração adicional
- Não implementado nesta versão

### 4. Exemplo de Configuração Completa

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=guilherme@coreguilhermevasques.com
SMTP_PASS=abcd efgh ijkl mnop
SMTP_FROM=noreply@coreguilhermevasques.com
APP_URL=https://core-guilherme-vasques.replit.app
```

### 5. Teste a Configuração

Após configurar, teste com:
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"email":"seu-email@teste.com"}' \
  http://localhost:5000/api/auth/forgot-password
```

## Problemas Comuns

### 1. "Falha na configuração SMTP"
- Verifique se todas as variáveis estão configuradas
- Confirme host e porta corretos

### 2. "Authentication failed"
- Use senha de app para Gmail
- Verifique se 2FA está ativado
- Confirme usuário e senha

### 3. "Connection timeout"
- Verifique firewall/proxy
- Teste com porta 465 (SSL) em vez de 587 (TLS)

### 4. Gmail bloqueia envios
- Ative "Aplicativos menos seguros" (não recomendado)
- Prefira usar senhas de app

## Emails Implementados

✅ **Recuperação de senha** - `sendPasswordReset()`
✅ **Boas-vindas de assinatura** - `sendSubscriptionWelcome()`
✅ **Confirmação de pagamento** - `sendPaymentConfirmation()`
✅ **Falha de pagamento** - `sendPaymentFailed()`
✅ **Compra de créditos** - `sendCreditsPurchase()`
✅ **Lembrete de renovação** - `sendRenewalReminder()`
✅ **Fim de período de teste** - `sendTrialEnding()`
✅ **Cancelamento de assinatura** - `sendSubscriptionCanceled()`

## Segurança

- Nunca exponha senhas em logs
- Use senhas de app em vez de senhas principais
- Configure APP_URL para produção
- Monitore logs de envio de email