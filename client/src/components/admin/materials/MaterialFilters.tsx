import { FC } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { MaterialFiltersProps } from './MaterialFormTypes';

export const MaterialFilters: FC<MaterialFiltersProps> = ({
  searchTerm,
  selectedType,
  selectedAccess,
  materialTypes,
  onSearchChange,
  onTypeChange,
  onAccessChange,
}) => {
  return (
    <div className="flex gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Buscar materiais..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Filtrar por tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os tipos</SelectItem>
          {materialTypes.map((type) => (
            <SelectItem key={type.id} value={type.id.toString()}>
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={selectedAccess} onValueChange={onAccessChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Nível de acesso" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os níveis</SelectItem>
          <SelectItem value="public">Público</SelectItem>
          <SelectItem value="restricted">Restrito</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};