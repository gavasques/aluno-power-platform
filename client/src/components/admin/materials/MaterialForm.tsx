import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MaterialFormTabs } from './MaterialFormTabs';
import type { MaterialFormProps } from './MaterialFormTypes';

export const MaterialForm: React.FC<MaterialFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  editingMaterial,
  materialTypes,
  isOpen,
  onClose,
}) => {
  const [currentTag, setCurrentTag] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingMaterial ? 'Editar Material' : 'Novo Material'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <MaterialFormTabs
            formData={formData}
            setFormData={setFormData}
            materialTypes={materialTypes}
            currentTag={currentTag}
            setCurrentTag={setCurrentTag}
          />
          
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingMaterial ? 'Atualizar Material' : 'Criar Material'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};