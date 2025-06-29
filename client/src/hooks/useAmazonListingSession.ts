// Custom hook for Amazon Listing Session Management
import { useState, useEffect } from 'react';
import { amazonListingService } from '@/services/amazonListingService';
import type { AmazonListingSession, AmazonListingFormData } from '@/types/amazon-listing';

interface UseAmazonListingSessionReturn {
  session: AmazonListingSession | null;
  isLoading: boolean;
  error: string | null;
  updateSessionData: (formData: AmazonListingFormData) => Promise<void>;
}

export function useAmazonListingSession(): UseAmazonListingSessionReturn {
  const [session, setSession] = useState<AmazonListingSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeSession();
  }, []);

  const initializeSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Production: get from auth context
      const userId = "user-1";
      
      const newSession = await amazonListingService.createSession(userId);
      setSession(newSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create session');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionData = async (formData: AmazonListingFormData) => {
    if (!session) return;

    try {
      await amazonListingService.updateSession(session.id, formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session');
    }
  };

  return {
    session,
    isLoading,
    error,
    updateSessionData
  };
}