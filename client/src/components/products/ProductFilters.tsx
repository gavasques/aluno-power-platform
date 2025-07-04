import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  id: number;
  name: string;
}

interface Supplier {
  id: number;
  name: string;
}

interface ProductFiltersProps {
  searchTerm: string;
  selectedCategory: string;
  selectedSupplier: string;
  categories: Category[];
  suppliers: Supplier[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSupplierChange: (value: string) => void;
  onClearFilters: () => void;
}

export function ProductFilters({
  searchTerm,
  selectedCategory,
  selectedSupplier,
  categories,
  suppliers,
  onSearchChange,
  onCategoryChange,
  onSupplierChange,
  onClearFilters
}: ProductFiltersProps) {
  const hasActiveFilters = searchTerm || selectedCategory || selectedSupplier;

  return (
    <div className="space-y-4">
      {/* Linha principal de filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Campo de busca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, EAN ou marca..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filtro por categoria */}
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filtro por fornecedor */}
        <Select value={selectedSupplier} onValueChange={onSupplierChange}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os fornecedores" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os fornecedores</SelectItem>
            {suppliers.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                {supplier.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Botão limpar filtros */}
        {hasActiveFilters && (
          <Button 
            variant="outline" 
            onClick={onClearFilters}
            className="w-full md:w-auto"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar Filtros
          </Button>
        )}
      </div>

      {/* Indicadores de filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {searchTerm && (
            <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1">
              Busca: "{searchTerm}"
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onSearchChange("")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {selectedCategory && (
            <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1">
              Categoria: {categories.find(c => c.id.toString() === selectedCategory)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onCategoryChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          {selectedSupplier && (
            <div className="bg-primary/10 text-primary px-2 py-1 rounded-md text-sm flex items-center gap-1">
              Fornecedor: {suppliers.find(s => s.id.toString() === selectedSupplier)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1"
                onClick={() => onSupplierChange("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}