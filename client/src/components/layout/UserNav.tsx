
import { Link } from "wouter";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut, Home, Shield } from "lucide-react";
import { useAuth } from "@/contexts/UserContext";
import { logger } from "@/utils/logger";

export function UserNav() {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 px-4 font-medium bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-md">
          Eu
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 bg-white text-neutral-900 border border-neutral-200 shadow-lg"
        align="end"
        style={{ boxShadow: "0 5px 35px 0 rgba(0,0,0,0.09)" }}
      >
        <DropdownMenuLabel className="font-semibold px-4 pt-3 pb-2">
          <div className="flex flex-col">
            <span className="text-base font-semibold leading-none">{user?.name}</span>
            <span className="text-xs leading-none text-neutral-500">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/minha-area/perfil" className="flex items-center gap-3 px-4 py-2 hover:bg-neutral-100 rounded transition">
              <User className="h-5 w-5 text-neutral-500" />
              <span>Meu Perfil</span>
            </Link>
          </DropdownMenuItem>

          {isAdmin ? (
            <DropdownMenuItem asChild>
              <Link to="/admin" className="flex items-center gap-3 px-4 py-2 mt-2 hover:bg-neutral-100 rounded transition relative">
                <Shield className="h-5 w-5 text-neutral-500" />
                <span>Administrador</span>
                {isAdmin && (
                  <span className="ml-2 text-xs font-bold text-white bg-neutral-900 rounded px-2 py-0.5 absolute right-4 top-1/2 -translate-y-1/2">
                    ADMIN
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem asChild>
              <Link to="/" className="flex items-center gap-3 px-4 py-2 mt-2 hover:bg-neutral-100 rounded transition">
                <Home className="h-5 w-5 text-neutral-500" />
                <span>Área do Aluno</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="flex items-center gap-3 px-4 py-2 text-destructive hover:bg-neutral-100 rounded transition cursor-pointer"
          onClick={() => {
            logger.debug('🔥 UserNav: Logout button clicked');
            logger.debug('🔥 UserNav: Current user before logout:', user);
            logout();
            logger.debug('🔥 UserNav: Logout function called, redirecting to /login');
          }}
        >
          <LogOut className="h-5 w-5" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
