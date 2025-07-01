
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserNav } from "@/components/layout/UserNav";
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
  Library,
  Users,
  Truck,
  Wrench,
  FileText,
  BookCopy,
  BrainCircuit,
  User,
  Folder,
  Package,
  Calculator,
  Bot,
  School,
  FileDigit,
  Code2,
  Ship,
  Building,
  ClipboardCheck,
  Youtube,
  Star,
  Tag,
} from "lucide-react";

const menuItems = [
  {
    title: "Hub de Recursos",
    items: [
      { title: "Agentes IA", href: "/agents", icon: Bot },
      { title: "Vídeos", href: "/videos", icon: Youtube },
      { title: "Amazon Reviews", href: "/hub/amazon-reviews", icon: Star },
      { title: "Relatório de Keywords", href: "/hub/relatorio-keywords", icon: FileDigit },
      { title: "Detalhes do Produto", href: "/hub/produto-detalhes", icon: Package },
      { title: "Consulta de CNPJ", href: "/hub/consulta-cnpj", icon: Building },
      { title: "Amazon Keyword Suggestions", href: "/hub/keyword-suggestions", icon: Tag },
      { title: "Parceiros", href: "/hub/parceiros", icon: Users },
      { title: "Fornecedores", href: "/hub/fornecedores", icon: Truck },
      { title: "Ferramentas", href: "/hub/ferramentas", icon: Wrench },
      { title: "Templates", href: "/hub/templates", icon: FileText },
      { title: "Materiais", href: "/hub/materiais", icon: BookCopy },
      { title: "Prompts IA", href: "/hub/prompts-ia", icon: BrainCircuit },
    ],
  },
  {
    title: "Minha Área",
    items: [
      { title: "Meus Fornecedores", href: "/minha-area/fornecedores", icon: Folder },
      { title: "Meus Produtos", href: "/minha-area/produtos", icon: Package },
    ],
  },
  {
    title: "Simuladores",
    items: [
      {
        title: "Simples Nacional",
        href: "/simuladores/simples-nacional",
        icon: FileDigit,
      },
      {
        title: "Importação Simplificada",
        href: "/simuladores/importacao-simplificada",
        icon: Ship,
      },
      {
        title: "Importação Formal",
        href: "/simuladores/importacao-formal",
        icon: Building,
      },
      {
        title: "Viabilidade de Produto",
        href: "/simuladores/viabilidade-de-produto",
        icon: ClipboardCheck,
      },
    ],
  },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="flex h-16 items-center justify-between w-full px-4 sm:px-6">
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/lovable-uploads/65475935-e163-4901-b637-8076c0c36804.png"
              alt="Guilherme Vasques Logo"
              className="h-8 w-auto object-contain"
              style={{ maxWidth: "180px" }}
            />
          </Link>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className={navigationMenuTriggerStyle()}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </NavigationMenuItem>
              
              {menuItems.map((section) => (
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
                <a 
                  href="https://produtos.guilhermevasques.club/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-semibold"
                  )}
                >
                  <School className="mr-2 h-4 w-4" />
                  Nossos Cursos
                </a>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
