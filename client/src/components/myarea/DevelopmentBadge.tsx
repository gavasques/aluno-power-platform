import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DevelopmentBadgeProps {
  module?: string;
  phase?: string;
  className?: string;
}

export const DevelopmentBadge: React.FC<DevelopmentBadgeProps> = ({
  module = 'Este módulo',
  phase = 'Fase 4',
  className = ''
}) => {
  return (
    <Card className={`border-orange-200 bg-orange-50 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
            Em Desenvolvimento
          </Badge>
          <span className="text-sm text-orange-800">
            {module} está sendo desenvolvido na {phase} do projeto
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevelopmentBadge;