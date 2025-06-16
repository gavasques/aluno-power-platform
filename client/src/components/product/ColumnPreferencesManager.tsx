
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings, Eye, EyeOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { channelNames } from "@/config/channels";
import { ColumnPreferences } from "@/hooks/useColumnPreferences";

interface ColumnPreferencesManagerProps {
  columnPreferences: ColumnPreferences;
  onColumnVisibilityChange: (column: keyof Omit<ColumnPreferences, 'channels'>, visible: boolean) => void;
  onChannelVisibilityChange: (channels: string[]) => void;
}

export const ColumnPreferencesManager = ({ 
  columnPreferences, 
  onColumnVisibilityChange, 
  onChannelVisibilityChange 
}: ColumnPreferencesManagerProps) => {
  const basicColumns = [
    { key: 'photo' as const, label: 'Foto' },
    { key: 'name' as const, label: 'Nome do Produto' },
    { key: 'brand' as const, label: 'Marca' },
    { key: 'category' as const, label: 'Categoria' },
    { key: 'sku' as const, label: 'SKU' },
    { key: 'internalCode' as const, label: 'Código Interno' },
    { key: 'status' as const, label: 'Status' },
  ];

  const handleChannelToggle = (channelKey: string, checked: boolean) => {
    if (checked) {
      onChannelVisibilityChange([...columnPreferences.channels, channelKey]);
    } else {
      onChannelVisibilityChange(columnPreferences.channels.filter(key => key !== channelKey));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Settings className="h-4 w-4 mr-2" />
          Personalizar Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>Colunas Básicas</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2">
          {basicColumns.map(({ key, label }) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={columnPreferences[key]}
                onCheckedChange={(checked) => onColumnVisibilityChange(key, !!checked)}
              />
              <label
                htmlFor={key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Canais de Venda</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2">
          {Object.entries(channelNames).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={`channel-${key}`}
                checked={columnPreferences.channels.includes(key)}
                onCheckedChange={(checked) => handleChannelToggle(key, !!checked)}
              />
              <label
                htmlFor={`channel-${key}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {label}
              </label>
            </div>
          ))}
        </div>
        
        <DropdownMenuSeparator />
        <div className="p-2 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              basicColumns.forEach(col => onColumnVisibilityChange(col.key, true));
              onChannelVisibilityChange(Object.keys(channelNames));
            }}
            className="flex-1"
          >
            <Eye className="h-3 w-3 mr-1" />
            Mostrar Todos
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              basicColumns.forEach(col => onColumnVisibilityChange(col.key, false));
              onChannelVisibilityChange([]);
            }}
            className="flex-1"
          >
            <EyeOff className="h-3 w-3 mr-1" />
            Ocultar Todos
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
