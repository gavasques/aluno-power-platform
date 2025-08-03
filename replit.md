# Aluno Power Platform - AI Agents System

## Overview
This project is an educational e-commerce platform specializing in Amazon FBA and e-commerce training. Its core purpose is to provide students with essential tools, resources, and an integrated AI agents system to master e-commerce strategies. The platform aims to be a comprehensive solution for learning and implementing e-commerce practices, enhancing user capabilities through AI-powered assistance for tasks like Amazon listing optimization via competitor review analysis and content generation. The project is deployment-ready, with a robust, modular architecture and optimized performance.

## User Preferences
**Communication Style**: Simple, everyday language (user is non-technical)

## Recent Changes (August 3, 2025)
- **Amazon Negative Reviews System Completely Refactored**: Sistema totalmente reconstruído e funcional
  - **Backend Refactoring**: Endpoints reorganizados com `/generate` (iniciar) e `/webhook-callback` (resultado)
  - **Robust Validations**: Sistema suporta múltiplos formatos n8n (array e objeto direto)
  - **Authentication Enhanced**: Validação de usuário e sessão com verificação de propriedade
  - **Credit System Integration**: Dedução automática de créditos quando callback é processado  
  - **Comprehensive Logging**: Logs detalhados para debug incluindo body parsing e session tracking
  - **Frontend Improvements**: TypeScript errors fixed, download functionality added, better UI
  - **Session Management**: Sistema de sessões em memória com timeout e error handling
  - **Multiple Format Support**: Suporte para formato array n8n `[{"retorno": "..."}]` e objeto direto
  - **Complete Testing**: Sistema testado end-to-end com webhook callback funcionando 100%
  - **Documentation**: Guia completo de configuração com todos os formatos suportados

## Previous Changes (August 2, 2025)
- **Header Navigation Reorganization**: Moved "Nossos Cursos" and "Ir para o Curso" buttons from header to dashboard
  - **Header Update**: Removed both buttons from main navigation menu for cleaner header layout
  - **Dashboard Integration**: Added buttons to "Conecte-se Conosco" section with proper styling
  - **Layout Optimization**: Changed grid from 4 columns to 3 columns for better button arrangement
  - **Visual Consistency**: Maintained color scheme - yellow for "Nossos Cursos", emerald for "Ir para o Curso"
  - **Theme Toggle Removal**: Removed dark/light theme toggle icon from header as requested
  - **User Navigation Update**: Changed user avatar to simple "Eu" text button for cleaner interface
- **CNPJ Field Addition**: Added CNPJ field to company registration system
  - **Database Update**: Added cnpj column to user_companies table
  - **Form Integration**: CNPJ field added to CompanyForm with validation
  - **Display Enhancement**: CNPJ shown in company cards on MinhasEmpresas page
  - **Label Generator**: CNPJ automatically populated and displayed in generated labels
  - **PDF Export**: CNPJ included in label PDF output with proper formatting
  - **CNPJ Fixed**: Resolved data persistence issue - CNPJ now saves correctly to database through API
  - **Logo Upload System Complete**: Fully resolved PNG logo upload and display functionality
    - **Missing Route Fixed**: Added /objects/* route to serve uploaded images from object storage
    - **URL Normalization**: Implemented automatic conversion of Google Storage URLs to /objects/ paths
    - **TypeScript Errors Fixed**: Resolved type compatibility issues in company update function
    - **Database Update**: Updated existing logo URLs to use normalized paths for proper display
    - **Enhanced Error Handling**: Added SVG placeholder fallback for failed image loads
    - **Logo Display Fixed**: Company logos now display correctly instead of showing black squares
- **Minhas Empresas System Implementation**: Complete "My Companies" registration system
  - **Full CRUD Operations**: Create, read, update, delete companies with database integration
  - **Advanced Form Features**: Automatic uppercase conversion (except notes), organized field layout
  - **UI/UX Improvements**: Fixed button positioning, scroll optimization, sticky action buttons
  - **API Integration**: Protected routes with authentication, complete validation system
  - **Database Schema**: user_companies table with comprehensive company information fields including CNPJ
  - **Frontend Integration**: Added to Importações menu, modern interface with search and filters
  - **Real-world Data**: Successfully tested with BKZA company registration
- **Packing List & Commercial Invoice System Enhancement**: Major improvements to import documentation system
  - **Phone Fields Added**: Phone fields added to both "Sold To/Ship To" and "Ordered By" sections with bilingual labels
  - **PDF Field Optimization**: Implemented smart field hiding - empty/unfilled fields are automatically excluded from PDF output
  - **PO Field Updates**: Changed "Número PO" to "PO (Processo)" with mandatory validation, made "Número PL" optional
  - **Bilingual Interface**: Complete bilingual system with Portuguese form labels and English PDF labels for international compliance
  - **Ordered By Separation**: Full separation of "Ordered By" from "Sold To/Ship To" with independent data fields and PDF sections
  - **Enhanced PDF Functions**: Refactored PDF generation with modular rendering functions for cleaner, dynamic field display
  - **Database Schema Update**: Added orderedByData field to schema with backward compatibility for existing documents
- **Amazon Customer Service Form Enhancement**: Complete restructuring of form fields for better data collection
  - **New Required Fields**: Added "Nome do Comprador" and "Produto Comprado" as separate input fields
  - **Field Reorganization**: "Email do Cliente" renamed to "Conteúdo do Email", "Informações do Usuário" updated to "Informações do Usuário" (análise)
  - **Backend Integration**: Updated webhook payload with new structured data: customer_name, product_purchased, email_content, user_analysis
  - **Webhook URL Update**: Migrated from n8n.guivasques.app to webhook.guivasques.app for improved reliability
  - **Form Validation**: All 4 fields now required with comprehensive validation and error handling
  - **Example Data**: Updated example button to populate all new fields with realistic test data
  - Enhanced download functionality with timestamp naming: customer_service_YYYYMMDD_HHMMSS.txt
  - Maintained copy and download features for generated email responses
  - Improved logging to track webhook-based generations
  - Fixed agent_usage table insertion with proper UUID and field mapping
- **Bullet Points Download Feature**: Added TXT file download functionality
  - Added download button with timestamp naming: bullet_points_YYYYMMDD_HHMMSS.txt
  - Users can now save generated bullet points locally for external use
  - Clean file export with proper UTF-8 encoding for international characters
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