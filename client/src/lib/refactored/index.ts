/**
 * Refactored Components and Services Export Index
 * 
 * This module exports all refactored components, services, and hooks
 * following SOLID principles and best practices for maintainability,
 * testability, and reusability.
 */

// Base Services (Following Single Responsibility Principle)
export { ApiService } from '@/lib/services/base/ApiService';
export { CrudOperations, SearchableOperations, FilterableOperations, CrudService } from '@/lib/services/base/CrudService';

// Partner Services (Following Dependency Inversion Principle)
// Note: Partner services and hooks removed - not currently implemented

// Partner UI Components (Following Single Responsibility Principle)
// Note: Partner UI components removed - not currently implemented

// Dashboard Components (Modular Widget Architecture)
export { BaseWidget } from '@/components/dashboard/widgets/BaseWidget';
export { PartnerStatsWidget } from '@/components/dashboard/widgets/PartnerStatsWidget';

// Refactored Pages
// Note: DashboardRefactored and PartnerManagementRefactored components removed - 
// using existing AdminDashboard and UserDashboard components instead

/**
 * Current Status:
 * 
 * Only the dashboard widgets are currently implemented and functional:
 * - BaseWidget: Basic widget component structure
 * - PartnerStatsWidget: Partner statistics display widget
 * 
 * Other refactored components mentioned in comments are placeholder exports
 * and should be implemented when needed.
 */