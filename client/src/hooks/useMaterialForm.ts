import { useState } from 'react';
import type { Material as DbMaterial } from '@shared/schema';
import type { MaterialFormData } from '@/components/admin/materials/MaterialFormTypes';
import { MaterialService } from '@/services/materialService';

export const useMaterialForm = () => {
  const [formData, setFormData] = useState<MaterialFormData>(MaterialService.createEmptyFormData());
  const [editingMaterial, setEditingMaterial] = useState<DbMaterial | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const resetForm = () => {
    setFormData(MaterialService.createEmptyFormData());
    setEditingMaterial(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (material: DbMaterial) => {
    setFormData(MaterialService.convertDbMaterialToFormData(material));
    setEditingMaterial(material);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const validateForm = () => {
    return MaterialService.validateFormData(formData);
  };

  const getInsertMaterialData = (uploadedBy: number) => {
    return MaterialService.convertFormDataToInsertMaterial(formData, uploadedBy);
  };

  return {
    formData,
    setFormData,
    editingMaterial,
    isDialogOpen,
    resetForm,
    openCreateDialog,
    openEditDialog,
    closeDialog,
    validateForm,
    getInsertMaterialData,
  };
};