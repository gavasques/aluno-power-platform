
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { useLocation } from "wouter";

export const ProductEmptyState = () => {
  const [, setLocation] = useLocation();

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-12">
        <div className="flex flex-col gap-2 items-center text-center">
          <Package className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium text-gray-600 mb-2">Nenhum produto encontrado</p>
          <p className="text-sm text-gray-500 mb-4">Tente ajustar seus filtros ou cadastre um novo produto.</p>
          <Button 
            onClick={() => setLocation("/minha-area/produtos/novo")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Produto
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
