import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search, X, Calculator, Ship, Building, TrendingUp, FileText } from "lucide-react";

interface SimuladorItem {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  isNew?: boolean;
  isAvailable?: boolean;
}

const simuladorItems: SimuladorItem[] = [
  {
    id: "simples-nacional",
    title: "Simples Nacional",
    description: "Calcule impostos e taxas do regime tributário Simples Nacional para seu negócio",
    href: "/simuladores/simples-nacional",
    icon: FileText,
    category: "Tributário",
    isAvailable: true,
  },
  {
    id: "simples-nacional-completo",
    title: "Simples Nacional Completo",
    description: "Simulador avançado com distinção entre faturamento com e sem ST",
    href: "/simuladores/simulador-simples-nacional-completo",
    icon: Calculator,
    category: "Tributário",
    isAvailable: true,
    isNew: true,
  },

  {
    id: "investimentos-roi",
    title: "Simulador de Investimentos e ROI",
    description: "Calcule crescimento de capital através de giros de investimento",
    href: "/simuladores/simulador-de-investimentos-e-roi",
    icon: TrendingUp,
    category: "Análise",
    isAvailable: true,
    isNew: true,
  },
];

const categories = [
  { name: "Todos", count: simuladorItems.length },
  { name: "Tributário", count: simuladorItems.filter(item => item.category === "Tributário").length },
  { name: "Importação", count: simuladorItems.filter(item => item.category === "Importação").length },
  { name: "Análise", count: simuladorItems.filter(item => item.category === "Análise").length },
];

export default function SimuladoresIndex() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredItems = simuladorItems.filter(item => {
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
        <h1 className="text-3xl font-bold">Simuladores</h1>
        <p className="text-muted-foreground">
          Ferramentas de cálculo para tributação, importação e análise de viabilidade
        </p>
      </div>

      {/* Barra de busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar simuladores..."
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
          {filteredItems.length} {filteredItems.length === 1 ? 'simulador encontrado' : 'simuladores encontrados'}
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

      {/* Grid de simuladores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const IconComponent = item.icon;
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow flex flex-col h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <IconComponent className="w-5 h-5 text-primary" />
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
                    <Calculator className="w-4 h-4 mr-2" />
                    {item.isAvailable ? 'Simular' : 'Em breve'}
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
          <Calculator className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhum simulador encontrado
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery || selectedCategory !== "Todos" 
              ? "Tente ajustar seus filtros para encontrar o simulador ideal."
              : "Ainda não há simuladores disponíveis."
            }
          </p>
          {(searchQuery || selectedCategory !== "Todos") && (
            <Button 
              onClick={clearFilters}
              variant="outline"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Limpar Filtros
            </Button>
          )}
        </div>
      )}

    </div>
  );
}