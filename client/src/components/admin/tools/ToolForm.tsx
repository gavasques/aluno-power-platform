import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ToolFormTabs } from './ToolFormTabs';
import type { ToolFormProps } from './ToolFormTypes';

export const ToolForm: React.FC<ToolFormProps> = ({
  formData,
  setFormData,
  onSubmit,
  editingTool,
  toolTypes,
  isOpen,
  onClose,
}) => {
  const [currentFeature, setCurrentFeature] = React.useState("");
  const [currentPro, setCurrentPro] = React.useState("");
  const [currentCon, setCurrentCon] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingTool ? 'Editar Ferramenta' : 'Nova Ferramenta'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="mt-4">
          <ToolFormTabs
            formData={formData}
            setFormData={setFormData}
            editingTool={editingTool}
            toolTypes={toolTypes}
            currentFeature={currentFeature}
            setCurrentFeature={setCurrentFeature}
            currentPro={currentPro}
            setCurrentPro={setCurrentPro}
            currentCon={currentCon}
            setCurrentCon={setCurrentCon}
          />
          
          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {editingTool ? 'Atualizar Ferramenta' : 'Criar Ferramenta'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};