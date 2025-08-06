# Aluno Power Platform - AI Agents System

## Overview
This project is an educational e-commerce platform specializing in Amazon FBA and e-commerce training. Its core purpose is to provide students with essential tools, resources, and an integrated AI agents system to master e-commerce strategies. The platform consists of three main modules: Commercial360 (product and supplier management), Importações360 (international trade operations), and Finanças360 (financial management). The platform aims to be a comprehensive solution for learning and implementing e-commerce practices, enhancing user capabilities through AI-powered assistance for tasks like Amazon listing optimization via competitor review analysis and content generation. The project is deployment-ready, with a robust, modular architecture and optimized performance, with a vision to empower users in the e-commerce domain.

**Recent Major Update (August 2025)**: Successfully completed comprehensive database schema standardization across all platform modules:
- **COM360_** prefixing completed for all commercial360 tables and components
- **HUB_** prefixing completed for all hub-related tables including partners (partners → hub_partners, partner_types → hub_partner_types, etc.), tools, templates, prompts, features
- **TOOL_** prefixing completed for all tools-related tables and components  
- **AGENT_** prefixing completed for all agent-related tables and components (agents → agent_agents, agentPrompts → agent_prompts, etc.)
- **IMP360_** and **FIN360_** naming conventions maintained for respective modules
- All foreign key references, relations, and server services updated to use new naming conventions
- Database migrations handled successfully with data preservation
- All API endpoints and permission systems updated to work with new schema
- Server functionality fully restored with optimized performance

## User Preferences
**Communication Style**: Simple, everyday language (user is non-technical)

## System Architecture
### Frontend Architecture
The frontend is built with React 18, TypeScript, and Vite. Styling is handled by Tailwind CSS and shadcn/ui components. State management uses TanStack Query and React Context, with Wouter for client-side routing. The code adheres to a DRY-compliant modular system, featuring generic services, unified hooks, a component library, and a utility system for data formatting. A strict Container/Presentational pattern is enforced for complex components. UI/UX decisions prioritize a clean layout, consistent color schemes (yellow, emerald), and user-friendly navigation.

**Component Organization (Updated January 2025)**: All components now follow a standardized naming convention with module prefixes:
- **COM360_** - Commercial360 components (box management, products, suppliers, brands)
- **IMP360_** - Importações360 components (international suppliers, import operations)
- **FIN360_** - Finanças360 components (financial management, banking, operations)

This standardization prevents system confusion and improves maintainability across the three main platform modules.

### Backend Architecture
The backend uses Node.js and Express with TypeScript, providing RESTful endpoints and WebSocket support for real-time features. Data is managed with PostgreSQL and Drizzle ORM. AI integration is multi-provider, supporting OpenAI, Anthropic, Google, DeepSeek, and xAI. Security is robust, featuring JWT authentication, role-based permissions, and audit logging. File handling is managed via Multer with validation and S3-compatible storage.

### AI Agents System
The AI system focuses on Amazon listing optimization, including CSV upload from Helium10, competitor review analysis, and generation of optimized titles, bullet points, and descriptions. It tracks token usage and costs and supports multiple AI providers with fallbacks. A key feature is the Amazon Negative Reviews system, which was refactored for robust validation, credit system integration, and database persistence for session management. It supports multiple n8n webhook formats and ensures real-time updates to the frontend.

### Database Schema
Key tables include `agents` (configurations), `agent_prompts` (templates), `agent_usage` (tracking), and `agent_generations` (content storage), alongside supporting tables for users, materials, tools, partners, and suppliers. Session data for AI agent processing is persisted in the `agentProcessingSessions` table.

The `com360_boxes` table has been implemented for packaging management with fields for dimensions (mm), weight (grams), box types, wave types, printing options, and MOQ functionality. All commercial360 module tables now use standardized COM360_ prefix: com360_boxes, com360_brands, com360_products, com360_suppliers, com360_materials, and com360_material_categories.

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