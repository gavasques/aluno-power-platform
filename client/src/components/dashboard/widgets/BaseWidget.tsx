import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Loader2 } from 'lucide-react';

interface BaseWidgetProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
  error?: string;
  actions?: React.ReactNode;
  className?: string;
}

export const BaseWidget: React.FC<BaseWidgetProps> = ({
  title,
  icon,
  children,
  isLoading = false,
  error,
  actions,
  className = ""
}) => {
  if (error) {
    return (
      <Card className={`${className}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 text-sm">Erro ao carregar dados</p>
            <p className="text-gray-500 text-xs mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
};