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

interface ReplaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplace: () => void;
  onKeepBoth: () => void;
}

export const ReplaceDialog: React.FC<ReplaceDialogProps> = ({
  open,
  onOpenChange,
  onReplace,
  onKeepBoth
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Substituir Bullet Points?</AlertDialogTitle>
          <AlertDialogDescription>
            Você já possui bullet points gerados. O que deseja fazer com os novos bullet points?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => onOpenChange(false)}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction onClick={onKeepBoth} className="bg-blue-600 hover:bg-blue-700">
            Manter Ambos
          </AlertDialogAction>
          <AlertDialogAction onClick={onReplace} className="bg-red-600 hover:bg-red-700">
            Substituir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};