/**
 * HOOK: useProductModals
 * Gerencia estados de modais para produtos de fornecedores
 * Extraído de SupplierProductsTabSimple.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { SupplierProduct } from './useSupplierProducts';

export interface UseProductModalsReturn {
  // Add Product Modal
  addProductDialogOpen: boolean;
  openAddProductDialog: () => void;
  closeAddProductDialog: () => void;
  
  // Edit Product Modal
  editProductDialogOpen: boolean;
  editingProduct: SupplierProduct | null;
  openEditProductDialog: (product: SupplierProduct) => void;
  closeEditProductDialog: () => void;
  
  // Delete Confirmation Modal
  deleteConfirmOpen: boolean;
  productToDelete: SupplierProduct | null;
  openDeleteConfirm: (product: SupplierProduct) => void;
  closeDeleteConfirm: () => void;
  
  // File Upload Modal
  uploadDialogOpen: boolean;
  openUploadDialog: () => void;
  closeUploadDialog: () => void;
}

export const useProductModals = (): UseProductModalsReturn => {
  // ===== STATE MANAGEMENT =====
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SupplierProduct | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<SupplierProduct | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // ===== ADD PRODUCT MODAL =====
  const openAddProductDialog = useCallback(() => {
    setAddProductDialogOpen(true);
  }, []);

  const closeAddProductDialog = useCallback(() => {
    setAddProductDialogOpen(false);
  }, []);

  // ===== EDIT PRODUCT MODAL =====
  const openEditProductDialog = useCallback((product: SupplierProduct) => {
    setEditingProduct(product);
    setEditProductDialogOpen(true);
  }, []);

  const closeEditProductDialog = useCallback(() => {
    setEditingProduct(null);
    setEditProductDialogOpen(false);
  }, []);

  // ===== DELETE CONFIRMATION MODAL =====
  const openDeleteConfirm = useCallback((product: SupplierProduct) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  }, []);

  const closeDeleteConfirm = useCallback(() => {
    setProductToDelete(null);
    setDeleteConfirmOpen(false);
  }, []);

  // ===== FILE UPLOAD MODAL =====
  const openUploadDialog = useCallback(() => {
    setUploadDialogOpen(true);
  }, []);

  const closeUploadDialog = useCallback(() => {
    setUploadDialogOpen(false);
  }, []);

  // ===== RETURN INTERFACE =====
  return {
    // Add Product Modal
    addProductDialogOpen,
    openAddProductDialog,
    closeAddProductDialog,
    
    // Edit Product Modal
    editProductDialogOpen,
    editingProduct,
    openEditProductDialog,
    closeEditProductDialog,
    
    // Delete Confirmation Modal
    deleteConfirmOpen,
    productToDelete,
    openDeleteConfirm,
    closeDeleteConfirm,
    
    // File Upload Modal
    uploadDialogOpen,
    openUploadDialog,
    closeUploadDialog
  };
};