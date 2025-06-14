
import { ThemeToggle } from "@/components/ThemeToggle"
import { UserNav } from "@/components/layout/UserNav"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { 
  ChevronDown, 
  Search, 
  Home, 
  Package, 
  Users, 
  BookOpen, 
  Wrench, 
  FileText, 
  Bot,
  Calculator,
  GraduationCap,
  Settings,
  User,
  Briefcase,
  HelpCircle
} from "lucide-react"
import { useNavigate } from "react-router-dom"

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-6">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            className="text-lg font-bold text-primary"
            onClick={() => navigate("/")}
          >
            Portal do Aluno
          </Button>
        </div>

        {/* Navigation Menus */}
        <nav className="flex items-center space-x-2 ml-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-1"
          >
            <Home className="h-4 w-4" />
            <span>Dashboard</span>
          </Button>

          {/* Hub de Recursos */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1">
                <Package className="h-4 w-4" />
                <span>Hub de Recursos</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => navigate("/hub/prompts-ia")}>
                <Bot className="mr-2 h-4 w-4" />
                <span>Prompts IA</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/hub/materiais")}>
                <BookOpen className="mr-2 h-4 w-4" />
                <span>Materiais</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/hub/templates")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Templates</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/hub/ferramentas")}>
                <Wrench className="mr-2 h-4 w-4" />
                <span>Ferramentas</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/hub/fornecedores")}>
                <Users className="mr-2 h-4 w-4" />
                <span>Fornecedores</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/hub/parceiros")}>
                <Briefcase className="mr-2 h-4 w-4" />
                <span>Parceiros</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Minha Área */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Minha Área</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => navigate("/minha-area/fornecedores")}>
                <Users className="mr-2 h-4 w-4" />
                <span>Meus Fornecedores</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/minha-area/produtos")}>
                <Package className="mr-2 h-4 w-4" />
                <span>Meus Produtos</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Simuladores */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-1">
                <Calculator className="h-4 w-4" />
                <span>Simuladores</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem onClick={() => navigate("/simuladores/simples-nacional")}>
                <Calculator className="mr-2 h-4 w-4" />
                <span>Simples Nacional</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/simuladores/importacao-simplificada")}>
                <Calculator className="mr-2 h-4 w-4" />
                <span>Importação Simplificada</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/simuladores/importacao-formal")}>
                <Calculator className="mr-2 h-4 w-4" />
                <span>Importação Formal</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/simuladores/viabilidade-de-produto")}>
                <Calculator className="mr-2 h-4 w-4" />
                <span>Viabilidade de Produto</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Outros Links */}
          <Button 
            variant="ghost" 
            onClick={() => navigate("/agentes-ia")}
            className="flex items-center space-x-1"
          >
            <Bot className="h-4 w-4" />
            <span>Agentes de IA</span>
          </Button>

          <Button 
            variant="ghost" 
            onClick={() => navigate("/cursos")}
            className="flex items-center space-x-1"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Cursos</span>
          </Button>
        </nav>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate("/configuracoes")}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/cadastros")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Cadastros</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/suporte")}>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Suporte</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/perfil")}>
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  )
}
