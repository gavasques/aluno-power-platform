/**
 * Background Removal PRO Page
 * 
 * Professional background removal tool with AI-powered processing
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';
import BackgroundRemovalTool from '@/components/background-removal/BackgroundRemovalTool';

const Tool_BackgroundRemovalPro: React.FC = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation('/ferramentas')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar às Ferramentas
              </Button>
              <div className="h-6 w-px bg-border" />
              <h1 className="text-xl font-semibold">
                Remover de Fundo PRO
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tool */}
      <div className="py-8">
        <BackgroundRemovalTool />
      </div>
    </div>
  );
};

export default Tool_BackgroundRemovalPro;