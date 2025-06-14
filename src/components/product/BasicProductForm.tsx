
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface BasicProductFormProps {
  productData: {
    name: string;
    photo: string;
    ean: string;
    dimensions: { length: number; width: number; height: number };
    weight: number;
    brand: string;
    category: string;
    supplierId: string;
    ncm: string;
    costItem: number;
    packCost: number;
    taxPercent: number;
  };
  onInputChange: (field: string, value: any) => void;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  mockSuppliers: Array<{ id: string; tradeName: string }>;
  mockCategories: Array<{ id: string; name: string }>;
}

export const BasicProductForm = ({ 
  productData, 
  onInputChange, 
  onPhotoUpload, 
  mockSuppliers, 
  mockCategories 
}: BasicProductFormProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <Label>Nome do Produto *</Label>
          <Input
            value={productData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder="Digite o nome do produto"
          />
        </div>

        <div>
          <Label>EAN/UPC/GTIN</Label>
          <Input
            value={productData.ean}
            onChange={(e) => onInputChange('ean', e.target.value)}
            placeholder="Código de barras"
          />
        </div>

        <div>
          <Label>Marca *</Label>
          <Input
            value={productData.brand}
            onChange={(e) => onInputChange('brand', e.target.value)}
            placeholder="Marca do produto"
          />
        </div>

        <div>
          <Label>Categoria *</Label>
          <Select value={productData.category} onValueChange={(value) => onInputChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {mockCategories.map(cat => (
                <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Fornecedor *</Label>
          <Select value={productData.supplierId} onValueChange={(value) => onInputChange('supplierId', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um fornecedor" />
            </SelectTrigger>
            <SelectContent>
              {mockSuppliers.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>{supplier.tradeName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>NCM</Label>
          <Input
            value={productData.ncm}
            onChange={(e) => onInputChange('ncm', e.target.value)}
            placeholder="Código NCM"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Foto do Produto (máx. 3MB)</Label>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            {productData.photo ? (
              <img 
                src={productData.photo} 
                alt="Preview" 
                className="w-32 h-32 object-cover mx-auto rounded-lg mb-4"
              />
            ) : (
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={onPhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <Button type="button" variant="outline" className="pointer-events-none">
                Escolher Arquivo
              </Button>
            </Label>
          </div>
        </div>

        <div>
          <Label>Dimensões na Caixa (cm)</Label>
          <div className="grid grid-cols-3 gap-2">
            <Input
              type="number"
              placeholder="C"
              value={productData.dimensions.length}
              onChange={(e) => onInputChange('dimensions.length', Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="L"
              value={productData.dimensions.width}
              onChange={(e) => onInputChange('dimensions.width', Number(e.target.value))}
            />
            <Input
              type="number"
              placeholder="A"
              value={productData.dimensions.height}
              onChange={(e) => onInputChange('dimensions.height', Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <Label>Peso com a Caixa (kg)</Label>
          <Input
            type="number"
            step="0.01"
            value={productData.weight}
            onChange={(e) => onInputChange('weight', Number(e.target.value))}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label>Custo do Item (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={productData.costItem}
            onChange={(e) => onInputChange('costItem', Number(e.target.value))}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label>Custo de Embalagem (R$)</Label>
          <Input
            type="number"
            step="0.01"
            value={productData.packCost}
            onChange={(e) => onInputChange('packCost', Number(e.target.value))}
            placeholder="0.00"
          />
        </div>

        <div>
          <Label>Imposto Global (%)</Label>
          <Input
            type="number"
            step="0.01"
            value={productData.taxPercent}
            onChange={(e) => onInputChange('taxPercent', Number(e.target.value))}
            placeholder="0.00"
          />
        </div>
      </div>
    </div>
  );
};
