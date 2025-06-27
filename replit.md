# Ferramentas Hub - System Architecture Guide

## Overview

This is a full-stack web application built as a "Ferramentas Hub" (Tools Hub) - a comprehensive platform for managing business tools, suppliers, partners, materials, templates, and AI prompts. The system follows SOLID principles and modern web development best practices, providing both user and admin interfaces for content management and resource discovery.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: React Context API with Tanstack Query for server state
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API**: RESTful endpoints with WebSocket support for real-time updates
- **File Handling**: Direct file uploads and external URL support

### Key Components

#### Core Entities
1. **Tools**: Software tools with ratings, reviews, and feature details
2. **Partners**: Service providers with contact information and materials
3. **Suppliers**: Product suppliers with commercial terms and file attachments
4. **Materials**: Educational content (e-books, templates, videos, spreadsheets)
5. **Templates**: Reusable communication templates
6. **AI Prompts**: Multi-step AI prompts with categories and examples
7. **AI Agents**: Intelligent automation agents with execution capabilities
8. **Products**: E-commerce products with multi-channel pricing
9. **News & Updates**: Content management system for announcements

#### Authentication & Authorization
- Role-based access control (admin, support, user)
- Mock authentication system for development
- Admin-only sections for content management

#### UI Components (Refactored with SOLID Principles)
- **Single Responsibility**: Each component has a focused purpose
- **Open/Closed**: Components are extensible through props
- **Interface Segregation**: Separate interfaces for different component needs
- **Dependency Inversion**: Components depend on abstractions, not concrete implementations

## Data Flow

### Client-Server Communication
1. **API Requests**: Centralized through `apiRequest` utility with error handling
2. **Real-time Updates**: WebSocket connection for live notifications
3. **Query Management**: Tanstack Query for caching and synchronization
4. **Context Providers**: Dedicated contexts for each entity type

### Database Schema
- **Users**: Authentication and role management
- **Categories**: Hierarchical categorization system
- **Content Tables**: Tools, partners, suppliers, materials, etc.
- **Relationship Tables**: Reviews, files, contacts, and associations
- **Media Tables**: YouTube videos, images, and file attachments

## External Dependencies

### Core Dependencies
- **UI**: @radix-ui components, shadcn/ui, tailwindcss
- **Data**: @tanstack/react-query, drizzle-orm, @neondatabase/serverless
- **Forms**: @hookform/resolvers, react-hook-form
- **Utilities**: clsx, date-fns, lucide-react icons

### Development Tools
- **Build**: Vite, TypeScript, ESBuild
- **Database**: Drizzle Kit for migrations
- **Development**: tsx for TypeScript execution

### External Services
- **YouTube API**: Video synchronization and channel management
- **WebSocket**: Real-time notifications
- **File Storage**: Direct file uploads and external URL support

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR
- **Database**: Neon serverless PostgreSQL
- **Environment Variables**: DATABASE_URL, YOUTUBE_API_KEY

### Production Build
- **Frontend**: Static build output to `dist/public`
- **Backend**: ESBuild bundle to `dist/index.js`
- **Database**: Drizzle migrations for schema updates
- **Compression**: Gzip compression enabled

### Performance Optimizations
- **Query Caching**: 5-minute stale time for API queries
- **Component Optimization**: Memoized components and lazy loading
- **Database Indexing**: Optimized queries with proper indexes
- **WebSocket Efficiency**: Connection pooling and message batching

## Changelog

- June 27, 2025. Initial setup
- June 27, 2025. Amazon Agent refactoring following clean code principles
- June 27, 2025. Complete AI Agents system integration with admin structure
- June 27, 2025. Administrative agents management page with clean code architecture

## User Preferences

Preferred communication style: Simple, everyday language.

Code quality priorities:
1. Readability (legibilidade)
2. Maintainability (manutenibilidade) 
3. Reusability (reusabilidade)
4. Testability (testabilidade)
5. SOLID principles
6. Single Responsibility
7. Remove obsolete/unused code
8. Eliminate code duplication
9. DRY (Don't Repeat Yourself)
10. KISS (Keep It Simple, Stupid)
11. Modularization
12. Standardization