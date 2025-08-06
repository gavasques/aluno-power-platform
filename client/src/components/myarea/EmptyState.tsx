import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  iconColor?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  iconColor = 'blue',
  className = ''
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    gray: 'bg-gray-50 text-gray-600',
  };

  const colorClass = colorClasses[iconColor as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <Card className={`text-center py-12 ${className}`}>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className={`p-6 rounded-full ${colorClass.split(' ')[0]}`}>
            <Icon className={`h-12 w-12 ${colorClass.split(' ')[1]}`} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {description}
            </p>
          </div>
          {action && (
            <Button onClick={action.onClick} className="gap-2">
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;