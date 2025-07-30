import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw } from 'lucide-react';
import { PACKAGE_STATUSES } from '../types';

interface PackageFiltersProps {
  searchTerm: string;
  statusFilter: string;
  supplierFilter: string;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onSupplierFilterChange: (supplier: string) => void;
  onRefresh: () => void;
}

export const PackageFilters = memo<PackageFiltersProps>(({
  searchTerm,
  statusFilter,
  supplierFilter,
  onSearchChange,
  onStatusFilterChange,
  onSupplierFilterChange,
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
              placeholder="Buscar por nome, fornecedor ou código de rastreamento..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Status</SelectItem>
              {PACKAGE_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Supplier Filter */}
          <div className="w-[200px]">
            <Input
              placeholder="Filtrar por fornecedor..."
              value={supplierFilter}
              onChange={(e) => onSupplierFilterChange(e.target.value)}
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