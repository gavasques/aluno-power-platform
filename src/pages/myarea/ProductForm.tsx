
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Product, ProductChannels } from "@/types/product";
import { formatCurrency } from "@/utils/productCalculations";

const mockSuppliers = [
  { id: "1", tradeName: "Supplier Tech Ltda" },
  { id: "2", tradeName: "Global Import Co" },
  { id: "3", tradeName: "Prime Electronics" }
];

const mockCategories = [
  { id: "1", name: "Eletrônicos" },
  { id: "2", name: "Roupas e Acessórios" },
  { id: "3", name: "Casa e Jardim" },
  { id: "4", name: "Esportes" },
  { id: "5", name: "Automotivo" }
];

const ProductForm = () => {
  const navigate = useNavigate();
  const [productData, setProductData] = useState({
    name: "",
    photo: "",
    ean: "",
    dimensions: { length: 0, width: 0, height: 0 },
    weight: 0,
    brand: "",
    category: "",
    supplierId: "",
    ncm: "",
    costItem: 0,
    packCost: 0,
    taxPercent: 0
  });

  const [channels, setChannels] = useState<ProductChannels>({
    sitePropio: {
      enabled: false,
      commissionPct: 0,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      salePrice: 0
    },
    amazonFBM: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      salePrice: 0
    },
    amazonFBAOnSite: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      salePrice: 0
    },
    amazonDBA: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      salePrice: 0
    },
    amazonFBA: {
      enabled: false,
      commissionPct: 15,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      inboundFreight: 0,
      prepCenter: 0,
      salePrice: 0
    },
    mlME1: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      salePrice: 0
    },
    mlFlex: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      flexRevenue: 0,
      salePrice: 0
    },
    mlEnvios: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      outboundFreight: 0,
      salePrice: 0
    },
    mlFull: {
      enabled: false,
      commissionPct: 14,
      fixedFee: 0,
      otherPct: 0,
      otherValue: 0,
      adsPct: 0,
      inboundFreight: 0,
      prepCenter: 0,
      salePrice: 0
    }
  });

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setProductData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as object),
          [child]: value
        }
      }));
    } else {
      setProductData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleChannelToggle = (channelType: keyof ProductChannels) => {
    setChannels(prev => ({
      ...prev,
      [channelType]: {
        ...prev[channelType]!,
        enabled: !prev[channelType]!.enabled
      }
    }));
  };

  const handleChannelInputChange = (channelType: keyof ProductChannels, field: string, value: number) => {
    setChannels(prev => ({
      ...prev,
      [channelType]: {
        ...prev[channelType]!,
        [field]: value
      }
    }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "A foto deve ter no máximo 3MB.",
          variant: "destructive"
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setProductData(prev => ({ ...prev, photo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    // Validação básica
    if (!productData.name || !productData.brand || !productData.supplierId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha pelo menos nome, marca e fornecedor.",
        variant: "destructive"
      });
      return;
    }

    // Simular salvamento
    toast({
      title: "Produto salvo",
      description: "O produto foi cadastrado com sucesso."
    });
    
    navigate("/minha-area/produtos");
  };

  const ChannelForm = ({ channelType, channelData, title }: { 
    channelType: keyof ProductChannels, 
    channelData: any, 
    title: string 
  }) => (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <Switch
            checked={channelData?.enabled || false}
            onCheckedChange={() => handleChannelToggle(channelType)}
          />
        </div>
      </CardHeader>
      {channelData?.enabled && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Comissão (%)</Label>
              <Input
                type="number"
                value={channelData.commissionPct}
                onChange={(e) => handleChannelInputChange(channelType, 'commissionPct', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Taxa Fixa (R$)</Label>
              <Input
                type="number"
                value={channelData.fixedFee}
                onChange={(e) => handleChannelInputChange(channelType, 'fixedFee', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Outro Custo (%)</Label>
              <Input
                type="number"
                value={channelData.otherPct}
                onChange={(e) => handleChannelInputChange(channelType, 'otherPct', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Outro Custo (R$)</Label>
              <Input
                type="number"
                value={channelData.otherValue}
                onChange={(e) => handleChannelInputChange(channelType, 'otherValue', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Custo com Ads (%)</Label>
              <Input
                type="number"
                value={channelData.adsPct}
                onChange={(e) => handleChannelInputChange(channelType, 'adsPct', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Preço de Venda (R$)</Label>
              <Input
                type="number"
                value={channelData.salePrice}
                onChange={(e) => handleChannelInputChange(channelType, 'salePrice', Number(e.target.value))}
              />
            </div>
            
            {/* Campos específicos por canal */}
            {(channelType === 'amazonFBM' || channelType === 'amazonFBAOnSite' || channelType === 'amazonDBA' || channelType === 'mlFlex' || channelType === 'mlEnvios') && (
              <div>
                <Label>Frete Outbound (R$)</Label>
                <Input
                  type="number"
                  value={channelData.outboundFreight || 0}
                  onChange={(e) => handleChannelInputChange(channelType, 'outboundFreight', Number(e.target.value))}
                />
              </div>
            )}
            
            {(channelType === 'amazonFBA' || channelType === 'mlFull') && (
              <>
                <div>
                  <Label>Frete Inbound (R$)</Label>
                  <Input
                    type="number"
                    value={channelData.inboundFreight || 0}
                    onChange={(e) => handleChannelInputChange(channelType, 'inboundFreight', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Prep Center (R$)</Label>
                  <Input
                    type="number"
                    value={channelData.prepCenter || 0}
                    onChange={(e) => handleChannelInputChange(channelType, 'prepCenter', Number(e.target.value))}
                  />
                </div>
              </>
            )}
            
            {channelType === 'mlFlex' && (
              <div>
                <Label>Receita ML Flex (R$)</Label>
                <Input
                  type="number"
                  value={channelData.flexRevenue || 0}
                  onChange={(e) => handleChannelInputChange(channelType, 'flexRevenue', Number(e.target.value))}
                />
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/minha-area/produtos")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Produtos
        </Button>
        <h1 className="text-3xl font-bold">Adicionar Produto</h1>
        <p className="text-muted-foreground">
          Cadastre um novo produto e configure os canais de venda
        </p>
      </div>

      <Tabs defaultValue="basico" className="space-y-6">
        <TabsList>
          <TabsTrigger value="basico">Dados Básicos</TabsTrigger>
          <TabsTrigger value="canais">Canais de Venda</TabsTrigger>
        </TabsList>

        <TabsContent value="basico">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas do Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Nome do Produto *</Label>
                    <Input
                      value={productData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Digite o nome do produto"
                    />
                  </div>

                  <div>
                    <Label>EAN/UPC/GTIN</Label>
                    <Input
                      value={productData.ean}
                      onChange={(e) => handleInputChange('ean', e.target.value)}
                      placeholder="Código de barras"
                    />
                  </div>

                  <div>
                    <Label>Marca *</Label>
                    <Input
                      value={productData.brand}
                      onChange={(e) => handleInputChange('brand', e.target.value)}
                      placeholder="Marca do produto"
                    />
                  </div>

                  <div>
                    <Label>Categoria *</Label>
                    <Select value={productData.category} onValueChange={(value) => handleInputChange('category', value)}>
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
                    <Select value={productData.supplierId} onValueChange={(value) => handleInputChange('supplierId', value)}>
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
                      onChange={(e) => handleInputChange('ncm', e.target.value)}
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
                        onChange={handlePhotoUpload}
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
                        onChange={(e) => handleInputChange('dimensions.length', Number(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="L"
                        value={productData.dimensions.width}
                        onChange={(e) => handleInputChange('dimensions.width', Number(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="A"
                        value={productData.dimensions.height}
                        onChange={(e) => handleInputChange('dimensions.height', Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Peso com a Caixa (kg)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={productData.weight}
                      onChange={(e) => handleInputChange('weight', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Custo do Item (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={productData.costItem}
                      onChange={(e) => handleInputChange('costItem', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Custo de Embalagem (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={productData.packCost}
                      onChange={(e) => handleInputChange('packCost', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <Label>Imposto Global (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={productData.taxPercent}
                      onChange={(e) => handleInputChange('taxPercent', Number(e.target.value))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="canais">
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ChannelForm
                channelType="sitePropio"
                channelData={channels.sitePropio}
                title="Site Próprio"
              />

              <ChannelForm
                channelType="amazonFBM"
                channelData={channels.amazonFBM}
                title="Amazon FBM"
              />

              <ChannelForm
                channelType="amazonFBAOnSite"
                channelData={channels.amazonFBAOnSite}
                title="Amazon FBA On Site"
              />

              <ChannelForm
                channelType="amazonDBA"
                channelData={channels.amazonDBA}
                title="Amazon DBA"
              />

              <ChannelForm
                channelType="amazonFBA"
                channelData={channels.amazonFBA}
                title="Amazon FBA"
              />

              <ChannelForm
                channelType="mlME1"
                channelData={channels.mlME1}
                title="ML ME1"
              />

              <ChannelForm
                channelType="mlFlex"
                channelData={channels.mlFlex}
                title="ML Flex"
              />

              <ChannelForm
                channelType="mlEnvios"
                channelData={channels.mlEnvios}
                title="ML Envios"
              />

              <ChannelForm
                channelType="mlFull"
                channelData={channels.mlFull}
                title="ML Full"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 pt-6">
        <Button onClick={handleSubmit} size="lg">
          Salvar Produto
        </Button>
        <Button variant="outline" onClick={() => navigate("/minha-area/produtos")} size="lg">
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default ProductForm;
