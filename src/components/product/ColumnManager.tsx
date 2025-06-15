
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { channelNames } from "@/config/channels";

interface ColumnManagerProps {
  visibleChannels: string[];
  onVisibleChannelsChange: (channels: string[]) => void;
}

export const ColumnManager = ({ visibleChannels, onVisibleChannelsChange }: ColumnManagerProps) => {
  const handleChannelToggle = (channelKey: string, checked: boolean) => {
    if (checked) {
      onVisibleChannelsChange([...visibleChannels, channelKey]);
    } else {
      onVisibleChannelsChange(visibleChannels.filter(key => key !== channelKey));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Settings className="h-4 w-4 mr-2" />
          Colunas
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Canais de Venda Visíveis</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2">
          {Object.entries(channelNames).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={visibleChannels.includes(key)}
                onCheckedChange={(checked) => handleChannelToggle(key, !!checked)}
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
        <div className="p-2 flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onVisibleChannelsChange(Object.keys(channelNames))}
            className="flex-1"
          >
            Mostrar Todos
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onVisibleChannelsChange([])}
            className="flex-1"
          >
            Ocultar Todos
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
