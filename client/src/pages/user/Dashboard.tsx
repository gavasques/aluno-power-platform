import React from 'react';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';

const UserDashboard: React.FC = () => {
  return (
    <UnifiedDashboard 
      variant="full" 
      showAdvancedFeatures={true} 
      showUserStats={true} 
      showQuickActions={false}
    />
  );
};

export default UserDashboard;