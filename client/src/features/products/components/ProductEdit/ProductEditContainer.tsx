/**
 * CONTAINER: ProductEditContainer
 * Lógica de negócio para edição de produtos
 * Extraído de ProductEdit.tsx para modularização
 */
import React from 'react';
import { useProductEdit } from '../../hooks/useProductEdit';
import { ProductEditPresentation } from './ProductEditPresentation';
import { ProductEditContainerProps } from '../../types/productEdit';

export const ProductEditContainer = ({
  productId,
  onSuccess,
  onCancel,
  readOnly = false,
  showTabs = false,
  defaultTab = 'basic'
}: ProductEditContainerProps) => {
  // ===== HOOKS INTEGRATION =====
  const productEditData = useProductEdit(productId, onSuccess, onCancel);

  // Set default tab if provided
  React.useEffect(() => {
    if (defaultTab && defaultTab !== productEditData.state.activeTab) {
      productEditData.actions.setActiveTab(defaultTab);
    }
  }, [defaultTab, productEditData.actions, productEditData.state.activeTab]);

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    state: productEditData.state,
    productData: productEditData.productData,
    suppliersData: productEditData.suppliersData,
    brandsData: productEditData.brandsData,
    categoriesData: productEditData.categoriesData,
    actions: productEditData.actions,
    utils: productEditData.utils,
    readOnly,
    showTabs
  };

  return <ProductEditPresentation {...containerProps} />;
};