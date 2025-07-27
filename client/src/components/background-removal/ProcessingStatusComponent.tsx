/**
 * Reusable Processing Status Component for Background Removal
 * 
 * Features:
 * - Real-time processing status
 * - Progress indicators
 * - Cost tracking
 * - Error handling
 * - Processing time display
 */

import React from 'react';
import { CheckCircle, XCircle, Clock, DollarSign, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface ProcessingStatusComponentProps {
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress?: number;
  message?: string;
  processingTime?: number;
  creditsUsed?: number;
  error?: string;
  sessionId?: string;
  estimatedTime?: number;
  className?: string;
}

const ProcessingStatusComponent: React.FC<ProcessingStatusComponentProps> = ({
  status,
  progress = 0,
  message,
  processingTime,
  creditsUsed,
  error,
  sessionId,
  estimatedTime = 5000, // 5 seconds default
  className = ''
}) => {
  // Get status configuration
  const getStatusConfig = () => {
    switch (status) {
      case 'idle':
        return {
          icon: Clock,
          title: 'Pronto para processar',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          badge: 'secondary' as const,
          showProgress: false
        };
      case 'uploading':
        return {
          icon: LoadingSpinner,
          title: 'Enviando imagem...',
          color: 'text-blue-500',
          bgColor: 'bg-blue-50',
          badge: 'default' as const,
          showProgress: true,
          animate: true
        };
      case 'processing':
        return {
          icon: LoadingSpinner,
          title: 'Processando com IA...',
          color: 'text-purple-500',
          bgColor: 'bg-purple-50',
          badge: 'default' as const,
          showProgress: true,
          animate: true
        };
      case 'completed':
        return {
          icon: CheckCircle,
          title: 'Processamento concluído!',
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          badge: 'success' as const,
          showProgress: false
        };
      case 'failed':
        return {
          icon: XCircle,
          title: 'Erro no processamento',
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          badge: 'destructive' as const,
          showProgress: false
        };
      default:
        return {
          icon: Clock,
          title: 'Status desconhecido',
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          badge: 'secondary' as const,
          showProgress: false
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  // Calculate estimated completion time
  const getEstimatedCompletion = (): string => {
    if (status === 'processing' && estimatedTime) {
      const remaining = Math.max(0, estimatedTime - (processingTime || 0));
      return `~${Math.ceil(remaining / 1000)}s restantes`;
    }
    return '';
  };

  // Format processing time
  const formatProcessingTime = (time: number): string => {
    if (time < 1000) {
      return `${time}ms`;
    }
    return `${(time / 1000).toFixed(1)}s`;
  };

  return (
    <div className={`w-full ${className}`}>
      <Card className={`border-l-4 ${config.color.replace('text-', 'border-')}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${config.bgColor}`}>
                {config.animate ? (
                  <LoadingSpinner 
                    size="sm" 
                    variant="inline" 
                    showMessage={false}
                    className={config.color}
                  />
                ) : (
                  <Icon className={`h-5 w-5 ${config.color}`} />
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold">{config.title}</h3>
                {message && (
                  <p className="text-sm text-gray-600 mt-1">{message}</p>
                )}
              </div>
            </div>
            
            <Badge variant={config.badge}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Progress Bar */}
          {config.showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progresso</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              {getEstimatedCompletion() && (
                <p className="text-xs text-gray-500 text-center">
                  {getEstimatedCompletion()}
                </p>
              )}
            </div>
          )}

          {/* Processing Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Processing Time */}
            {processingTime !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Tempo:</span>
                <span className="font-medium">{formatProcessingTime(processingTime)}</span>
              </div>
            )}

            {/* Credits Used */}
            {creditsUsed !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Créditos:</span>
                <span className="font-medium">{creditsUsed.toFixed(1)}</span>
              </div>
            )}

            {/* Session ID */}
            {sessionId && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Sessão:</span>
                <code className="text-xs font-mono bg-gray-100 px-1 rounded">
                  {sessionId.slice(0, 8)}...
                </code>
              </div>
            )}
          </div>

          {/* Success Message */}
          {status === 'completed' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {message || 'Processamento concluído com sucesso! Sua imagem está pronta para download.'}
              </AlertDescription>
            </Alert>
          )}

          {/* Error Message */}
          {status === 'failed' && error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Processing Tips */}
          {status === 'processing' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> O processamento pode levar alguns segundos dependendo do tamanho 
                e complexidade da imagem. Mantenha esta aba aberta para acompanhar o progresso.
              </p>
            </div>
          )}

          {/* Upload Tips */}
          {status === 'uploading' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800">
                📤 <strong>Enviando:</strong> Sua imagem está sendo preparada para processamento. 
                Este processo é rápido e seguro.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProcessingStatusComponent;