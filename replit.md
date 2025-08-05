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

### Amazon Listing Optimizer - Migração para Webhook N8N (05/08/2025)
- **Mudança**: Migrado de API direta para webhook n8n
- **Endpoint**: `https://n8n.guivasques.app/webhook-test/amazon_listing_optimizer`
- **Arquitetura**: App → N8n Webhook (aguarda resposta) → IA → Retorno direto (120s timeout)
- **Funcionalidades**:
  - ✅ Processamento síncrono via webhook n8n
  - ✅ Timeout de 2 minutos (120 segundos)
  - ✅ Dedução automática de créditos (10 créditos)
  - ✅ Validação de campos obrigatórios (productName, brand, category, reviewsData)
  - ✅ Logging completo de AI generation
  - ✅ Tratamento de erros e timeouts
- **Dados Enviados**: userId, userName, userEmail, productData, reviewsData, sessionId, timestamp
- **Status**: ✅ **IMPLEMENTADO E TESTADO COM SUCESSO**

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