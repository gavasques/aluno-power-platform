# Aluno Power Platform 🚀

Uma plataforma SaaS completa para vendedores online com foco em Amazon, oferecendo agentes de IA, simuladores financeiros e ferramentas de gestão empresarial.

## 📋 Visão Geral

O **Aluno Power Platform** é um sistema enterprise desenvolvido para **vendedores de e-commerce** que precisam de automação, análise financeira e gestão de produtos em escala profissional. A plataforma combina inteligência artificial, ferramentas de processamento de imagens e simuladores financeiros em uma única solução integrada.

## 🎯 Principais Funcionalidades

### 🤖 Agentes de IA
- **Amazon Listing Optimizer** - Otimização automática de listings
- **HTML Description Generator** - Geração de descrições profissionais
- **Bullet Points Generator** - Criação de bullet points otimizados
- **Customer Service Agent** - Atendimento automatizado
- **Negative Reviews Handler** - Gestão de avaliações negativas
- **Product Photography Agent** - Análise e otimização de fotos
- **Infographic Generator** - Criação de infográficos

### 🛠️ Ferramentas
- **Processamento de Imagens**
  - Background removal profissional
  - Upscaling de imagens
  - Geração de logos
  - Ultra melhorador de imagens
- **Amazon Tools**
  - Extração de reviews
  - Sugestões de keywords
  - Detalhes de produtos
  - Editor de anúncios
- **Análise e Consultas**
  - Consulta CNPJ
  - Relatórios de keywords
  - Análise de concorrência

### 💰 Simuladores Financeiros
- **Importação Simplificada** - Cálculos para remessa expressa
- **Importação Formal Direta** - Simulação de importação formal
- **Simples Nacional** - Cálculo de impostos
- **ROI de Investimentos** - Análise de retorno sobre investimento

### 📦 Gestão de Produtos
- **Multi-channel Management** - Gestão de produtos em múltiplos canais
- **Pricing Calculations** - Cálculos automáticos de preços
- **Profit Analysis** - Análise de lucratividade
- **Supplier Management** - Gestão completa de fornecedores
- **Brand Management** - Gerenciamento de marcas

## 🏗️ Arquitetura Técnica

### Frontend
- **React 18** + TypeScript
- **Tailwind CSS** + Radix UI
- **Tanstack Query** para gerenciamento de estado
- **Wouter** para roteamento
- **Vite** como bundler

### Backend
- **Node.js** + Express + TypeScript
- **PostgreSQL** com Drizzle ORM
- **Stripe** para pagamentos
- **Helmet** + Enhanced Security
- **Rate Limiting** + CSRF Protection

### Integrações de IA
- **OpenAI GPT-4** - Geração de conteúdo principal
- **Anthropic Claude** - Análise e otimização
- **Google Gemini** - Processamento multimodal
- **DeepSeek** - Análise especializada
- **xAI Grok** - Insights avançados

### Serviços Externos
- **PicsArt API** - Processamento profissional de imagens
- **Stripe** - Pagamentos e assinaturas
- **Amazon APIs** - Integração com marketplace

## 🗄️ Estrutura do Banco de Dados

### Principais Entidades
```
Users (usuários + grupos + permissões)
├── Products (produtos multi-canal)
├── Suppliers (fornecedores + contatos)
├── Materials (materiais + categorias)
├── Partners (parceiros por tipo)
├── AgentSessions (sessões de IA)
├── Simulations (simulações financeiras)
└── Subscriptions (assinaturas + créditos)
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- Conta Stripe
- API Keys das plataformas de IA

### Instalação
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/aluno-power-platform.git
cd aluno-power-platform

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas configurações

# Execute as migrações do banco
npm run db:push

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente
```env
# Database
DATABASE_URL=postgresql://...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_AI_API_KEY=...

# PicsArt
PICSART_API_KEY=...
```

## 📁 Estrutura do Projeto

```
aluno-power-platform/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── contexts/      # Context providers
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Serviços e APIs
│   │   └── types/         # TypeScript types
├── server/                # Backend Node.js
│   ├── routes/           # Rotas da API
│   ├── services/         # Serviços de negócio
│   ├── middleware/       # Middlewares
│   ├── controllers/      # Controllers
│   └── utils/            # Utilitários
├── shared/               # Código compartilhado
│   ├── schema.ts         # Schema do banco
│   └── types/            # Types compartilhados
└── docs/                 # Documentação
```

## 🔐 Sistema de Autenticação

### Níveis de Acesso
- **Admin** - Acesso total ao sistema
- **Support** - Suporte técnico
- **User** - Usuário padrão
- **Guest** - Acesso limitado

### Grupos de Usuários
- Grupos customizáveis com permissões específicas
- Controle granular de acesso por funcionalidade
- Sistema de herança de permissões

## 💳 Sistema de Créditos

### Modelo de Negócio
- **Assinatura mensal** com créditos inclusos
- **Pay-per-use** para funcionalidades premium
- **Créditos automáticos** para usuários ativos
- **Tracking detalhado** de uso

### Custos por Funcionalidade
- Agentes de IA: 0.10 - 0.50 créditos
- Processamento de imagens: 0.05 - 0.20 créditos
- Simuladores: 0.02 - 0.10 créditos
- Ferramentas básicas: Gratuitas

## 📊 Analytics e Monitoramento

### Métricas Rastreadas
- **Uso por usuário** e por funcionalidade
- **Performance** de APIs e queries
- **Erros** e exceptions
- **Conversões** e retenção

### Dashboard Admin
- Visão geral do sistema
- Gestão de usuários
- Configuração de preços
- Monitoramento de performance

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia dev server
npm run build        # Build para produção
npm run start        # Inicia servidor de produção

# Banco de dados
npm run db:push      # Aplica mudanças no schema
npm run db:studio    # Interface visual do banco

# Testes e validação
npm run check        # Validação TypeScript
npm run lint         # Linting do código
```

## 🚀 Deploy

### Produção
O sistema está otimizado para deploy em:
- **Vercel** (Frontend)
- **Railway/Heroku** (Backend)
- **Neon/Supabase** (Database)

### Configurações de Produção
- SSL/TLS obrigatório
- Rate limiting habilitado
- Logs estruturados
- Monitoramento de performance
- Backup automático

## 📚 Documentação Adicional

- [Guia de Contribuição](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)
- [Análise de Segurança](./docs/SECURITY_IMPLEMENTATION_SUMMARY.md)
- [Otimizações de Performance](./docs/LAYOUT_OPTIMIZATION_ANALYSIS.md)
- [Refatoração da Dashboard](#-refatoração-da-dashboard)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🆘 Suporte

Para suporte técnico ou dúvidas:
- 📧 Email: suporte@alunopowerplatform.com
- 💬 Discord: [Link do servidor]
- 📱 WhatsApp: [Número de suporte]

## 🏆 Reconhecimentos

- Desenvolvido com ❤️ pela equipe Aluno Power Platform
- Agradecimentos especiais à comunidade open source
- Powered by leading AI providers

---

## 🔄 Refatoração da Dashboard

### Resumo da Refatoração (Janeiro 2025)

Realizamos uma **refatoração completa da dashboard do usuário** focada em eliminar código duplicado e melhorar performance. Esta foi uma das maiores otimizações já realizadas no sistema.

### 📊 Resultados Alcançados

**Redução Massiva de Código Duplicado:**
- `Dashboard.tsx`: 823 linhas → 10 linhas (-98.8%)
- `DashboardSimple.tsx`: 512 linhas → 10 linhas (-98.0%)
- **Total: ~80% de código duplicado eliminado**

### 🏗️ Nova Arquitetura

**Componentes Criados:**
```
/components/dashboard/
├── UnifiedDashboard.tsx          # Dashboard principal unificada
├── PromotionalSection.tsx        # Seção de promoções
├── SocialLinksSection.tsx        # Links sociais
├── NewsSection.tsx               # Seção de notícias
├── UpdatesSection.tsx            # Seção de novidades
└── NewsAndUpdatesModals.tsx      # Modais compartilhados

/hooks/
└── useNewsAndUpdates.ts          # Hook customizado
```

### ⚡ Otimizações de Performance

**Técnicas Implementadas:**
- `React.memo` em todos os componentes
- `useCallback` para funções do hook
- `useMemo` no retorno do hook
- Cache inteligente para APIs
- Lazy loading de componentes pesados

### 🎛️ Sistema Configurável

A nova dashboard é totalmente configurável via props:

```tsx
// Dashboard completa
<UnifiedDashboard 
  variant="full" 
  showAdvancedFeatures={true} 
  showUserStats={true} 
  showQuickActions={false}
/>

// Dashboard simples
<UnifiedDashboard 
  variant="simple" 
  showAdvancedFeatures={false} 
  showUserStats={false} 
  showQuickActions={true}
/>
```

### 📈 Benefícios

**Para Desenvolvedores:**
- ✅ Código 80% mais limpo e maintível
- ✅ Componentes reutilizáveis e modulares
- ✅ Uma única fonte de verdade
- ✅ Testes mais fáceis de implementar

**Para Usuários:**
- ✅ Dashboard mais rápida e responsiva
- ✅ Menor consumo de banda
- ✅ Experiência mais fluida
- ✅ Carregamento otimizado

### 🔧 Como Contribuir

Ao trabalhar com a dashboard, sempre:
1. Use a `UnifiedDashboard` como base
2. Crie novos componentes modulares em `/dashboard/`
3. Implemente otimizações de performance (memo, callback)
4. Mantenha a configurabilidade via props

---

**Aluno Power Platform** - Transformando vendedores online em empresários digitais de sucesso! 🚀