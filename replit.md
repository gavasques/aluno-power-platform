# Aluno Power Platform - AI Agents System

## Overview

This is a comprehensive educational e-commerce platform focused on Amazon FBA and e-commerce training, featuring an integrated AI agents system. The platform provides tools, resources, and AI-powered assistance for students learning e-commerce strategies.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state and React Context for local state
- **Routing**: Wouter for lightweight client-side routing
- **Theme**: Light theme with HSL-based color system

### Backend Architecture
- **Runtime**: Node.js with Express framework
- **API**: RESTful API with WebSocket support for real-time features
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI API for agent processing
- **External Services**: YouTube API for video content management

### Database Schema
The system uses PostgreSQL with the following core tables:
- `agents` - AI agent configurations
- `agent_prompts` - Prompt templates for different agent operations
- `agent_usage` - Usage tracking and analytics
- `agent_generations` - Generated content storage
- Supporting tables for users, materials, tools, partners, suppliers, and content management

## Key Components

### AI Agents System
- **Purpose**: Amazon listing optimization through competitor review analysis
- **Core Features**: 
  - CSV upload from Helium10 or manual text input
  - Analysis of competitor reviews
  - Generation of optimized titles, bullet points, and descriptions
  - Token usage tracking and cost monitoring
- **Models**: Configurable OpenAI models with temperature and token limits

### Content Management
- **Hub Resources**: Tools, materials, templates, prompts, partners, and suppliers
- **News & Updates**: Publishing system with categorization and featured content
- **Video Integration**: YouTube channel synchronization with automated content fetching
- **User Area**: Personal content management and product catalog

### Admin Panel
- **Dashboard**: Analytics and system overview
- **User Management**: Role-based access control (admin, support, user)
- **Content Administration**: Full CRUD operations for all resource types
- **System Configuration**: Platform settings and AI credit management

## Data Flow

### AI Processing Flow
1. User selects an AI agent (e.g., Amazon Listings)
2. Input product information and competitor review data
3. Agent processes through multiple prompts (system, analysis, generation)
4. OpenAI API generates optimized content
5. Results stored with usage metrics and cost tracking
6. Real-time updates via WebSocket connections

### Content Synchronization
1. YouTube service runs scheduled sync (2x daily)
2. Fetches latest videos from configured channels
3. Stores metadata and thumbnails in database
4. WebSocket notifications for real-time updates
5. Content categorization and search indexing

## External Dependencies

### Core Dependencies
- **OpenAI API**: AI agent processing and content generation
- **YouTube Data API v3**: Video content synchronization
- **Neon Database**: Serverless PostgreSQL hosting
- **shadcn/ui**: Component library for consistent UI

### Development Tools
- **Drizzle Kit**: Database migrations and schema management
- **TanStack Query**: Server state management and caching
- **Replit Tools**: Development environment integration
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

### Development Environment
- Replit-based development with hot reloading
- WebSocket support for real-time features
- Environment variable configuration for API keys
- Automated database provisioning

### Production Considerations
- Express server with compression middleware
- Static asset serving from dist/public
- Error handling and logging middleware
- Database connection pooling with Neon

### Performance Optimizations
- Query result caching with TanStack Query
- Lazy loading for route components
- Image optimization and CDN integration
- WebSocket connection management

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

- **June 29, 2025**: ✅ Sistema completo de IA + implementação avançada de sessões para Amazon Listing Optimizer
  - **Provedores de IA**: 19 modelos funcionais em 4 provedores (OpenAI, Anthropic, Gemini, DeepSeek)
  - **Sistema de Sessões**: Implementação completa seguindo princípios SOLID
    - Tabelas: agent_sessions, agent_session_files com relações e índices otimizados
    - SessionService: Gerenciamento de ciclo de vida com responsabilidade única
    - APIs RESTful: /api/sessions com operações CRUD completas
    - Tags automáticas: {KEYWORDS}, {PRODUCT_NAME}, {CATEGORY}, etc.
  - **Amazon Listing Optimizer Refatorado**: 
    - Sistema de sessões integrado com hash único e ID do usuário visíveis
    - Upload múltiplo de até 10 arquivos de avaliações com processamento automático
    - Dropdown de categorias do banco de dados (removido campo preço)
    - Tags geradas automaticamente disponíveis para prompts
    - Validação com Zod e formulário reativo
    - Arquitetura modular seguindo DRY, KISS e SOLID

- **June 29, 2025 (anterior)**: ✅ Atualização dos modelos OpenAI conforme nova documentação
  - Removidos modelos: o1-preview, o1-mini, o3-pro (problemas de endpoint)
  - Adicionado modelo: o3 ($20/$80 por 1M tokens)
  - Corrigido GPT-4o: limitação automática de temperatura máxima 1.0
  - Implementado suporte correto para modelos de raciocínio série "o"
  - Modelos o4-mini, o3 usam max_completion_tokens (não max_tokens)
  - Modelos de raciocínio não suportam temperature (removido automaticamente)
  - Sistema completo: validação automática de parâmetros por tipo de modelo

- **June 29, 2025 (anterior)**: ✅ SUCESSO - OpenAI /images/edits endpoint funcionando com gpt-image-1
  - Endpoint oficial client.images.edit() com modelo gpt-image-1 FUNCIONANDO
  - Teste realizado: 1 imagem de referência + prompt "ajuste pra vender"
  - Resposta: imagem base64 de 2.4MB gerada em 55 segundos
  - Custo correto: $0.167025 conforme documentação
  - Parâmetros: output_format='png', quality='high', size='auto'
  - Sistema completo: upload → /images/edits → geração → visualização ✅

- **June 28, 2025**: Implementado sistema GPT-Image-1 exclusivo para geração e edição de imagens
  - Corrigido erro "PayloadTooLargeError" aumentando limite servidor para 50MB
  - Modelo "gpt-image-edit" usa EXCLUSIVAMENTE gpt-image-1 com formato multimodal correto
  - Modelo "gpt-image-1" para geração usa EXCLUSIVAMENTE gpt-image-1, sem fallbacks DALL-E
  - Interface de teste com upload de imagem: funcionalidade completa para testar edição
  - Sistema de validação: obrigatório upload de imagem para modelo gpt-image-edit
  - Logs detalhados para diagnóstico completo de problemas
  - Tratamento de erros específicos para acesso organizacional ao gpt-image-1
  - Preview de imagem carregada e opção de remoção na interface de teste
  - Suporte multimodal: texto + imagem como entrada para gpt-image-1

- **June 28, 2025 (anterior)**: Otimizado conjunto de modelos OpenAI para manter apenas os mais estáveis
  - Removidos: o4, o3, o3-mini (requerem verificação), gpt-4-turbo, gpt-3.5-turbo (instáveis)
  - Configurado gpt-image-1 com modo demo (simula geração quando verificação organizacional não disponível)
  - Mantidos modelos confiáveis: gpt-4.1, gpt-4o, o1-preview, o1-mini, o4-mini
  - Sistema de teste de conexão com JSON formatado e downloads funcionando
  - Interface completa com campos de requisição e resposta em JSON

- **June 28, 2025 (anterior)**: Sistema completo funcionando com navegação corrigida e interface de imagens geradas
  - Corrigidas todas as rotas de navegação do painel administrativo
  - Interface de imagens geradas completamente funcional em /admin/images
  - Sistema de configuração de provedores funcionando em /admin/agents/providers
  - Corrigido endpoint de atualização de agentes com logging detalhado
  - Todas as 4 integrações de IA ativas e prontas para uso

- **June 28, 2025 (anterior)**: Sistema completo de IA com 4 provedores e 25 modelos ativos + armazenamento centralizado de imagens
  - Adicionado DeepSeek com integração nativa usando API compatível OpenAI
  - Atualizados modelos OpenAI incluindo série o4 (o4, o4-mini) com configurações especiais
  - Implementado modelo gpt-image-1 (nova geração multimodal da OpenAI) com armazenamento automático
  - Sistema centralizado de imagens geradas: todas as imagens do gpt-image-1 são automaticamente salvas no banco
  - Removida implementação Imagen 4.0 do Google (por solicitação do usuário)
  - Modelos disponíveis por categoria:
    - OpenAI Normal: gpt-4.1, gpt-4.1-mini, gpt-4.1-nano
    - OpenAI Raciocínio: o1-preview, o1-mini, o4-mini
    - OpenAI Imagem: gpt-image-1 (modelo de geração e edição de imagens)
    - OpenAI Legacy: gpt-4o, gpt-4o-mini
    - Claude 4.0: claude-sonnet-4-20250514, claude-4-opus
    - Claude 3.x: claude-3-5-sonnet, claude-3-opus, claude-3-haiku
    - Gemini 2.5: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite-preview
    - Gemini Legacy: gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp
    - DeepSeek: deepseek-chat, deepseek-coder
  - Interface completa com 4 provedores ativos e seleção por categorias
  - Sistema de teste de conectividade validado para todos os 25 modelos
  - Configurações especiais para modelos de raciocínio (série o1 e o4-mini) sem temperatura
  - Central de imagens geradas com interface administrativa completa
  - Preços atualizados conforme documentação oficial:
    - GPT-4.1: $2.50/$10.00 por 1M tokens
    - GPT-4o: $2.50/$10.00 por 1M tokens  
    - gpt-image-1: $5.00 input + $0.167 por imagem (qualidade alta, formato PNG)

## Changelog

- June 28, 2025. Complete AI provider ecosystem with 4 active integrations
- June 27, 2025. Initial setup and AI provider integrations