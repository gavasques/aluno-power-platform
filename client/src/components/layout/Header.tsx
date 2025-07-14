
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
  Archive,
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

const menuItems: any[] = [];

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="flex h-12 items-center justify-between w-full px-2 sm:px-4">
        <div className="flex items-center space-x-3">
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/lovable-uploads/65475935-e163-4901-b637-8076c0c36804.png"
              alt="Guilherme Vasques Logo"
              className="h-6 w-auto object-contain"
              style={{ maxWidth: "150px" }}
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
              
              <NavigationMenuItem>
                <Link to="/agentes" className={navigationMenuTriggerStyle()}>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Agentes
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/ferramentas" className={navigationMenuTriggerStyle()}>
                  <Wrench className="mr-2 h-4 w-4" />
                  Ferramentas
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/hub" className={navigationMenuTriggerStyle()}>
                  <Archive className="mr-2 h-4 w-4" />
                  HUB
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/minha-area" className={navigationMenuTriggerStyle()}>
                  <User className="mr-2 h-4 w-4" />
                  Minha Área
                </Link>
              </NavigationMenuItem>
              
              <NavigationMenuItem>
                <Link to="/simuladores" className={navigationMenuTriggerStyle()}>
                  <Calculator className="mr-2 h-4 w-4" />
                  Simuladores
                </Link>
              </NavigationMenuItem>
              
              {menuItems.map((section) => (
                <NavigationMenuItem key={section.title}>
                  <NavigationMenuTrigger>
                    {section.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid w-[350px] gap-2 p-3 md:w-[400px] md:grid-cols-2 lg:w-[500px]">
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
