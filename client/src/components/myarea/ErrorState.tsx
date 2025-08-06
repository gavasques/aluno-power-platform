import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RotateCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onBack?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Erro',
  message,
  onRetry,
  onBack,
  className = ''
}) => {
  return (
    <Card className={`text-center py-12 ${className}`}>
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-red-50 p-6 rounded-full">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-red-900">{title}</h3>
            <p className="text-red-700 max-w-md mx-auto">{message}</p>
          </div>
          <div className="flex gap-3">
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            )}
            {onRetry && (
              <Button onClick={onRetry}>
                <RotateCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ErrorState;