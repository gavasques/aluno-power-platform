import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormattedInput } from "@/components/ui/formatted-input";
import { Upload, Package, Ruler, DollarSign, Hash, Building2, Tag, Code, FileText } from "lucide-react";
import { ImageFallback } from "@/components/ui/image-fallback";

interface BasicProductFormProps {
  productData: {
    name: string;
    photo: string;
    sku: string;
    internalCode: string;
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
    observations?: string;
  };
  onInputChange: (field: string, value: any) => void;
  onPhotoUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  mockSuppliers: Array<{ id: string; tradeName: string }>;
  mockCategories: Array<{ id: string; name: string }>;
  onOpenDescriptions?: () => void;
}

export const BasicProductForm = ({ 
  productData, 
  onInputChange, 
  onPhotoUpload, 
  mockSuppliers, 
  mockCategories,
  onOpenDescriptions
}: BasicProductFormProps) => {
  return (
    <div className="space-y-8">
      {/* Photo Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Foto do Produto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
            {productData.photo ? (
              <div className="space-y-4">
                <img 
                  src={productData.photo} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover mx-auto rounded-lg border-2 border-muted"
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', productData.photo);
                    e.currentTarget.style.display = 'none';
                  }}
                  onLoad={() => {
                    console.log('Imagem carregada com sucesso:', productData.photo);
                  }}
                />
                <p className="text-sm text-muted-foreground">Clique para alterar a foto</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-medium">Adicionar foto do produto</p>
                  <p className="text-sm text-muted-foreground">PNG, JPG até 3MB</p>
                </div>
              </div>
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={onPhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <Label htmlFor="photo-upload" className="cursor-pointer">
              <Button type="button" variant="outline" className="pointer-events-none mt-4">
                {productData.photo ? "Alterar Foto" : "Escolher Arquivo"}
              </Button>
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Nome do Produto *</Label>
              <Input
                value={productData.name}
                onChange={(e) => onInputChange('name', e.target.value)}
                placeholder="Digite o nome do produto"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Marca *</Label>
              <div className="relative mt-1">
                <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={productData.brand}
                  onChange={(e) => onInputChange('brand', e.target.value)}
                  placeholder="Marca do produto"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Categoria *</Label>
              <Select value={productData.category} onValueChange={(value) => onInputChange('category', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {mockCategories?.map(cat => (
                    <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Fornecedor Principal *</Label>
              <Select value={productData.supplierId} onValueChange={(value) => onInputChange('supplierId', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um fornecedor" />
                </SelectTrigger>
                <SelectContent>
                  {mockSuppliers?.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>{supplier.tradeName}</SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">SKU</Label>
              <div className="relative mt-1">
                <Code className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={productData.sku || ''}
                  onChange={(e) => onInputChange('sku', e.target.value)}
                  placeholder="Código SKU"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Código Interno</Label>
              <div className="relative mt-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={productData.internalCode || ''}
                  onChange={(e) => onInputChange('internalCode', e.target.value)}
                  placeholder="Código interno"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">EAN/UPC/GTIN</Label>
              <div className="relative mt-1">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={productData.ean}
                  onChange={(e) => onInputChange('ean', e.target.value)}
                  placeholder="Código de barras"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">NCM</Label>
              <div className="relative mt-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={productData.ncm}
                  onChange={(e) => onInputChange('ncm', e.target.value)}
                  placeholder="Código NCM"
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Observações do Produto</Label>
              <Textarea
                value={productData.observations || ''}
                onChange={(e) => onInputChange('observations', e.target.value)}
                placeholder="Digite observações importantes sobre o produto..."
                className="mt-1 min-h-[100px]"
              />
            </div>

            {onOpenDescriptions && (
              <div>
                <Label className="text-sm font-medium">Descrições</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onOpenDescriptions}
                  className="w-full mt-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Gerenciar Descrições do Produto
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Configure descrição, HTML, bullet points e ficha técnica
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dimensions & Weight */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Dimensões & Peso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Dimensões na Caixa (cm)</Label>
                <div className="grid grid-cols-3 gap-3 mt-1">
                  <div>
                    <Input
                      type="number"
                      placeholder="Comprimento"
                      value={productData.dimensions.length || ''}
                      onChange={(e) => onInputChange('dimensions.length', Number(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">C</p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Largura"
                      value={productData.dimensions.width || ''}
                      onChange={(e) => onInputChange('dimensions.width', Number(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">L</p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Altura"
                      value={productData.dimensions.height || ''}
                      onChange={(e) => onInputChange('dimensions.height', Number(e.target.value) || 0)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">A</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Peso com a Caixa (kg)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={productData.weight || ''}
                  onChange={(e) => onInputChange('weight', Number(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Costs & Taxes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Custos & Impostos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-sm font-medium">Custo do Item</Label>
                <FormattedInput
                  type="currency"
                  value={productData.costItem}
                  onChange={(value) => onInputChange('costItem', value)}
                  placeholder="R$ 0,00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Custo de Embalagem</Label>
                <FormattedInput
                  type="currency"
                  value={productData.packCost}
                  onChange={(value) => onInputChange('packCost', value)}
                  placeholder="R$ 0,00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Imposto Global</Label>
                <FormattedInput
                  type="percentage"
                  value={productData.taxPercent}
                  onChange={(value) => onInputChange('taxPercent', value)}
                  placeholder="0,00%"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};