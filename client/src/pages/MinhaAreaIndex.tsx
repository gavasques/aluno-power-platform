import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, X, Folder, Package, Building, Star, ArrowRight, User, FileSpreadsheet } from "lucide-react";

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
    id: "produtos", 
    title: "Meus Produtos",
    description: "Controle seu catálogo de produtos, preços e canais de venda",
    href: "/minha-area/produtos",
    icon: Package,
    category: "Produtos",
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
    <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-4 space-y-4">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Minha Área</h1>
        <p className="text-sm text-muted-foreground">
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

      {/* Grid de funcionalidades - 4 COLUNAS COMPACTAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        {filteredItems.map((item) => {
          const IconComponent = item.icon;
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow h-fit compact-card">
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-0.5 px-1.5 py-0">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  {item.isNew && (
                    <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0">
                      Novo!
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pb-3">
                <CardDescription className="text-xs leading-relaxed">
                  {item.description}
                </CardDescription>
                
                <Button asChild className="w-full text-xs py-1.5">
                  <Link to={item.href}>
                    Acessar
                    <ArrowRight className="w-3 h-3 ml-1" />
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