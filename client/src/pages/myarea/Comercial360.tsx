import React, { useState } from 'react';
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X, Folder, Package, Building, Zap, Box, ArrowRight, Star } from "lucide-react";

interface Comercial360Item {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  isNew?: boolean;
  stats?: {
    total?: number;
    active?: number;
    label?: string;
  };
}

const comercial360Items: Comercial360Item[] = [
  {
    id: "fornecedores",
    title: "Meus Fornecedores",
    description: "Gerencie seus fornecedores, contatos, marcas e conversas em um só lugar",
    href: "/minha-area/fornecedores",
    icon: Folder,
    category: "Fornecimento",
    stats: {
      total: 0,
      active: 0,
      label: "fornecedores"
    }
  },
  {
    id: "caixas",
    title: "Caixas",
    description: "Gerencie suas embalagens: dimensões, tipos, custos e especificações completas",
    href: "/minha-area/caixas",
    icon: Box,
    category: "Logística",
    isNew: true,
    stats: {
      total: 0,
      active: 0,
      label: "caixas"
    }
  },
  {
    id: "produtos-pro", 
    title: "Produtos Pro",
    description: "Sistema avançado de multi-canais com cálculos Excel integrados e 18+ campos de custo",
    href: "/produtos-pro",
    icon: Zap,
    category: "Produtos",
    isNew: true,
    stats: {
      total: 0,
      active: 0,
      label: "produtos"
    }
  },
  {
    id: "marcas",
    title: "Minhas Marcas", 
    description: "Organize e gerencie suas marcas registradas e genéricas",
    href: "/minha-area/marcas",
    icon: Building,
    category: "Branding",
    stats: {
      total: 0,
      active: 0,
      label: "marcas"
    }
  },
];

const categories = [
  { name: "Todos", count: comercial360Items.length },
  { name: "Fornecimento", count: comercial360Items.filter(item => item.category === "Fornecimento").length },
  { name: "Produtos", count: comercial360Items.filter(item => item.category === "Produtos").length },
  { name: "Logística", count: comercial360Items.filter(item => item.category === "Logística").length },
  { name: "Branding", count: comercial360Items.filter(item => item.category === "Branding").length },
];

export default function Comercial360() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const filteredItems = comercial360Items.filter(item => {
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
        <div className="flex items-center gap-3">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Comercial360</h1>
            <p className="text-muted-foreground">
              Central completa para gestão comercial: fornecedores, produtos, marcas e embalagens
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar funcionalidades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.name)}
                className="flex items-center gap-1"
              >
                {category.name}
                <span className="text-xs bg-muted px-1 rounded">
                  {category.count}
                </span>
              </Button>
            ))}
            
            {(searchQuery || selectedCategory !== "Todos") && (
              <Button
                variant="ghost" 
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1 text-muted-foreground"
              >
                <X className="h-3 w-3" />
                Limpar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredItems.map((item) => {
          const IconComponent = item.icon;
          return (
            <Card key={item.id} className="group hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {item.title}
                        {item.isNew && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            NOVO
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0 space-y-4">
                <CardDescription className="text-sm leading-relaxed">
                  {item.description}
                </CardDescription>
                
                {item.stats && (
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>
                      <strong className="text-foreground">{item.stats.total}</strong> {item.stats.label}
                    </span>
                    {item.stats.active !== undefined && (
                      <span>
                        <strong className="text-green-600">{item.stats.active}</strong> ativos
                      </span>
                    )}
                  </div>
                )}
                
                <div className="pt-2">
                  <Button asChild className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={item.href} className="flex items-center justify-center gap-2">
                      Acessar
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma funcionalidade encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou termos de busca
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      )}


    </div>
  );
}