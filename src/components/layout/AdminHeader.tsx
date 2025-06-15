
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdminNav } from "@/components/layout/AdminNav";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  MessageSquare,
  Settings,
  Database,
  Shield
} from "lucide-react";

const adminMenuItems = [
  {
    title: "Cadastros",
    items: [
      { title: "Categorias", href: "/admin/cadastros/categorias", icon: Database },
      { title: "Prompts IA", href: "/admin/cadastros/prompts-ia", icon: Database },
      { title: "Templates", href: "/admin/cadastros/templates", icon: Database },
      { title: "Materiais", href: "/admin/cadastros/materiais", icon: Database },
      { title: "Tipos de Fornecedor", href: "/admin/cadastros/tipos-fornecedor", icon: Database },
    ],
  },
  {
    title: "Gestão de Conteúdo",
    items: [
      { title: "Parceiros", href: "/admin/conteudo/parceiros", icon: Users },
      { title: "Fornecedores", href: "/admin/conteudo/fornecedores", icon: Users },
      { title: "Ferramentas", href: "/admin/conteudo/ferramentas", icon: Settings },
      { title: "Templates", href: "/admin/conteudo/templates", icon: FileText },
      { title: "Materiais", href: "/admin/conteudo/materiais", icon: FileText },
      { title: "Selos", href: "/admin/conteudo/selos", icon: Shield },
    ],
  },
  {
    title: "Configurações",
    items: [
      { title: "Plataforma", href: "/admin/configuracoes/plataforma", icon: Settings },
      { title: "Créditos IA", href: "/admin/configuracoes/creditos-ia", icon: Settings },
      { title: "Templates de Resposta", href: "/admin/configuracoes/templates-resposta", icon: FileText },
      { title: "Feed de Notícias", href: "/admin/configuracoes/feed-noticias", icon: FileText },
    ],
  },
];

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between w-full px-4 sm:px-6">
        <div className="flex items-center space-x-6">
          <Link to="/admin" className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <span className="font-bold">Painel Admin</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/admin" className={navigationMenuTriggerStyle()}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </NavigationMenuItem>
              {adminMenuItems.map((section) => (
                <NavigationMenuItem key={section.title}>
                  <NavigationMenuTrigger>
                    {section.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                      {section.items.map((item) => (
                        <NavigationMenuLink key={item.href} asChild>
                          <Link
                            to={item.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                            )}
                          >
                            <div className="flex items-center space-x-2">
                              <item.icon className="h-4 w-4" />
                              <div className="text-sm font-medium leading-none">
                                {item.title}
                              </div>
                            </div>
                          </Link>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              ))}
              <NavigationMenuItem>
                <Link to="/admin/usuarios" className={navigationMenuTriggerStyle()}>
                  <Users className="mr-2 h-4 w-4" />
                  Usuários
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/admin/suporte" className={navigationMenuTriggerStyle()}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Suporte
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <AdminNav />
        </div>
      </div>
    </header>
  );
}
