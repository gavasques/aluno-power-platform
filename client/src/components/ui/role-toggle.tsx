import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function RoleToggle() {
  const { user, isAdmin, toggleRole } = useAuth();

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
        {isAdmin ? (
          <>
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </>
        ) : (
          <>
            <User className="h-3 w-3 mr-1" />
            Usuário
          </>
        )}
      </Badge>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleRole}
        className="text-xs h-7"
      >
        Alternar para {isAdmin ? 'Usuário' : 'Admin'}
      </Button>
    </div>
  );
}