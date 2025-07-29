/**
 * COMPONENTE: ProductFormSteps
 * Navegação entre etapas do formulário
 * Extraído de ImportedProductForm.tsx para modularização
 */
import { Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductFormStepsProps } from '../../types';

export const ProductFormSteps = ({
  currentStep,
  totalSteps,
  stepTitles,
  completedSteps,
  onStepClick,
  canGoToStep
}: ProductFormStepsProps) => {
  
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-900 mb-4">Etapas do Formulário</h3>
      
      {stepTitles.map((title, index) => {
        const stepNumber = index + 1;
        const isActive = currentStep === stepNumber;
        const isCompleted = completedSteps.includes(stepNumber);
        const canNavigate = canGoToStep(stepNumber);
        
        return (
          <div
            key={stepNumber}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
              isActive && "bg-blue-50 border border-blue-200",
              !isActive && canNavigate && "hover:bg-gray-50",
              !canNavigate && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => canNavigate && onStepClick(stepNumber)}
          >
            {/* Step Number/Icon */}
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                isCompleted && "bg-green-500 text-white",
                isActive && !isCompleted && "bg-blue-500 text-white",
                !isActive && !isCompleted && canNavigate && "bg-gray-200 text-gray-700",
                !canNavigate && "bg-gray-100 text-gray-400"
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : !canNavigate ? (
                <Lock className="h-3 w-3" />
              ) : (
                stepNumber
              )}
            </div>

            {/* Step Title */}
            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  "text-sm font-medium truncate",
                  isActive && "text-blue-900",
                  isCompleted && "text-green-900",
                  !isActive && !isCompleted && canNavigate && "text-gray-700",
                  !canNavigate && "text-gray-400"
                )}
              >
                {title}
              </p>
              
              {/* Step Status */}
              <p className="text-xs text-gray-500 mt-1">
                {isCompleted && "Completo"}
                {isActive && !isCompleted && "Em andamento"}
                {!isActive && !isCompleted && canNavigate && "Pendente"}
                {!canNavigate && "Bloqueado"}
              </p>
            </div>

            {/* Progress Indicator */}
            {stepNumber < totalSteps && (
              <div
                className={cn(
                  "w-px h-6 ml-4",
                  isCompleted && "bg-green-300",
                  !isCompleted && "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};