import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '@/lib/queryClient';

interface PermissionContextType {
  features: string[];
  hasAccess: (featureCode: string) => boolean;
  checkAccess: (featureCode: string) => Promise<boolean>;
  isLoading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export function PermissionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [features, setFeatures] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cache for permission checks to reduce API calls
  const [permissionCache, setPermissionCache] = useState<Map<string, { result: boolean; timestamp: number }>>(new Map());
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  const fetchUserFeatures = async () => {
    if (!user) {
      setFeatures([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiRequest('/api/permissions/user-features', {
        method: 'GET',
      }) as { features: string[] };
      setFeatures(response.features || []);
      
      // Clear cache when features are refreshed
      setPermissionCache(new Map());
    } catch (error) {
      // Silently handle permission errors to prevent blocking dashboard
      console.warn('Could not load user features, continuing with empty permissions');
      setFeatures([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserFeatures();
  }, [user]);

  const hasAccess = (featureCode: string): boolean => {
    return features.includes(featureCode);
  };

  const checkAccess = async (featureCode: string): Promise<boolean> => {
    if (!user) return false;
    
    // Check cache first
    const cached = permissionCache.get(featureCode);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.result;
    }
    
    try {
      const response = await apiRequest(`/api/permissions/check/${featureCode}`, {
        method: 'GET',
      }) as { hasAccess: boolean };
      
      const result = response.hasAccess || false;
      
      // Cache the result
      setPermissionCache(prev => new Map(prev).set(featureCode, {
        result,
        timestamp: Date.now()
      }));
      
      return result;
    } catch (error) {
      // Silently handle permission check errors to prevent blocking features
      console.warn(`Could not check access for feature: ${featureCode}, defaulting to false`);
      return false;
    }
  };

  const refreshPermissions = async () => {
    setIsLoading(true);
    await fetchUserFeatures();
  };

  return (
    <PermissionContext.Provider
      value={{
        features,
        hasAccess,
        checkAccess,
        isLoading,
        refreshPermissions,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}