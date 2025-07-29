import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { ExpandableSectionProps } from '../types';

/**
 * EXPANDABLE SECTION COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para seções expansíveis
 * Responsabilidade única: Container expansível/colapsável genérico
 */
export function ExpandableSection({ 
  title, 
  icon: Icon, 
  isExpanded, 
  onToggle, 
  children 
}: ExpandableSectionProps) {
  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition-all duration-200 p-4 sm:p-6"
        onClick={onToggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggle();
          }
        }}
        aria-expanded={isExpanded}
      >
        <CardTitle className="flex items-center justify-between text-sm sm:text-base">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
            <span className="font-medium sm:font-semibold text-gray-900 truncate">
              {title}
            </span>
          </div>
          <div className="flex-shrink-0 ml-2">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-600 transition-transform duration-200" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-600 transition-transform duration-200" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4 sm:p-6 pt-0 border-t border-gray-100">
          {children}
        </CardContent>
      )}
    </Card>
  );
}