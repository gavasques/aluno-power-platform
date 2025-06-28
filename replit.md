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

- **June 28, 2025**: Sistema completo de IA com 4 provedores e 25 modelos ativos + armazenamento centralizado de imagens
  - Adicionado DeepSeek com integração nativa usando API compatível OpenAI
  - Atualizados modelos OpenAI incluindo série o4 (o4, o4-mini) com configurações especiais
  - Implementado modelo gpt-image-1 (nova geração multimodal da OpenAI) com armazenamento automático
  - Sistema centralizado de imagens geradas: todas as imagens do gpt-image-1 são automaticamente salvas no banco
  - Removida implementação Imagen 4.0 do Google (por solicitação do usuário)
  - Modelos disponíveis por categoria:
    - OpenAI Normal: gpt-4.1, gpt-4.1-mini, gpt-4.1-nano
    - OpenAI Raciocínio: o1-preview, o1-mini, o4, o4-mini
    - OpenAI Imagem: gpt-image-1 (modelo multimodal nova geração)
    - OpenAI Legacy: gpt-4o, gpt-4o-mini, gpt-4-turbo, gpt-3.5-turbo
    - Claude 4.0: claude-sonnet-4-20250514, claude-4-opus
    - Claude 3.x: claude-3-5-sonnet, claude-3-opus, claude-3-haiku
    - Gemini 2.5: gemini-2.5-pro, gemini-2.5-flash, gemini-2.5-flash-lite-preview
    - Gemini Legacy: gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp
    - DeepSeek: deepseek-chat, deepseek-coder
  - Interface completa com 4 provedores ativos e seleção por categorias
  - Sistema de teste de conectividade validado para todos os 25 modelos
  - Configurações especiais para modelos de raciocínio (série o1 e o4) sem temperatura
  - Central de imagens geradas com interface administrativa completa
  - Preços atualizados conforme documentação oficial:
    - GPT-4.1: $2.50/$10.00 por 1M tokens
    - GPT-4o: $2.50/$10.00 por 1M tokens  
    - gpt-image-1: $5.00 input + $0.167 por imagem (qualidade alta, formato PNG)

## Changelog

- June 28, 2025. Complete AI provider ecosystem with 4 active integrations
- June 27, 2025. Initial setup and AI provider integrations