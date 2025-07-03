
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  showInactive: boolean;
  setShowInactive: (show: boolean) => void;
}

export const ProductFilters = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  showInactive,
  setShowInactive
}: ProductFiltersProps) => {
  const categories = ["Todas", "Eletrônicos", "Roupas e Acessórios", "Casa e Jardim", "Esportes", "Automotivo"];

  return (
    <Card className="mb-4 border-0 shadow-md">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-3 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Buscar produtos por nome ou marca..."
              className="pl-10 h-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={showInactive}
                onCheckedChange={setShowInactive}
                className="data-[state=checked]:bg-blue-600"
              />
              <span className="text-sm text-gray-600">Mostrar inativos</span>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-44 h-10 border-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>


          </div>
        </div>
      </CardContent>
    </Card>
  );
};
