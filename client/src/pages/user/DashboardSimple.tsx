import React from 'react';
import UnifiedDashboard from '@/components/dashboard/UnifiedDashboard';



const DashboardSimple: React.FC = () => {
  return (
    <UnifiedDashboard 
      variant="simple" 
      showAdvancedFeatures={false} 
      showUserStats={false} 
      showQuickActions={true}
    />
  );
};

export default DashboardSimple;