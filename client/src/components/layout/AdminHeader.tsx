
import { Link } from "react-router-dom";
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
  Bot,
  Shield
} from "lucide-react";

const adminMenuItems = [
  {
    title: "Cadastros",
    items: [
      { title: "Departamentos", href: "/admin/cadastros/departamentos", icon: Database },
      { title: "Tipos de Templates", href: "/admin/cadastros/tipos-templates", icon: FileText },
      { title: "Tipos de Fornecedor", href: "/admin/cadastros/tipos-fornecedor", icon: Database },
      { title: "Tipos de Prompts IA", href: "/admin/cadastros/tipos-prompts-ia", icon: FileText },
      { title: "Tipos de Materiais", href: "/admin/cadastros/tipos-materiais", icon: FileText },
      { title: "Tipos de Ferramentas", href: "/admin/cadastros/tipos-ferramentas", icon: Settings },
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
      { title: "Prompts de IA", href: "/admin/conteudo/prompts-ia", icon: Bot },
      { title: "Central de Notícias", href: "/admin/conteudo/noticias", icon: FileText },
      { title: "Central de Novidades", href: "/admin/conteudo/novidades", icon: FileText },
      { title: "Configurações de Webhook", href: "/admin/conteudo/webhooks", icon: Settings },
    ],
  },
  {
    title: "Configurações",
    items: [
      { title: "Plataforma", href: "/admin/configuracoes/plataforma", icon: Settings },
      { title: "Créditos IA", href: "/admin/configuracoes/creditos-ia", icon: Settings },
      { title: "Templates de Resposta", href: "/admin/configuracoes/templates-resposta", icon: FileText },
    ],
  },
];

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <div className="flex h-16 items-center justify-between w-full px-4 sm:px-6">
        <div className="flex items-center space-x-6">
          <Link to="/admin" className="flex items-center space-x-2 group">
            <Shield className="h-8 w-8 text-primary group-hover:text-primary/80 transition-colors" />
            <span className="font-bold text-foreground group-hover:text-primary transition-colors">Painel Admin</span>
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link 
                  to="/admin" 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  )}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </NavigationMenuItem>
              {adminMenuItems.map((section) => (
                <NavigationMenuItem key={section.title}>
                  <NavigationMenuTrigger className="bg-transparent text-foreground hover:text-primary hover:bg-primary/10 data-[state=open]:bg-primary/10 data-[state=open]:text-primary transition-colors">
                    {section.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px] bg-white border border-border shadow-xl">
                      {section.items.map((item) => (
                        <NavigationMenuLink key={item.href} asChild>
                          <Link
                            to={item.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-primary/10 hover:text-primary focus:bg-primary/10 focus:text-primary text-foreground"
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
                <Link 
                  to="/admin/usuarios" 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  )}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Usuários
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link 
                  to="/admin/suporte" 
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-transparent text-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  )}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Suporte
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center space-x-4">
          <AdminNav />
        </div>
      </div>
    </header>
  );
}
