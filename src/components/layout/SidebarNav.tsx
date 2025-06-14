import { Link, NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
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
  ClipboardList,
  FileDigit,
  Ship,
  Building,
  ClipboardCheck,
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Hub de Recursos",
    icon: Library,
    subItems: [
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
    icon: User,
    subItems: [
      { title: "Meus Fornecedores", href: "/minha-area/fornecedores", icon: Folder },
      { title: "Meus Produtos", href: "/minha-area/produtos", icon: Package },
    ],
  },
  {
    title: "Simuladores",
    icon: Calculator,
    subItems: [
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
  { title: "Agentes de IA", href: "/agentes-ia", icon: Bot },
  { title: "Nossos Cursos", href: "/nossos-cursos", icon: School, highlighted: true },
];

export function SidebarNav({ isMobile = false }: { isMobile?: boolean }) {
  const baseClassName = "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground";
  const activeClassName = "bg-accent text-accent-foreground";
  
  const renderLink = (item) => (
    <NavLink
      key={item.href}
      to={item.href}
      className={({ isActive }) =>
        cn(
          baseClassName,
          isActive && activeClassName,
          item.highlighted && "mt-4 bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary !font-semibold shadow-lg shadow-primary/30"
        )
      }
    >
      <item.icon className="mr-2 h-4 w-4" />
      <span>{item.title}</span>
    </NavLink>
  );
  
  return (
    <nav className={cn("flex flex-col gap-1 p-2", isMobile ? "" : "w-full")}>
      <Link to="/" className="flex items-center space-x-2 p-4 pt-2 pb-4">
        <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
        <span className="font-bold">Portal do Aluno</span>
      </Link>
      <Accordion type="multiple" className="w-full" defaultValue={['item-0', 'item-1', 'item-2', 'item-3']}>
        {menuItems.map((item, index) =>
          item.subItems ? (
            <AccordionItem value={`item-${index}`} key={item.title} className="border-b-0">
              <AccordionTrigger className={cn(baseClassName, "justify-between hover:no-underline")}>
                <div className="flex items-center">
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-6 pt-1">
                <div className="flex flex-col gap-1">
                  {item.subItems.map(renderLink)}
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : (
            renderLink(item)
          )
        )}
      </Accordion>
    </nav>
  );
}
