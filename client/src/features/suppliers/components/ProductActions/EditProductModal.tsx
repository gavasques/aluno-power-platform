/**
 * COMPONENTE: EditProductModal
 * Modal para editar produto do fornecedor
 * Extraído de SupplierProductsTabSimple.tsx para modularização
 */
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupplierProduct } from '../../hooks/useSupplierProducts';

interface EditProductModalProps {
  open: boolean;
  onOpenChange: () => void;
  product: SupplierProduct | null;
  onSubmit: (product: any) => Promise<void>;
  isLoading: boolean;
}

export const EditProductModal = ({
  open,
  onOpenChange,
  product,
  onSubmit,
  isLoading
}: EditProductModalProps) => {
  // ===== FORM STATE =====
  const [formData, setFormData] = useState({
    supplierSku: '',
    productName: '',
    cost: '',
    leadTime: '',
    minimumOrderQuantity: '',
    masterBox: '',
    stock: '',
    description: '',
    category: '',
    brand: '',
    dimensions: '',
    weight: ''
  });

  // ===== EFFECTS =====
  useEffect(() => {
    if (product && open) {
      setFormData({
        supplierSku: product.supplierSku || '',
        productName: product.productName || '',
        cost: product.cost?.toString() || '',
        leadTime: product.leadTime?.toString() || '',
        minimumOrderQuantity: product.minimumOrderQuantity?.toString() || '',
        masterBox: product.masterBox || '',
        stock: product.stock || '',
        description: product.description || '',
        category: product.category || '',
        brand: product.brand || '',
        dimensions: product.dimensions || '',
        weight: product.weight || ''
      });
    }
  }, [product, open]);

  // ===== FORM HANDLERS =====
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = async () => {
    if (!product || !formData.supplierSku || !formData.productName || !formData.cost) {
      return;
    }

    try {
      await onSubmit({
        ...product,
        ...formData,
        cost: formData.cost.replace(/[R$\s.]/g, '').replace(',', '.'),
        leadTime: formData.leadTime ? parseInt(formData.leadTime) : undefined,
        minimumOrderQuantity: formData.minimumOrderQuantity ? parseInt(formData.minimumOrderQuantity) : undefined
      });
    } catch (error) {
      // Error handled by the hook
    }
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Produto</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Código SKU */}
          <div className="space-y-2">
            <Label htmlFor="supplierSku">Código SKU *</Label>
            <Input
              id="supplierSku"
              value={formData.supplierSku}
              onChange={(e) => handleInputChange('supplierSku', e.target.value)}
              placeholder="Ex: ABC123"
              required
            />
          </div>

          {/* Nome do Produto */}
          <div className="space-y-2">
            <Label htmlFor="productName">Nome do Produto *</Label>
            <Input
              id="productName"
              value={formData.productName}
              onChange={(e) => handleInputChange('productName', e.target.value)}
              placeholder="Ex: Smartphone XYZ"
              required
            />
          </div>

          {/* Custo */}
          <div className="space-y-2">
            <Label htmlFor="cost">Custo *</Label>
            <Input
              id="cost"
              value={formData.cost}
              onChange={(e) => handleInputChange('cost', e.target.value)}
              placeholder="Ex: 299,90"
              required
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                <SelectItem value="casa">Casa e Jardim</SelectItem>
                <SelectItem value="roupas">Roupas e Acessórios</SelectItem>
                <SelectItem value="esportes">Esportes</SelectItem>
                <SelectItem value="livros">Livros</SelectItem>
                <SelectItem value="brinquedos">Brinquedos</SelectItem>
                <SelectItem value="outros">Outros</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lead Time */}
          <div className="space-y-2">
            <Label htmlFor="leadTime">Lead Time (dias)</Label>
            <Input
              id="leadTime"
              type="number"
              value={formData.leadTime}
              onChange={(e) => handleInputChange('leadTime', e.target.value)}
              placeholder="Ex: 15"
            />
          </div>

          {/* Quantidade Mínima */}
          <div className="space-y-2">
            <Label htmlFor="minimumOrderQuantity">Quantidade Mínima</Label>
            <Input
              id="minimumOrderQuantity"
              type="number"
              value={formData.minimumOrderQuantity}
              onChange={(e) => handleInputChange('minimumOrderQuantity', e.target.value)}
              placeholder="Ex: 10"
            />
          </div>

          {/* Master Box */}
          <div className="space-y-2">
            <Label htmlFor="masterBox">Master Box</Label>
            <Input
              id="masterBox"
              value={formData.masterBox}
              onChange={(e) => handleInputChange('masterBox', e.target.value)}
              placeholder="Ex: 50 unidades"
            />
          </div>

          {/* Marca */}
          <div className="space-y-2">
            <Label htmlFor="brand">Marca</Label>
            <Input
              id="brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="Ex: Samsung"
            />
          </div>
        </div>

        {/* Campos de linha completa */}
        <div className="space-y-4">
          {/* Estoque */}
          <div className="space-y-2">
            <Label htmlFor="stock">Estoque</Label>
            <Input
              id="stock"
              value={formData.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              placeholder="Ex: 100 unidades"
            />
          </div>

          {/* Dimensões */}
          <div className="space-y-2">
            <Label htmlFor="dimensions">Dimensões</Label>
            <Input
              id="dimensions"
              value={formData.dimensions}
              onChange={(e) => handleInputChange('dimensions', e.target.value)}
              placeholder="Ex: 15x10x5 cm"
            />
          </div>

          {/* Peso */}
          <div className="space-y-2">
            <Label htmlFor="weight">Peso</Label>
            <Input
              id="weight"
              value={formData.weight}
              onChange={(e) => handleInputChange('weight', e.target.value)}
              placeholder="Ex: 0.5 kg"
            />
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descrição detalhada do produto..."
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onOpenChange}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !formData.supplierSku || !formData.productName || !formData.cost}
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};