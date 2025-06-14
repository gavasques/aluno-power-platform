
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft } from "lucide-react";
import { BasicProductForm } from "@/components/product/BasicProductForm";
import { ChannelForm } from "@/components/product/ChannelForm";
import { useProductForm } from "@/hooks/useProductForm";
import { mockSuppliers, mockCategories } from "@/data/mockData";

const ProductForm = () => {
  const {
    productData,
    channels,
    handleInputChange,
    handleChannelToggle,
    handleChannelInputChange,
    handlePhotoUpload,
    handleSubmit,
    navigate
  } = useProductForm();

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
              <BasicProductForm
                productData={productData}
                onInputChange={handleInputChange}
                onPhotoUpload={handlePhotoUpload}
                mockSuppliers={mockSuppliers}
                mockCategories={mockCategories}
              />
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
                onChannelToggle={handleChannelToggle}
                onChannelInputChange={handleChannelInputChange}
              />

              <ChannelForm
                channelType="amazonFBM"
                channelData={channels.amazonFBM}
                title="Amazon FBM"
                onChannelToggle={handleChannelToggle}
                onChannelInputChange={handleChannelInputChange}
              />

              <ChannelForm
                channelType="amazonFBAOnSite"
                channelData={channels.amazonFBAOnSite}
                title="Amazon FBA On Site"
                onChannelToggle={handleChannelToggle}
                onChannelInputChange={handleChannelInputChange}
              />

              <ChannelForm
                channelType="amazonDBA"
                channelData={channels.amazonDBA}
                title="Amazon DBA"
                onChannelToggle={handleChannelToggle}
                onChannelInputChange={handleChannelInputChange}
              />

              <ChannelForm
                channelType="amazonFBA"
                channelData={channels.amazonFBA}
                title="Amazon FBA"
                onChannelToggle={handleChannelToggle}
                onChannelInputChange={handleChannelInputChange}
              />

              <ChannelForm
                channelType="mlME1"
                channelData={channels.mlME1}
                title="ML ME1"
                onChannelToggle={handleChannelToggle}
                onChannelInputChange={handleChannelInputChange}
              />

              <ChannelForm
                channelType="mlFlex"
                channelData={channels.mlFlex}
                title="ML Flex"
                onChannelToggle={handleChannelToggle}
                onChannelInputChange={handleChannelInputChange}
              />

              <ChannelForm
                channelType="mlEnvios"
                channelData={channels.mlEnvios}
                title="ML Envios"
                onChannelToggle={handleChannelToggle}
                onChannelInputChange={handleChannelInputChange}
              />

              <ChannelForm
                channelType="mlFull"
                channelData={channels.mlFull}
                title="ML Full"
                onChannelToggle={handleChannelToggle}
                onChannelInputChange={handleChannelInputChange}
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
