
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
import { User, Settings, Headset, LogOut, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function AdminNav() {
  const { user, logout } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-primary/10">
          <Avatar className="h-9 w-9 border-2 border-primary/30">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback className="bg-primary/20 text-primary">GV</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white border-border shadow-lg" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-foreground">{user?.name || 'Admin'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || 'admin@example.com'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="text-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10">
            <Link to="/perfil">
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10">
            <Link to="/configuracoes">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10">
            <Link to="/suporte">
             <Headset className="mr-2 h-4 w-4" />
              <span>Suporte</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border" />
          <DropdownMenuItem asChild className="text-foreground hover:text-primary hover:bg-primary/10 focus:text-primary focus:bg-primary/10">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              <span>Área do Aluno</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem 
          className="text-foreground hover:text-destructive hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          onClick={() => {
            logout();
            window.location.href = '/';
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
