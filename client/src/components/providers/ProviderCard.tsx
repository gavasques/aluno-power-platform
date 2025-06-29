import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface ProviderInfo {
  value: string;
  label: string;
  icon: string;
  color: string;
}

interface ProviderCardProps {
  provider: ProviderInfo;
  isConfigured: boolean;
  modelCount: number;
  onSelect: () => void;
  isSelected: boolean;
}

export default function ProviderCard({ 
  provider, 
  isConfigured, 
  modelCount, 
  onSelect, 
  isSelected 
}: ProviderCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary shadow-md' : ''
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            <span className="text-lg">{provider.icon}</span>
            <span>{provider.label}</span>
          </div>
          <Badge 
            variant={isConfigured ? "default" : "destructive"} 
            className={provider.color}
          >
            {isConfigured ? "Ativo" : "Inativo"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-sm text-muted-foreground">
          {modelCount} {modelCount === 1 ? 'modelo' : 'modelos'} disponível{modelCount !== 1 ? 'is' : ''}
        </div>
      </CardContent>
    </Card>
  );
}