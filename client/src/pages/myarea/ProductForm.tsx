import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Package, Zap, Loader2 } from "lucide-react";
import { BasicProductForm } from "@/components/product/BasicProductForm";
import { ProductSuppliersManager } from "@/components/product/ProductSuppliersManager";
import { ChannelForm } from "@/components/product/ChannelForm";
import { useProductForm } from "@/hooks/useProductForm";
import { channelNames, defaultChannels } from "@/config/channels";
import { useLocation, useParams } from "wouter";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

const ProductForm = () => {
  const [, setLocation] = useLocation();
  const params = useParams();
  const productId = params.id;
  const isEditMode = !!productId;
  
  // Fetch product data if in edit mode
  const { data: productDetails, isLoading: isLoadingProduct } = useQuery({
    queryKey: ['/api/products', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch product');
      const result = await response.json();
      return result.data;
    },
    enabled: isEditMode
  });
  
  // Map API data to form data structure
  const mappedProductData = productDetails ? {
    name: productDetails.name || '',
    photo: productDetails.photo || '',
    sku: productDetails.sku || '',
    internalCode: productDetails.internalCode || '',
    ean: productDetails.ean || '',
    dimensions: productDetails.dimensions || { length: 0, width: 0, height: 0 },
    weight: parseFloat(productDetails.weight) || 0,
    brand: productDetails.brandId ? productDetails.brandId.toString() : (productDetails.brand || ''),
    category: productDetails.categoryId ? productDetails.categoryId.toString() : '',
    supplierId: productDetails.supplierId?.toString() || '',
    ncm: productDetails.ncm || '',
    costItem: parseFloat(productDetails.costItem) || 0,
    packCost: parseFloat(productDetails.packCost) || 0,
    taxPercent: parseFloat(productDetails.taxPercent) || 0,
    observations: productDetails.observations || ''
  } : undefined;
  
  const {
    formData: productData,
    updateField: handleInputChange,
    handleSubmit,
    isSubmitting,
    errors
  } = useProductForm({
    initialData: mappedProductData,
    onSubmit: async (data) => {
      // Converter canais para formato do banco de dados
      const channelsForDB = Object.entries(channels).map(([type, channelData]) => ({
        type,
        isActive: channelData.enabled,
        data: {
          ...channelData,
          enabled: undefined // Remover o campo enabled do data
        }
      })).filter(channel => {
        // Remover o campo enabled do objeto data
        const { enabled, ...dataWithoutEnabled } = channel.data;
        channel.data = dataWithoutEnabled;
        return true;
      });
      
      const url = isEditMode ? `/api/products/${productId}` : '/api/products';
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          ...data,
          categoryId: data.category ? parseInt(data.category) : null,
          brandId: data.brand ? parseInt(data.brand) : null,
          supplierId: data.supplierId ? parseInt(data.supplierId) : null,
          channels: channelsForDB,
          productSuppliers
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save product');
      }
      
      return response.json();
    },
    onSuccess: () => {
      setLocation('/minha-area/produtos');
    }
  });

  // Channel management state
  const [channels, setChannels] = useState(defaultChannels);
  const [productSuppliers, setProductSuppliers] = useState([]);
  
  // Memoize channels processing for better performance
  const processedChannels = useMemo(() => {
    if (productDetails && isEditMode && productDetails.channels) {
      const updatedChannels = { ...defaultChannels };
      
      productDetails.channels.forEach((channel: any) => {
        if (updatedChannels[channel.type]) {
          updatedChannels[channel.type] = {
            ...updatedChannels[channel.type],
            enabled: channel.isActive,
            ...channel.data
          };
        }
      });
      
      return updatedChannels;
    }
    return defaultChannels;
  }, [productDetails, isEditMode]);
  
  // Update form data when product details are loaded
  useEffect(() => {
    setChannels(processedChannels);
    
    if (productDetails && isEditMode && productDetails.suppliers) {
      setProductSuppliers(productDetails.suppliers);
    }
  }, [processedChannels, productDetails, isEditMode]);
  
  const handleChannelToggle = useCallback((channelKey: string) => {
    setChannels(prev => ({
      ...prev,
      [channelKey]: {
        ...prev[channelKey as keyof typeof prev],
        enabled: !prev[channelKey as keyof typeof prev]?.enabled
      }
    }));
  }, []);
  
  const handleChannelInputChange = useCallback((channelKey: string, field: string, value: any) => {
    setChannels(prev => ({
      ...prev,
      [channelKey]: {
        ...prev[channelKey as keyof typeof prev],
        [field]: value
      }
    }));
  }, []);
  
  const handleSuppliersChange = useCallback((suppliers: any[]) => {
    setProductSuppliers(suppliers);
  }, []);
  
  const handlePhotoUpload = (file: File) => {
    // For now, just create a URL for the file
    const imageUrl = URL.createObjectURL(file);
    handleInputChange('imageUrl', imageUrl);
  };

  // Fetch suppliers, categories and brands
  const { data: suppliersData } = useQuery({
    queryKey: ['/api/suppliers'],
    queryFn: async () => {
      const response = await fetch('/api/suppliers');
      if (!response.ok) throw new Error('Failed to fetch suppliers');
      return response.json();
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['/api/departments'],
    queryFn: async () => {
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error('Failed to fetch departments');
      return response.json();
    },
  });

  const { data: brandsData } = useQuery({
    queryKey: ['/api/brands'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { data: [] };
      }
      
      const response = await fetch('/api/brands', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        return { data: [] };
      }
      return response.json();
    },
  });

  const suppliers = suppliersData?.data || [];
  const categories = categoriesData || [];
  const brands = brandsData || [];
  
  console.log('Brands data:', brandsData);
  console.log('Categories data:', categoriesData);
  console.log('Product details:', productDetails);
  console.log('Current product data form:', productData);
  console.log('🔥 CHANNELS DEBUG:', {
    productDetailsChannels: productDetails?.channels,
    currentChannelsState: channels,
    defaultChannels,
    isEditMode
  });
  
  // Show loading state while fetching product data in edit mode
  if (isEditMode && isLoadingProduct) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <p className="text-lg text-slate-600">Carregando dados do produto...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/minha-area/produtos")}
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {isEditMode ? 'Editar Produto' : 'Adicionar Produto'}
              </h1>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {isEditMode 
                ? 'Atualize as informações do produto e configure os canais de venda'
                : 'Cadastre um novo produto e configure os canais de venda para maximizar seus resultados'}
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
                  onInputChange={(field, value) => {
                    console.log('🔥 Field change in ProductForm:', field, value);
                    console.log('🔥 Current productData before change:', productData);
                    handleInputChange(field, value);
                    console.log('🔥 Current productData after change:', productData);
                  }}
                  onPhotoUpload={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                  }}
                  mockSuppliers={suppliers}
                  mockCategories={categories}
                  mockBrands={brands}
                />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border">
              <div className="p-8">
                <ProductSuppliersManager
                  suppliers={productSuppliers}
                  availableSuppliers={suppliers}
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
                    const channelData = channels[channelKey];
                    if (!channelData) return null;

                    return (
                      <ChannelForm
                        key={channelKey}
                        channelType={channelKey}
                        channelData={channelData}
                        title={channelNames[channelKey]}
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
              onClick={() => setLocation("/minha-area/produtos")} 
              size="lg"
              className="min-w-32"
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                console.log('Save button clicked');
                console.log('Current product data:', productData);
                handleSubmit();
              }} 
              size="lg"
              disabled={isSubmitting}
              className="min-w-32 bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Produto'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;