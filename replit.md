# Aluno Power Platform - AI Agents System

## Overview
This project is an educational e-commerce platform specializing in Amazon FBA and e-commerce training. Its core purpose is to provide students with essential tools, resources, and an integrated AI agents system to master e-commerce strategies. The platform aims to be a comprehensive solution for learning and implementing e-commerce practices, enhancing user capabilities through AI-powered assistance for tasks like Amazon listing optimization via competitor review analysis and content generation. The project is deployment-ready, with a robust, modular architecture and optimized performance.

## User Preferences
**Communication Style**: Simple, everyday language (user is non-technical)

## Recent Changes (August 1, 2025)
- **Bullet Points Interface Reorganization**: Field order optimized for better user experience
  - Reorganized form layout: Product basics → Product details textarea → Customer reviews (optional)
  - Improved workflow: users fill essential product info first, then detailed description, then optional review analysis
  - Maintained all existing functionality while enhancing usability
- **Bullet Points Webhook Enhancement**: Comprehensive improvements to bullet points generator
  - Migrated from AI providers to secure webhook system (internal URL configured)
  - Removed technical configuration display (Model, Temperature, Max Tokens, Cost) from user interface
  - Updated field label from "Informações" to "Informações do produto" with enhanced placeholder text
  - **Amazon Reviews Integration**: Added optional Amazon reviews extraction functionality
    - Multiple ASIN support with individual country selection per ASIN
    - Tag-based interface showing "ASIN (Country)" for each added product
    - Robust extraction system that processes ALL ASINs even if some fail
    - Intelligent error handling with maximum 3 consecutive errors per ASIN
    - Extracts up to 2 pages per ASIN with visual progress indicator
    - Reviews data automatically integrated into JSON structure sent to webhook
    - Structured data format: `informacoes_basicas` + `avaliacoes_clientes` in JSON
    - Country mapping function ensures correct API calls for each marketplace
  - **Webhook Payload Optimization**: Fixed API response parsing and cleaned webhook data
    - Corrected review extraction from `data.data.reviews` structure
    - Optimized payload to send only filled form fields and extracted reviews
    - Removed technical metadata (config, timestamps, userId) from webhook
    - Streamlined JSON structure for cleaner n8n processing
  - Removed duplicate AgentProcessorPage.tsx causing interface conflicts
  - Enhanced logging and debug information for webhook data structure
  - Maintained compatibility with existing webhook API while expanding capabilities
- **Previous Changes (January 31, 2025)**:
  - Tools Routes Fixed: Corrected all PRO tool routes from `/tools/` to `/ferramentas/` prefix
  - LoadingState Error Fixed: Resolved import/export issues in states/index.ts
  - Hub Pages Optimized: Removed PartnersProvider dependency from Partners.tsx
  - Agent Pages Layout: All agent pages use PermissionGuard without Layout wrapper
  - Route Configuration: Standardized all 10 tools to use `/ferramentas/` prefix
  - Agents Verification: All 9 AI agents verified working correctly
  - Minha Área Complete: All 8 sections functional
  - TypeScript Errors Resolved: Fixed remaining type issues

## System Architecture
### Frontend Architecture
The frontend is built with React 18, TypeScript, and Vite. Styling is handled by Tailwind CSS and shadcn/ui components. State management uses TanStack Query and React Context, with Wouter for client-side routing. The code adheres to a DRY-compliant modular system, featuring generic services (e.g., `BaseCrudService`), unified hooks (`useCrudQuery`), a component library (e.g., `EntityManager`, `FormDialog`), and a utility system for data formatting. A strict Container/Presentational pattern is enforced for complex components.

### Backend Architecture
The backend uses Node.js and Express with TypeScript, providing RESTful endpoints and WebSocket support for real-time features. Data is managed with PostgreSQL and Drizzle ORM. AI integration is multi-provider, supporting OpenAI, Anthropic, Google, DeepSeek, and xAI. Security is robust, featuring JWT authentication, role-based permissions, and audit logging. File handling is managed via Multer with validation and S3-compatible storage.

### AI Agents System
The AI system focuses on Amazon listing optimization, including CSV upload from Helium10, competitor review analysis, and generation of optimized titles, bullet points, and descriptions. It tracks token usage and costs and supports multiple AI providers with fallbacks.

### Database Schema
Key tables include `agents` (configurations), `agent_prompts` (templates), `agent_usage` (tracking), and `agent_generations` (content storage), alongside supporting tables for users, materials, tools, partners, and suppliers.

### Security & Permissions
The system employs Role-Based Access Control (RBAC) with a clean 5-group architecture: `admin`, `mentorados`, `alunos`, `pagantes`, and `gratuito`. Security features include granular permissions, audit logging, rate limiting, input sanitization, XSS protection, CSRF protection, and secure headers.

### Development Guidelines & Performance
The project follows strict development guidelines, emphasizing type safety with TypeScript, consistent error handling, and comprehensive testing. Performance is optimized through techniques like React.memo(), useCallback(), useMemo(), and significant code reduction (77.4% reduction in effective lines), leading to improved FCP, LCP, TTI, and reduced memory usage.

## External Dependencies
- **AI Providers**: OpenAI, Anthropic, Google, DeepSeek, xAI
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: S3-compatible storage (e.g., AWS S3, MinIO)
- **Payment Processing**: Stripe
- **Video Integration**: YouTube API (for content management)
- **Webhook Automation**: n8n (used for specific agent integrations)