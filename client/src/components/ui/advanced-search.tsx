import { useState } from "react";
import { Search, Filter, X, Calendar, Tag, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export interface SearchFilter {
  key: string;
  label: string;
  value: string;
  type: 'text' | 'select' | 'date' | 'boolean';
  options?: { value: string; label: string }[];
}

interface AdvancedSearchProps {
  placeholder?: string;
  onSearch: (query: string, filters: SearchFilter[]) => void;
  availableFilters?: {
    key: string;
    label: string;
    type: 'text' | 'select' | 'date' | 'boolean';
    options?: { value: string; label: string }[];
  }[];
  className?: string;
}

export const AdvancedSearch = ({
  placeholder = "Pesquisar...",
  onSearch,
  availableFilters = [],
  className = "",
}: AdvancedSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = () => {
    onSearch(searchQuery, activeFilters);
  };

  const addFilter = (filterType: typeof availableFilters[0]) => {
    const newFilter: SearchFilter = {
      key: filterType.key,
      label: filterType.label,
      value: "",
      type: filterType.type,
      options: filterType.options,
    };
    setActiveFilters([...activeFilters, newFilter]);
    setIsFilterOpen(false);
  };

  const updateFilter = (index: number, value: string) => {
    const updated = [...activeFilters];
    updated[index].value = value;
    setActiveFilters(updated);
    onSearch(searchQuery, updated);
  };

  const removeFilter = (index: number) => {
    const updated = activeFilters.filter((_, i) => i !== index);
    setActiveFilters(updated);
    onSearch(searchQuery, updated);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSearchQuery("");
    onSearch("", []);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main search bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 pr-4"
          />
        </div>
        
        <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Adicionar Filtros</h4>
                {activeFilters.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="text-xs"
                  >
                    Limpar Tudo
                  </Button>
                )}
              </div>
              
              <div className="grid gap-2">
                {availableFilters.map((filter) => (
                  <Button
                    key={filter.key}
                    variant="ghost"
                    size="sm"
                    onClick={() => addFilter(filter)}
                    className="justify-start"
                    disabled={activeFilters.some(f => f.key === filter.key)}
                  >
                    {filter.key === 'date' && <Calendar className="h-4 w-4 mr-2" />}
                    {filter.key === 'category' && <Tag className="h-4 w-4 mr-2" />}
                    {filter.key === 'author' && <User className="h-4 w-4 mr-2" />}
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Button onClick={handleSearch} size="sm">
          Pesquisar
        </Button>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <div key={`${filter.key}-${index}`} className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-md px-2 py-1">
              <Label className="text-xs font-medium text-blue-700">
                {filter.label}:
              </Label>
              
              {filter.type === 'select' && filter.options ? (
                <Select
                  value={filter.value}
                  onValueChange={(value) => updateFilter(index, value)}
                >
                  <SelectTrigger className="h-6 w-auto min-w-[80px] border-0 bg-transparent text-xs">
                    <SelectValue placeholder="Selecionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={filter.type === 'date' ? 'date' : 'text'}
                  value={filter.value}
                  onChange={(e) => updateFilter(index, e.target.value)}
                  className="h-6 w-auto min-w-[80px] border-0 bg-transparent text-xs px-1"
                  placeholder="Valor"
                />
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(index)}
                className="h-4 w-4 p-0 hover:bg-red-100"
              >
                <X className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};