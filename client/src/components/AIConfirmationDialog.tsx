import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Wand2 } from 'lucide-react';

interface AIConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
  generatedText: string;
}

export const AIConfirmationDialog: React.FC<AIConfirmationDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  generatedText
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-4xl max-h-[85vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            Descrição Gerada pela IA
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>A IA gerou uma nova descrição otimizada para seu produto. Deseja substituir o conteúdo atual?</p>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-md border">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium text-gray-700">Prévia da descrição gerada:</p>
                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                  {generatedText.length} caracteres
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto bg-white p-4 rounded border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {generatedText}
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            Manter Original
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Substituir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};