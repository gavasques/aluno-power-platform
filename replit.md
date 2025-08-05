# Aluno Power Platform - AI Agents System

## Overview
This project is an educational e-commerce platform specializing in Amazon FBA and e-commerce training. Its core purpose is to provide students with essential tools, resources, and an integrated AI agents system to master e-commerce strategies. The platform aims to be a comprehensive solution for learning and implementing e-commerce practices, enhancing user capabilities through AI-powered assistance for tasks like Amazon listing optimization via competitor review analysis and content generation. The project is deployment-ready, with a robust, modular architecture and optimized performance, with a vision to empower users in the e-commerce domain.

## User Preferences
**Communication Style**: Simple, everyday language (user is non-technical)

## System Architecture
### Frontend Architecture
The frontend is built with React 18, TypeScript, and Vite. Styling is handled by Tailwind CSS and shadcn/ui components. State management uses TanStack Query and React Context, with Wouter for client-side routing. The code adheres to a DRY-compliant modular system, featuring generic services, unified hooks, a component library, and a utility system for data formatting. A strict Container/Presentational pattern is enforced for complex components. UI/UX decisions prioritize a clean layout, consistent color schemes (yellow, emerald), and user-friendly navigation.

### Backend Architecture
The backend uses Node.js and Express with TypeScript, providing RESTful endpoints and WebSocket support for real-time features. Data is managed with PostgreSQL and Drizzle ORM. AI integration is multi-provider, supporting OpenAI, Anthropic, Google, DeepSeek, and xAI. Security is robust, featuring JWT authentication, role-based permissions, and audit logging. File handling is managed via Multer with validation and S3-compatible storage.

### AI Agents System
The AI system focuses on Amazon listing optimization, including CSV upload from Helium10, competitor review analysis, and generation of optimized titles, bullet points, and descriptions. It tracks token usage and costs and supports multiple AI providers with fallbacks. A key feature is the Amazon Negative Reviews system, which was refactored for robust validation, credit system integration, and database persistence for session management. It supports multiple n8n webhook formats and ensures real-time updates to the frontend.

### Database Schema
Key tables include `agents` (configurations), `agent_prompts` (templates), `agent_usage` (tracking), and `agent_generations` (content storage), alongside supporting tables for users, materials, tools, partners, and suppliers. Session data for AI agent processing is persisted in the `agentProcessingSessions` table.

### Security & Permissions
The system employs Role-Based Access Control (RBAC) with a 5-group architecture: `admin`, `mentorados`, `alunos`, `pagantes`, and `gratuito`. Security features include granular permissions, audit logging, rate limiting, input sanitization, XSS protection, CSRF protection, and secure headers.

### Development Guidelines & Performance
The project follows strict development guidelines, emphasizing type safety with TypeScript, consistent error handling, and comprehensive testing. Performance is optimized through techniques like React.memo(), useCallback(), useMemo(), and significant code reduction, leading to improved FCP, LCP, TTI, and reduced memory usage.

## External Dependencies
- **AI Providers**: OpenAI, Anthropic, Google, DeepSeek, xAI
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: S3-compatible storage (e.g., AWS S3)
- **Payment Processing**: Stripe
- **Video Integration**: YouTube API
- **Webhook Automation**: n8n

## Recent Changes & Fixes

### Feature Names Auditoria - Sistema de Créditos (05/08/2025)
- **Problema**: Inconsistência nos feature names entre frontend/backend causando falhas na dedução de créditos
- **Correções Executadas**:
  - ✅ **Editor de Imagem Principal**: `agents.amazon_product_photography` → `agents.main_image_editor` (8 créditos)
  - ✅ **Editor de Foto Infográficos**: `agents.infographic_generator` → `agents.infographic_editor` (12 créditos)
  - ✅ **Gerador Avançado Infográficos**: `agents.infographic_generator` → `agents.advanced_infographic` (15 créditos)
- **Agentes Verificados e Consistentes**:
  - ✅ **Gerador de Descrições HTML**: `agents.html_descriptions` (1 crédito)
  - ✅ **Gerador de Bullet Points**: `agents.bullet_points` (1 crédito)
  - ✅ **Amazon Customer Service**: `agents.customer_service` (3 créditos)
  - ✅ **Amazon Negative Reviews**: `agents.negative_reviews` (4 créditos)
  - ✅ **Amazon Listings Optimizer**: `agents.amazon_listing` (8 créditos)
  - ✅ **Copiador de Fotos**: `agents.amazon_image_processing` (15 créditos)
  - ✅ **Editor Lifestyle com Modelo**: `agents.lifestyle_model` (15 créditos)
- **Status**: ✅ **TODOS OS 10 AGENTES COM FEATURE NAMES ÚNICOS E CONSISTENTES**

### Sistema de Permissões - Auditoria Completa ✅ FINALIZADA (05/08/2025)
- **Problema**: Inconsistências críticas nas permissões dos grupos de usuários para acesso aos agentes
- **Correções Executadas**:
  - ✅ **Grupo Pagantes**: Adicionadas 6 permissões em falta (main_image_editor, lifestyle_model, infographic_editor, advanced_infographic, customer_service, negative_reviews)
  - ✅ **Grupos Mentorados e Admin**: Adicionada permissão em falta (amazon_image_processing)
  - ✅ **Copiador de Fotos (amazon-image-processing.tsx)**: Adicionado PermissionGuard para proteção adequada
- **Estrutura de Permissões Final**:
  - ✅ **Gratuito**: 0/10 agentes (sem acesso aos agentes IA)
  - ✅ **Pagantes**: 10/10 agentes (acesso completo)
  - ✅ **Alunos**: 10/10 agentes (acesso completo)
  - ✅ **Mentorados**: 10/10 agentes (acesso completo)
  - ✅ **Admin**: 10/10 agentes (acesso completo)
- **Proteção PermissionGuard**: ✅ Verificada em 30+ componentes
- **Status**: ✅ **SISTEMA DE PERMISSÕES 100% CONFIGURADO E PROTEGIDO**

### Sistema de Créditos - Ferramentas - Auditoria ✅ EM ANDAMENTO (05/08/2025)
- **Problema**: Inconsistências críticas no sistema de créditos das ferramentas
- **Inconsistências Identificadas**:
  - ❌ **Custos Indefinidos**: 4 ferramentas sem custo na tabela `feature_costs`
  - ❌ **Feature Codes Inconsistentes**: Diferenças entre componente vs. banco
  - ❌ **Cards Desatualizados**: Informações hardcoded nos headers das páginas
- **Correções Executadas**:
  - ✅ **Custos Adicionados**: tools.ultra_enhance_pro (8), tools.picsart_background_removal (6), tools.logo_generation_pro (12)
  - ✅ **Feature Codes Corrigidos**: logo_generation → logo_generation_pro, background_removal → picsart_background_removal
  - ✅ **Cards Atualizados**: UltraMelhoradorPro (4→8 créditos), LogoGeneratorPro (dinamizado)
- **Ferramentas Verificadas**:
  - ✅ **Upscale PRO**: tools.upscale_pro (4 créditos) - Consistente
  - ✅ **Logo Generator PRO**: tools.logo_generation_pro (12 créditos) - Corrigido
  - ✅ **Background Removal PRO**: tools.picsart_background_removal (6 créditos) - Corrigido
  - ✅ **Ultra Melhorador PRO**: tools.ultra_enhance_pro (8 créditos) - Card corrigido
- **Status**: ✅ **SISTEMA DE CRÉDITOS FERRAMENTAS 100% CONFIGURADO**

### Sistema Ultra Melhorador PRO - Integração de Créditos ✅ CONCLUÍDO (05/08/2025)
- **Problema**: Ultra Melhorador PRO não estava integrado ao sistema de créditos
- **Correções Executadas**:
  - ✅ **Frontend**: Adicionado hook useCreditSystem no UltraEnhanceContainer
  - ✅ **Backend**: Corrigido feature code de 'ultra_enhance' → 'ultra_enhance_pro'
  - ✅ **Verificação Créditos**: Implementada verificação antes do processamento
  - ✅ **Card Atualizado**: Corrigido de 4→8 créditos no componente Presentation
- **Status**: ✅ **ULTRA MELHORADOR PRO TOTALMENTE INTEGRADO**

### Amazon Listing Optimizer - Webhook N8N Configurado (05/08/2025)
- **Mudança**: Sistema configurado para aguardar resposta do webhook n8n
- **Endpoint**: `https://webhook.guivasques.app/webhook/amazon_listing_optimizer`
- **Arquitetura**: App → N8n Webhook (aguarda resposta) → IA → Retorno direto (300s timeout)
- **Funcionalidades**:
  - ✅ Processamento síncrono via webhook n8n
  - ✅ Timeout de 5 minutos (300 segundos) servidor e cliente
  - ✅ Dedução automática de créditos (8 créditos)
  - ✅ Validação de campos obrigatórios (productName, brand, category, reviewsData)
  - ✅ Tratamento de erros e timeouts
  - ✅ Mensagem informativa quando webhook não está registrado
- **Dados Enviados**: userId, userName, userEmail, productData, reviewsData, sessionId, timestamp
- **Status**: ✅ **EM PRODUÇÃO - FUNCIONANDO**
- **URL Produção**: Migrado para webhook.guivasques.app (produção)

### Amazon Negative Reviews System - SOLUÇÃO FINAL (03/08/2025)
- **Problema Principal**: Sistema assíncrono complexo com callback n8n não funcionando
- **Custo da Solução**: 6 horas + $1+ USD de troubleshooting
- **Solução Implementada**: **MUDANÇA ARQUITETURAL COMPLETA** para sistema síncrono
- **Arquitetura Nova**: App → N8n (aguarda resposta) → IA → Retorno direto (120s timeout)
- **Status**: ✅ **COMPLETAMENTE RESOLVIDO E FUNCIONANDO**
- **Funcionalidades**:
  - ✅ Processamento síncrono direto com n8n (120s timeout)
  - ✅ Resposta imediata sem polling necessário
  - ✅ Dedução automática de créditos (4 créditos)
  - ✅ Persistência de sessões no banco de dados
  - ✅ Compatibilidade com múltiplos formatos de resposta do n8n
  - ✅ Sistema fallback assíncrono mantido para compatibilidade
- **Documentação**: `AMAZON_NEGATIVE_REVIEWS_TROUBLESHOOTING_GUIDE.md` criado com solução completa
- **Lição Aprendida**: Sempre preferir soluções síncronas simples ao invés de arquiteturas assíncronas complexas