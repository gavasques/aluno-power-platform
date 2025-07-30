import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';

interface ContasBancariasFiltersProps {
  searchTerm: string;
  filterActive: 'all' | 'active' | 'inactive';
  filterBank: string;
  onSearchChange: (term: string) => void;
  onActiveFilterChange: (filter: 'all' | 'active' | 'inactive') => void;
  onBankFilterChange: (bank: string) => void;
  onRefresh: () => void;
}

export const ContasBancariasFilters = memo<ContasBancariasFiltersProps>(({
  searchTerm,
  filterActive,
  filterBank,
  onSearchChange,
  onActiveFilterChange,
  onBankFilterChange,
  onRefresh
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por banco, agência ou conta..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={filterActive} onValueChange={onActiveFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="inactive">Inativas</SelectItem>
            </SelectContent>
          </Select>

          {/* Bank Filter */}
          <div className="w-[200px]">
            <Input
              placeholder="Filtrar por banco..."
              value={filterBank}
              onChange={(e) => onBankFilterChange(e.target.value)}
            />
          </div>

          {/* Refresh Button */}
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});