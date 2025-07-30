/**
 * MAIN EXPORT: SidebarRefactored
 * Refactored from 761-line monolithic sidebar.tsx to modular architecture
 * Follows Container/Presentational pattern established in replit.md
 */

// Export all sidebar components from their modular locations
export { SidebarProvider } from './components/SidebarProvider';
export { Sidebar } from './components/SidebarCore';
export { SidebarTrigger } from './components/SidebarTrigger';
export { 
  SidebarRail, 
  SidebarInset, 
  SidebarInput, 
  SidebarHeader, 
  SidebarFooter, 
  SidebarSeparator, 
  SidebarContent 
} from './components/SidebarNavigation';
export {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton
} from './components/SidebarMenus';

// Export hooks
export { useSidebar } from './hooks/useSidebar';
export { useIsMobile } from './hooks/useMobile';

// Export types for external usage
export type * from './types';