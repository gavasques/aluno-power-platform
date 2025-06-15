import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, Zap } from "lucide-react";
import { BasicProductForm } from "@/components/product/BasicProductForm";
import { ProductSuppliersManager } from "@/components/product/ProductSuppliersManager";
import { ChannelForm } from "@/components/product/ChannelForm";
import { useProductForm } from "@/hooks/useProductForm";
import { mockSuppliers, mockCategories } from "@/data/mockData";
import { channelNames } from "@/config/channels";

const ProductForm = () => {
  const {
    productData,
    channels,
    productSuppliers,
    handleInputChange,
    handleChannelToggle,
    handleChannelInputChange,
    handleSuppliersChange,
    handlePhotoUpload,
    handleSubmit,
    navigate
  } = useProductForm();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/minha-area/produtos")}
            className="mb-6 hover:bg-white/80 dark:hover:bg-slate-800/80"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Produtos
          </Button>
          
          <div className="bg-white dark:bg-slate-900 rounded-xl p-8 shadow-sm border">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Adicionar Produto</h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Cadastre um novo produto e configure os canais de venda para maximizar seus resultados
            </p>
          </div>
        </div>

        {/* Form Content */}
        <Tabs defaultValue="basico" className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-2 shadow-sm border">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="basico" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                <Package className="h-4 w-4" />
                Dados Básicos
              </TabsTrigger>
              <TabsTrigger value="canais" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                <Zap className="h-4 w-4" />
                Canais de Venda
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basico" className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border">
              <div className="p-8">
                <BasicProductForm
                  productData={productData}
                  onInputChange={handleInputChange}
                  onPhotoUpload={handlePhotoUpload}
                  mockSuppliers={mockSuppliers}
                  mockCategories={mockCategories}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border">
              <div className="p-8">
                <ProductSuppliersManager
                  suppliers={productSuppliers}
                  availableSuppliers={mockSuppliers}
                  onSuppliersChange={handleSuppliersChange}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="canais" className="space-y-0">
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border">
              <div className="p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    Configure os Canais de Venda
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400">
                    Ative e configure os marketplaces onde você deseja vender este produto
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.keys(channelNames).map((channelKey) => {
                    const key = channelKey as keyof typeof channelNames;
                    const channelData = channels[key];
                    if (!channelData) return null;

                    return (
                      <ChannelForm
                        key={key}
                        channelType={key}
                        channelData={channelData}
                        title={channelNames[key]}
                        productTaxPercent={productData.taxPercent}
                        onChannelToggle={handleChannelToggle}
                        onChannelInputChange={handleChannelInputChange}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border">
          <div className="flex gap-4 justify-end">
            <Button 
              variant="outline" 
              onClick={() => navigate("/minha-area/produtos")} 
              size="lg"
              className="min-w-32"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit} 
              size="lg"
              className="min-w-32 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Salvar Produto
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
