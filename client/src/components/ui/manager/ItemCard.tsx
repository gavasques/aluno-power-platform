/**
 * Componente reutilizável para cards de itens
 * Elimina duplicação das estruturas de card nos managers
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ItemField {
  label: string;
  value: React.ReactNode;
  className?: string;
}

interface ItemAction {
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive';
  disabled?: boolean;
}

interface ItemCardProps {
  title: string;
  subtitle?: string;
  badge?: {
    text: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  };
  fields: ItemField[];
  actions?: ItemAction[];
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  layout?: 'vertical' | 'horizontal';
}

export function ItemCard({
  title,
  subtitle,
  badge,
  fields,
  actions = [],
  onEdit,
  onDelete,
  isDeleting = false,
  className = '',
  size = 'md',
  layout = 'vertical'
}: ItemCardProps) {
  // Adiciona ações padrão se fornecidas
  const allActions = [...actions];
  if (onEdit) {
    allActions.unshift({
      label: 'Editar',
      onClick: onEdit,
      icon: Edit,
      variant: 'default'
    });
  }
  if (onDelete) {
    allActions.push({
      label: 'Excluir',
      onClick: onDelete,
      icon: Trash2,
      variant: 'destructive',
      disabled: isDeleting
    });
  }

  const sizeClasses = {
    sm: { header: 'pb-2', content: 'pt-0', text: 'text-sm', title: 'text-base' },
    md: { header: 'pb-3', content: 'pt-0', text: 'text-sm', title: 'text-lg' },
    lg: { header: 'pb-4', content: 'pt-0', text: 'text-base', title: 'text-xl' }
  };

  const classes = sizeClasses[size];

  const renderActions = () => {
    if (allActions.length === 0) return null;

    // Se tem poucas ações, mostra botões inline
    if (allActions.length <= 2) {
      return (
        <div className="flex gap-1 ml-2">
          {allActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.variant === 'destructive' ? 'text-red-600 hover:text-red-700' : ''}
              >
                {IconComponent && <IconComponent className="h-4 w-4" />}
              </Button>
            );
          })}
        </div>
      );
    }

    // Se tem muitas ações, usa dropdown menu
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-2">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {allActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <DropdownMenuItem
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.variant === 'destructive' ? 'text-red-600 focus:text-red-700' : ''}
              >
                {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
                {action.label}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const renderFields = () => {
    if (layout === 'horizontal') {
      return (
        <div className="flex flex-wrap gap-6">
          {fields.map((field, index) => (
            <div key={index} className={`min-w-0 ${field.className || ''}`}>
              <span className="font-medium">{field.label}:</span>{' '}
              <span className="text-gray-600">{field.value}</span>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className={field.className || ''}>
            <span className="font-medium">{field.label}:</span>{' '}
            <span className="text-gray-600">{field.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className={classes.header}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className={`${classes.title} truncate`}>
                {title}
              </CardTitle>
              {badge && (
                <Badge 
                  variant={badge.variant || 'default'} 
                  className={`text-xs ${badge.className || ''}`}
                >
                  {badge.text}
                </Badge>
              )}
            </div>
            {subtitle && (
              <p className={`${classes.text} text-gray-600 mt-1 truncate`}>
                {subtitle}
              </p>
            )}
          </div>
          
          {renderActions()}
        </div>
      </CardHeader>
      
      <CardContent className={`${classes.content} ${classes.text}`}>
        {renderFields()}
      </CardContent>
    </Card>
  );
}