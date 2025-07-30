import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/UserContext";

export function RoleToggle() {
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === 'admin';

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
    </div>
  );
}