import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Importar ícones um por vez para testar
import { Search, X, Calculator } from "lucide-react";

// Teste primeiro com FileDigit, Ship, Building - estes podem estar causando problema
let FileDigit, Ship, Building, ArrowRight, TrendingUp;

try {
  const icons = require("lucide-react");
  FileDigit = icons.FileDigit || Calculator;
  Ship = icons.Ship || Calculator;
  Building = icons.Building || Calculator;
  ArrowRight = icons.ArrowRight || Calculator;
  TrendingUp = icons.TrendingUp || Calculator;
} catch (e) {
  console.error("Erro ao importar ícones:", e);
  FileDigit = Calculator;
  Ship = Calculator;
  Building = Calculator;
  ArrowRight = Calculator;
  TrendingUp = Calculator;
}

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
    description: "Calcule impostos e alíquotas do Simples Nacional com base no faturamento",
    href: "/simuladores/simulador-simples-nacional-completo",
    icon: FileDigit,
    category: "Tributário",
    isAvailable: true,
  },
  {
    id: "importacao-simplificada",
    title: "Importação Simplificada",
    description: "Simule custos de importação via courier (até US$ 3.000)",
    href: "/simuladores/importacao-simplificada", 
    icon: Ship,
    category: "Importação",
    isAvailable: true,
  },
  {
    id: "importacao-formal",
    title: "Importação Formal Direta",
    description: "Calcule custos para importação formal acima de US$ 3.000",
    href: "/simuladores/importacao-formal-direta", 
    icon: Building,
    category: "Importação",
    isAvailable: true,
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
  "Todos",
  "Tributário", 
  "Importação",
  "Análise"
];

export default function SimuladoresIconTest() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // Filtros 
  const filteredItems = simuladorItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div>
        <h1 className="text-3xl font-bold">Simuladores (Teste de Ícones)</h1>
        <p className="text-muted-foreground">
          Ferramentas de simulação para análise de negócios e tomada de decisões
        </p>
      </div>

      {/* Barra de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar simuladores..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filtros por categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
            {category !== "Todos" && (
              <span className="ml-1 text-xs">
                ({simuladorItems.filter(item => item.category === category).length})
              </span>
            )}
          </Badge>
        ))}
      </div>

      {/* Grid de simuladores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const IconComponent = item.icon;
          
          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
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
              <CardContent className="space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {item.description}
                </CardDescription>
                
                <Button asChild className="w-full" disabled={!item.isAvailable}>
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