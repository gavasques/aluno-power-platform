import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, X, FileText, Building, Users, Calculator, Ship, Package } from "lucide-react";

interface ImportacaoItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  isNew?: boolean;
  isAvailable?: boolean;
}

const importacaoItems: ImportacaoItem[] = [
  {
    id: "simulador-simplificado",
    title: "Simulador de Importação Simplificada",
    description: "Simulador simplificado e rápido para cálculos básicos de importação",
    href: "/simuladores/simplificado",
    icon: Calculator,
    category: "Simuladores",
    isAvailable: true,
    isNew: true,
  },
  {
    id: "importacao-formal-direta",
    title: "Simulador de Importação Formal Direta",
    description: "Simulador completo com rateio por CBM e cálculo detalhado de impostos de importação",
    href: "/simuladores/importacao-formal-direta",
    icon: Ship,
    category: "Simuladores",
    isAvailable: true,
    isNew: true,
  },
  {
    id: "gestao-packing-lists",
    title: "Gestão de Packing Lists",
    description: "Crie, visualize, edite e gerencie seus Packing Lists e Commercial Invoices",
    href: "/minha-area/importacoes/documentos-salvos",
    icon: Package,
    category: "Documentos",
    isAvailable: true,
    isNew: true,
  },

  {
    id: "gestao-fornecedores",
    title: "CRM de Fornecedores",
    description: "Sistema completo de gestão de fornecedores com contratos, contatos, performance e comunicação",
    href: "/minha-area/importacoes/fornecedores",
    icon: Users,
    category: "Fornecedores",
    isAvailable: true,
    isNew: true,
  },
  {
    id: "produtos-importados",
    title: "Gestão de Produtos Importados",
    description: "Sistema completo para gerenciar produtos em processo de importação, do projeto à chegada",
    href: "/minha-area/importacoes/produtos",
    icon: Package,
    category: "Gestão",
    isAvailable: true,
    isNew: true,
  },
];

const categories = [
  { name: "Todos", count: importacaoItems.length },
  { name: "Simuladores", count: importacaoItems.filter(item => item.category === "Simuladores").length },
  { name: "Documentos", count: importacaoItems.filter(item => item.category === "Documentos").length },
  { name: "Fornecedores", count: importacaoItems.filter(item => item.category === "Fornecedores").length },
  { name: "Gestão", count: importacaoItems.filter(item => item.category === "Gestão").length },
];

export default function ImportacoesIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredItems = importacaoItems.filter(item => {
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
        <h1 className="text-3xl font-bold">Importações</h1>
        <p className="text-muted-foreground">
          Ferramentas e recursos para gerenciar todo o processo de importação
        </p>
      </div>

      {/* Barra de busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar ferramentas de importação..."
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
          {filteredItems.length} {filteredItems.length === 1 ? 'ferramenta encontrada' : 'ferramentas encontradas'}
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

      {/* Grid de ferramentas de importação */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const IconComponent = item.icon;
          
          // Definir cores específicas por ferramenta para diferenciação
          const getIconColors = (id: string) => {
            switch (id) {
              case "simulador-simplificado":
                return {
                  bgColor: "bg-blue-100",
                  iconColor: "text-blue-600",
                  buttonIconColor: "text-blue-600"
                };
              case "importacao-formal-direta":
                return {
                  bgColor: "bg-purple-100",
                  iconColor: "text-purple-600",
                  buttonIconColor: "text-purple-600"
                };
              case "gerador-po-proforma":
                return {
                  bgColor: "bg-green-100",
                  iconColor: "text-green-600",
                  buttonIconColor: "text-green-600"
                };
              case "gestao-fornecedores":
                return {
                  bgColor: "bg-orange-100",
                  iconColor: "text-orange-600",
                  buttonIconColor: "text-orange-600"
                };
              default:
                return {
                  bgColor: "bg-primary/10",
                  iconColor: "text-primary",
                  buttonIconColor: "text-primary"
                };
            }
          };

          const colors = getIconColors(item.id);
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 ${colors.bgColor} rounded-lg`}>
                      <IconComponent className={`w-5 h-5 ${colors.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      <Badge variant="outline" className="text-xs mt-1">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  {item.isNew && (
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Novo!
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1 space-y-4">
                <CardDescription className="text-sm leading-relaxed flex-1">
                  {item.description}
                </CardDescription>
                
                <Button asChild className="w-full mt-auto" disabled={!item.isAvailable}>
                  <Link to={item.href}>
                    <IconComponent className="w-4 h-4 mr-2" />
                    {item.isAvailable ? 'Acessar' : 'Em breve'}
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
          <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhuma ferramenta encontrada
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== "Todos" 
              ? "Tente ajustar seus filtros para encontrar a ferramenta ideal."
              : "Ainda não há ferramentas disponíveis."
            }
          </p>
          {(searchQuery || selectedCategory !== "Todos") && (
            <Button 
              onClick={clearFilters}
              variant="outline"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>
      )}

      {/* Banner informativo */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start space-x-3">
            <Building className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Ferramentas de Importação em Desenvolvimento
              </h3>
              <p className="text-blue-700 text-sm mb-3">
                Estamos trabalhando em um conjunto completo de ferramentas para facilitar todo o seu processo de importação. 
                A primeira ferramenta "Gerador de PO, Proforma Invoice" será lançada em breve.
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-xs">Documentação automática</Badge>
                <Badge variant="secondary" className="text-xs">Gestão de fornecedores</Badge>
                <Badge variant="secondary" className="text-xs">Cálculo de fretes</Badge>
                <Badge variant="secondary" className="text-xs">Compliance aduaneiro</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}