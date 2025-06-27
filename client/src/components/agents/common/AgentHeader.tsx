import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AgentHeaderProps {
  title: string;
  description: string;
  icon: string;
  isActive?: boolean;
  onBack?: () => void;
}

export const AgentHeader: React.FC<AgentHeaderProps> = ({
  title,
  description,
  icon,
  isActive = true,
  onBack
}) => {
  return (
    <div className="mb-8">
      {onBack && (
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Agentes
          </Button>
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
            {icon}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {title}
            </h1>
            {isActive && (
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Ativo
              </Badge>
            )}
          </div>
          <p className="text-lg text-gray-600">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};