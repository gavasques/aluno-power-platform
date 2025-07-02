import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface ProcessingFeedbackProps {
  isProcessing?: boolean;
  isUploading?: boolean;
  error?: string | null;
  step?: string;
  processingColor?: string;
}

export const ProcessingFeedback = ({ 
  isProcessing = false,
  isUploading = false, 
  error = null, 
  step = '',
  processingColor = 'blue'
}: ProcessingFeedbackProps) => {
  if (!isProcessing && !isUploading && !error) return null;

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950 mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-100">
                Erro no processamento
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isUploading) {
    return (
      <Card className={`border-${processingColor}-200 bg-${processingColor}-50 dark:border-${processingColor}-800 dark:bg-${processingColor}-950 mb-6`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className={`h-5 w-5 animate-spin rounded-full border-4 border-${processingColor}-600 border-t-transparent`} />
            <div>
              <p className={`font-medium text-${processingColor}-900 dark:text-${processingColor}-100`}>
                Carregando imagem...
              </p>
              <p className={`text-sm text-${processingColor}-700 dark:text-${processingColor}-300`}>
                Aguarde enquanto fazemos o upload da sua imagem...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isProcessing && step) {
    return (
      <Card className={`border-${processingColor}-200 bg-${processingColor}-50 dark:border-${processingColor}-800 dark:bg-${processingColor}-950 mb-6`}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className={`h-5 w-5 animate-spin rounded-full border-4 border-${processingColor}-600 border-t-transparent`} />
            <div>
              <p className={`font-medium text-${processingColor}-900 dark:text-${processingColor}-100`}>
                {step}
              </p>
              <p className={`text-sm text-${processingColor}-700 dark:text-${processingColor}-300`}>
                Aguarde enquanto processamos sua imagem...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
};