import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import type { ToolHeaderProps } from './ToolDetailTypes';

export const ToolHeader: React.FC<ToolHeaderProps> = ({ tool, toolType }) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {tool.logo && (
          <div className="flex-shrink-0">
            <img
              src={tool.logo}
              alt={tool.name}
              className="h-20 w-20 object-contain rounded-lg border"
            />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
          <Badge variant="secondary" className="mb-4">
            {toolType?.name || "Ferramenta"}
          </Badge>
          <p className="text-lg text-gray-600 mb-4">
            {tool.description}
          </p>
          <div className="flex items-center gap-4">
            {tool.website && (
              <Button asChild>
                <a
                  href={tool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Visitar Site
                </a>
              </Button>
            )}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Suporte ao Brasil:</span>
              <Badge 
                variant={
                  tool.brazilSupport === 'works' ? 'default' :
                  tool.brazilSupport === 'partial' ? 'secondary' : 'destructive'
                }
              >
                {tool.brazilSupport === 'works' ? 'Funciona' :
                 tool.brazilSupport === 'partial' ? 'Parcial' : 'Não funciona'}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};