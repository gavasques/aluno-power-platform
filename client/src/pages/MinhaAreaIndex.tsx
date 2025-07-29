import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, X, Folder, Package, Building, Star, ArrowRight, User, FileSpreadsheet, Zap, Ship, Calculator } from "lucide-react";

interface MinhaAreaItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  isNew?: boolean;
}

const minhaAreaItems: MinhaAreaItem[] = [
  {
    id: "fornecedores",
    title: "Meus Fornecedores",
    description: "Gerencie seus fornecedores, contatos, marcas e conversas em um só lugar",
    href: "/minha-area/fornecedores",
    icon: Folder,
    category: "Gestão",
  },
  {
    id: "produtos-pro", 
    title: "Produtos Pro",
    description: "Sistema avançado de multi-canais com cálculos Excel integrados e 18+ campos de custo",
    href: "/produtos-pro",
    icon: Zap,
    category: "Produtos",
    isNew: true,
  },
  {
    id: "marcas",
    title: "Minhas Marcas", 
    description: "Organize e gerencie suas marcas registradas e genéricas",
    href: "/minha-area/marcas",
    icon: Building,
    category: "Branding",
  },
  {
    id: "assinaturas",
    title: "Minhas Assinaturas",
    description: "Gerencie suas assinaturas, planos e histórico de pagamentos",
    href: "/minha-area/assinaturas", 
    icon: Star,
    category: "Billing",
  },
  {
    id: "perfil",
    title: "Meu Perfil",
    description: "Gerencie suas informações pessoais e altere sua senha",
    href: "/minha-area/perfil",
    icon: User,
    category: "Gestão",
  },
  {
    id: "importacao-exportacao",
    title: "Importação & Exportação",
    description: "Importe e exporte produtos e configurações via Excel (XLSX)",
    href: "/minha-area/importacao-exportacao",
    icon: FileSpreadsheet,
    category: "Produtos",
    isNew: true,
  },
  {
    id: "importacoes",
    title: "Importações",
    description: "Ferramentas completas para gestão de importações, PO, documentos e compliance",
    href: "/minha-area/importacoes",
    icon: Ship,
    category: "Gestão",
    isNew: true,
  },
  {
    id: "financas360",
    title: "Finanças360",
    description: "Sistema completo de gestão financeira com controle de receitas, despesas e relatórios",
    href: "/minha-area/financas360",
    icon: Calculator,
    category: "Gestão",
    isNew: true,
  },
];

const categories = [
  { name: "Todos", count: minhaAreaItems.length },
  { name: "Gestão", count: minhaAreaItems.filter(item => item.category === "Gestão").length },
  { name: "Produtos", count: minhaAreaItems.filter(item => item.category === "Produtos").length },
  { name: "Branding", count: minhaAreaItems.filter(item => item.category === "Branding").length },
  { name: "Billing", count: minhaAreaItems.filter(item => item.category === "Billing").length },
];

export default function MinhaAreaIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredItems = minhaAreaItems.filter(item => {
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "Todos" || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todos");
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Minha Área</h1>
        <p className="text-muted-foreground">
          Gerencie seus produtos, fornecedores, marcas e assinaturas
        </p>
      </div>

      {/* Barra de busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar funcionalidades..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filtros por categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategory === category.name;
          
          return (
            <Badge 
              key={category.name}
              variant={isSelected ? "default" : "secondary"}
              className="cursor-pointer hover:bg-primary/80"
              onClick={() => setSelectedCategory(category.name)}
            >
              {category.name}
              {category.count > 0 && ` (${category.count})`}
            </Badge>
          );
        })}
      </div>

      {/* Contador de resultados */}
      {(searchQuery || selectedCategory !== "Todos") && (
        <div className="text-sm text-muted-foreground">
          {filteredItems.length} {filteredItems.length === 1 ? 'item encontrado' : 'itens encontrados'}
          {(searchQuery || selectedCategory !== "Todos") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="ml-2 h-6 px-2 text-xs"
            >
              Limpar filtros
              <X className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* Grid de funcionalidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const IconComponent = item.icon;
          const isProdutosPro = item.id === "produtos-pro";
          
          return (
            <Card 
              key={item.id} 
              className={`hover:shadow-lg transition-all ${
                isProdutosPro 
                  ? "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 hover:shadow-blue-200/50" 
                  : "hover:shadow-lg"
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${
                      isProdutosPro 
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600" 
                        : "bg-primary/10"
                    }`}>
                      <IconComponent className={`w-5 h-5 ${
                        isProdutosPro ? "text-white" : "text-primary"
                      }`} />
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${
                        isProdutosPro ? "text-blue-900" : ""
                      }`}>
                        {item.title}
                      </CardTitle>
                      <Badge 
                        variant="outline" 
                        className={`text-xs mt-1 ${
                          isProdutosPro ? "border-blue-300 text-blue-700" : ""
                        }`}
                      >
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  {item.isNew && (
                    <Badge className={`text-xs ${
                      isProdutosPro 
                        ? "bg-gradient-to-r from-green-400 to-blue-500 text-white" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {isProdutosPro ? "✨ Pro" : "Novo!"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className={`text-sm leading-relaxed ${
                  isProdutosPro ? "text-blue-800" : ""
                }`}>
                  {item.description}
                </CardDescription>
                
                <Button 
                  asChild 
                  className={`w-full ${
                    isProdutosPro 
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700" 
                      : ""
                  }`}
                >
                  <Link to={item.href}>
                    {isProdutosPro ? "Acessar Pro" : "Acessar"}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Estado vazio */}
      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhuma funcionalidade encontrada
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== "Todos" 
              ? "Tente ajustar seus filtros para encontrar o que procura."
              : "Ainda não há funcionalidades disponíveis."
            }
          </p>
          {(searchQuery || selectedCategory !== "Todos") && (
            <Button 
              onClick={clearFilters}
              variant="outline"
            >
              Limpar Filtros
            </Button>
          )}
        </div>
      )}

    </div>
  );
}