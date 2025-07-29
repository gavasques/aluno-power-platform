/**
 * COMPONENTE: DeleteConfirmModal
 * Modal de confirmação para remoção de produto
 * Extraído de SupplierProductsTabSimple.tsx para modularização
 */
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { SupplierProduct } from '../../hooks/useSupplierProducts';

interface DeleteConfirmModalProps {
  open: boolean;
  onOpenChange: () => void;
  product: SupplierProduct | null;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
}

export const DeleteConfirmModal = ({
  open,
  onOpenChange,
  product,
  onConfirm,
  isLoading
}: DeleteConfirmModalProps) => {
  if (!product) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja remover o produto "{product.productName}" (Código: {product.supplierSku}) do catálogo do fornecedor?
            <br /><br />
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? 'Removendo...' : 'Remover'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};