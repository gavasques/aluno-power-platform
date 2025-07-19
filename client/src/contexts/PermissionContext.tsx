import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { apiRequest } from '@/lib/queryClient';

interface PermissionContextType {
  features: string[];
  userFeatures: string[];
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
    
    try {
      const response = await apiRequest(`/api/permissions/check/${featureCode}`, {
        method: 'GET',
      }) as { hasAccess: boolean };
      return response.hasAccess || false;
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
        userFeatures: features,
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