import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Component to handle authenticated preloading
export const AuthenticatedPreloader = () => {
  const { user } = useAuth();

  useEffect(() => {
    // Simple preload logic after authentication
    if (user) {
      // Preload key routes when user is authenticated
      import('../pages/user/Dashboard');
      import('../pages/Agent_Agents');
      import('../pages/Hub');
      import('../pages/MyArea');
    }
  }, [user]);

  // This component doesn't render anything
  return null;
};