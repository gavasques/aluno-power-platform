import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, DollarSign, ShoppingCart, BarChart3, X } from "lucide-react";

export default function ProductPricingFormSimple() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("basic");
  const isEditing = !!id;

  return (
    <div className="container max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isEditing ? "Editar Produto" : "Novo Produto"}
          </h1>
          <p className="text-muted-foreground">
            Configure todos os dados e precificação do produto
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/minha-area/produtos")}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Dados Básicos</span>
              </TabsTrigger>
              <TabsTrigger value="costs" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Custos</span>
              </TabsTrigger>
              <TabsTrigger value="channels" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="hidden sm:inline">Canais</span>
              </TabsTrigger>
              <TabsTrigger value="results" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Resultados</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dados Básicos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Formulário de dados básicos do produto será implementado aqui.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="costs" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Custos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Configuração de custos será implementada aqui.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="channels" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Canais de Venda</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Configuração dos canais de venda será implementada aqui.</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resultados</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Visualização dos resultados será implementada aqui.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 mt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/minha-area/produtos")}
            >
              Cancelar
            </Button>
            <Button type="submit">
              Salvar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}