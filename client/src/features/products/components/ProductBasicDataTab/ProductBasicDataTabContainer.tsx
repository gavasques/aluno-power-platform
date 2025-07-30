/**
 * CONTAINER: ProductBasicDataTabContainer
 * Lógica de negócio para dados básicos de produtos
 * Extraído de ProductBasicDataTab.tsx para modularização
 */
import { useProductBasicData } from '../../hooks/useProductBasicData';
import { ProductBasicDataTabPresentation } from './ProductBasicDataTabPresentation';
import { ProductBasicDataTabContainerProps } from '../../types';

export const ProductBasicDataTabContainer = ({
  productId,
  readOnly = false,
  onSave,
  onCancel,
  showAdvancedFields = true,
  allowImageUpload = true,
  maxImages = 10
}: ProductBasicDataTabContainerProps) => {
  // ===== HOOKS INTEGRATION =====
  const productBasicData = useProductBasicData(productId);

  // ===== SIDE EFFECTS =====
  // Handle external save callback
  const handleSave = async () => {
    try {
      const savedProduct = await productBasicData.actions.save();
      if (onSave) {
        onSave(savedProduct);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  // Handle external cancel callback
  const handleCancel = () => {
    if (productBasicData.form.isDirty) {
      if (window.confirm('Há alterações não salvas. Deseja realmente cancelar?')) {
        productBasicData.actions.reset();
        if (onCancel) {
          onCancel();
        }
      }
    } else {
      if (onCancel) {
        onCancel();
      }
    }
  };

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    state: productBasicData.state,
    product: productBasicData.product,
    categories: productBasicData.categories,
    brands: productBasicData.brands,
    form: productBasicData.form,
    actions: {
      ...productBasicData.actions,
      save: handleSave,
      cancel: handleCancel
    },
    images: productBasicData.images,
    readOnly,
    showAdvancedFields,
    allowImageUpload,
    maxImages
  };

  return <ProductBasicDataTabPresentation {...containerProps} />;
};