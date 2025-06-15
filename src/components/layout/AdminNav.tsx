
import { Link } from "react-router-dom";
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
import { useAuth } from "@/hooks/useAuth";

export function AdminNav() {
  const { user } = useAuth();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-red-500/10">
          <Avatar className="h-9 w-9 border-2 border-red-500/30">
            <AvatarImage src="/placeholder.svg" alt="Avatar" />
            <AvatarFallback className="bg-red-500/20 text-red-400">GV</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-slate-800 border-red-500/20" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none text-slate-100">{user.name}</p>
            <p className="text-xs leading-none text-slate-400">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-red-500/20" />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 focus:text-red-400 focus:bg-red-500/10">
            <Link to="/perfil">
              <User className="mr-2 h-4 w-4" />
              <span>Meu Perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 focus:text-red-400 focus:bg-red-500/10">
            <Link to="/configuracoes">
              <Settings className="mr-2 h-4 w-4" />
              <span>Configurações</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 focus:text-red-400 focus:bg-red-500/10">
            <Link to="/suporte">
             <Headset className="mr-2 h-4 w-4" />
              <span>Suporte</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-red-500/20" />
          <DropdownMenuItem asChild className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 focus:text-red-400 focus:bg-red-500/10">
            <Link to="/">
              <Home className="mr-2 h-4 w-4" />
              <span>Área do Aluno</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-red-500/20" />
        <DropdownMenuItem className="text-slate-300 hover:text-red-400 hover:bg-red-500/10 focus:text-red-400 focus:bg-red-500/10">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
