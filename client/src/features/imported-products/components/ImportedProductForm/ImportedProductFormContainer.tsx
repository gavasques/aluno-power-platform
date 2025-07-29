/**
 * CONTAINER: ImportedProductFormContainer
 * Lógica de negócio para formulário de produtos importados
 * Extraído de ImportedProductForm.tsx para modularização
 */
import { useImportedProductForm } from '../../hooks/useImportedProductForm';
import { ImportedProductFormPresentation } from './ImportedProductFormPresentation';
import { ImportedProductFormContainerProps } from '../../types';

export const ImportedProductFormContainer = ({
  productId,
  mode = 'create',
  onSuccess,
  onCancel
}: ImportedProductFormContainerProps) => {
  // ===== HOOKS INTEGRATION =====
  const formHook = useImportedProductForm(productId, mode);

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    state: formHook.state,
    actions: formHook.actions,
    validation: formHook.validation,
    navigation: formHook.navigation,
    onSuccess,
    onCancel
  };

  return <ImportedProductFormPresentation {...containerProps} />;
};