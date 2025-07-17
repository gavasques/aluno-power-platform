import { useMemo } from "react";

/**
 * Hook to extract product ID from URL
 * Single Responsibility: Parse product ID from current URL path
 */
export function useUrlProductId(): string {
  return useMemo(() => {
    const pathSegments = window.location.pathname.split('/');
    return pathSegments[3] || '';
  }, []);
}