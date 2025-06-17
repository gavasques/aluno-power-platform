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
export { PartnerService } from '@/lib/services/partner/PartnerService';

// Partner Hooks (Centralized Query Management)
export {
  usePartners,
  usePartner,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  usePartnerContacts,
  useAddPartnerContact,
  usePartnerFiles,
  useUploadPartnerFile,
  usePartnerReviews,
  useAddPartnerReview,
  partnerKeys
} from '@/lib/hooks/partner/usePartner';

// Partner UI Components (Following Single Responsibility Principle)
export { PartnerCard } from '@/components/partner/ui/PartnerCard';
export { PartnerList } from '@/components/partner/ui/PartnerList';

// Dashboard Components (Modular Widget Architecture)
export { BaseWidget } from '@/components/dashboard/widgets/BaseWidget';
export { PartnerStatsWidget } from '@/components/dashboard/widgets/PartnerStatsWidget';

// Refactored Pages
export { DashboardRefactored } from '@/pages/dashboard/DashboardRefactored';
export { PartnerManagementRefactored } from '@/pages/partner/PartnerManagementRefactored';

/**
 * Migration Guide:
 * 
 * 1. Replace existing partner context usage with usePartners hook
 * 2. Replace PartnerDetailSimple with modular PartnerCard components
 * 3. Use PartnerList for consistent partner display across admin and user views
 * 4. Implement BaseWidget for new dashboard widgets
 * 5. Use PartnerService for all partner-related API operations
 * 
 * Benefits:
 * - Improved type safety and error handling
 * - Better separation of concerns
 * - Enhanced testability with mocked services
 * - Consistent caching strategy with React Query
 * - Reusable components across different contexts
 */