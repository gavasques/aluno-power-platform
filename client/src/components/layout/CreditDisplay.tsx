import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";
import { useUserCreditBalance } from "@/hooks/useUserCredits";
import { useAuth } from "@/contexts/AuthContext";

export function CreditDisplay() {
  const { user, isAuthenticated } = useAuth();
  const { balance, isLoading } = useUserCreditBalance();

  // Only show credit display if user is authenticated
  if (!isAuthenticated || !user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge 
        variant="outline" 
        className="flex items-center space-x-1.5 px-3 py-1 text-sm font-medium bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
      >
        <Coins className="h-4 w-4" />
        <span>{balance || 0}</span>
      </Badge>
    </div>
  );
}