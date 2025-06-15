
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Code, List, Settings } from "lucide-react";
import { ProductDescriptions } from "@/types/product";
import { toast } from "@/hooks/use-toast";

interface ProductDescriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  descriptions: ProductDescriptions;
  onSave: (descriptions: ProductDescriptions) => void;
}

export const ProductDescriptionsModal = ({
  isOpen,
  onClose,
  descriptions,
  onSave
}: ProductDescriptionsModalProps) => {
  const [editedDescriptions, setEditedDescriptions] = useState<ProductDescriptions>(descriptions);

  const handleInputChange = (field: keyof ProductDescriptions, value: string) => {
    setEditedDescriptions(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave(editedDescriptions);
    toast({
      title: "Descrições atualizadas",
      description: "As descrições do produto foram salvas com sucesso."
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Descrições do Produto</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="description" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Descrição
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-2">
              <Code className="h-4 w-4" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="bullets" className="flex items-center gap-2">
              <List className="h-4 w-4" />
              Bullet Points
            </TabsTrigger>
            <TabsTrigger value="technical" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Ficha Técnica
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Descrição do Produto</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Descreva o produto de forma clara e detalhada para seus clientes.
              </p>
              <Textarea
                value={editedDescriptions.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Digite a descrição do produto..."
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="html" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Descrição em HTML</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Use HTML para formatar a descrição com estilos personalizados.
              </p>
              <Textarea
                value={editedDescriptions.htmlDescription || ''}
                onChange={(e) => handleInputChange('htmlDescription', e.target.value)}
                placeholder="<p>Digite a descrição com tags HTML...</p>"
                className="min-h-[200px] font-mono text-sm"
              />
            </div>
          </TabsContent>

          <TabsContent value="bullets" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Bullet Points</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Liste os principais benefícios e características do produto.
              </p>
              <Textarea
                value={editedDescriptions.bulletPoints || ''}
                onChange={(e) => handleInputChange('bulletPoints', e.target.value)}
                placeholder="• Característica 1&#10;• Característica 2&#10;• Característica 3"
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>

          <TabsContent value="technical" className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Ficha Técnica</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Especificações técnicas detalhadas do produto.
              </p>
              <Textarea
                value={editedDescriptions.technicalSpecs || ''}
                onChange={(e) => handleInputChange('technicalSpecs', e.target.value)}
                placeholder="Dimensões: 10x20x30cm&#10;Peso: 1kg&#10;Material: Plástico ABS&#10;Cor: Preto"
                className="min-h-[200px]"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-4 pt-6 border-t">
          <Button onClick={handleSave} size="lg">
            Salvar Descrições
          </Button>
          <Button variant="outline" onClick={onClose} size="lg">
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
