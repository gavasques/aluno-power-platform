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
      console.error('Error fetching user features:', error);
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
      console.error('Error checking access:', error);
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