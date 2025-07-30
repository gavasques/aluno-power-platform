/**
 * PRESENTATION: ProductEditWithTabsPresentation
 * Pure UI component for product editing with tabs functionality
 * Extracted from ProductEditWithTabs.tsx (680 lines) for modularization
 */
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Loader2, Package, Ruler, Camera, Users } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BasicInfoTab } from './components/BasicInfoTab';
import { DimensionsTab } from './components/DimensionsTab';
import { PhotoTab } from './components/PhotoTab';
import { SuppliersTab } from './components/SuppliersTab';
import { PRODUCT_TABS } from './types';
import type { UseFormReturn } from 'react-hook-form';
import type { ProductFormData, Product, Supplier, Brand, Category, ProductEditState, ProductEditActions } from './types';

interface ProductEditWithTabsPresentationProps {
  // State
  state: ProductEditState & { hasChanges: boolean };
  
  // Data
  product?: Product;
  suppliers: Supplier[];
  brands: Brand[];
  categories: Category[];
  
  // Loading states
  productLoading: boolean;
  productError: any;
  
  // Form
  form: UseFormReturn<ProductFormData>;
  
  // Actions
  actions: ProductEditActions;
}

const iconMap = {
  Package,
  Ruler,
  Camera,
  Users
};

export const ProductEditWithTabsPresentation = memo<ProductEditWithTabsPresentationProps>(({
  state,
  product,
  suppliers,
  brands,
  categories,
  productLoading,
  productError,
  form,
  actions
}) => {
  if (productLoading) {
    return <LoadingSpinner message="Carregando produto..." />;
  }

  if (productError) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Erro ao carregar produto</h3>
            <p className="text-muted-foreground mb-4">
              {productError.message || 'Não foi possível carregar os dados do produto.'}
            </p>
            <Button onClick={actions.goBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={actions.goBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {product ? `Editar: ${product.name}` : 'Carregando...'}
            </h1>
            <p className="text-muted-foreground">
              Gerencie as informações do seu produto
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Active Status */}
          <div className="flex items-center gap-2">
            <Label htmlFor="active">Produto Ativo</Label>
            <Switch
              id="active"
              checked={form.watch('active')}
              onCheckedChange={(checked) => form.setValue('active', checked)}
            />
          </div>
          
          {/* Save Button */}
          <Button 
            onClick={actions.submitForm} 
            disabled={state.isSubmitting || !state.hasChanges}
          >
            {state.isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Tabs */}
      <Form {...form}>
        <Tabs value={state.activeTab} onValueChange={actions.setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            {PRODUCT_TABS.map((tab) => {
              const Icon = iconMap[tab.icon as keyof typeof iconMap];
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <BasicInfoTab
              form={form}
              suppliers={suppliers}
              brands={brands}
              categories={categories}
            />
          </TabsContent>

          <TabsContent value="dimensions" className="space-y-6">
            <DimensionsTab form={form} />
          </TabsContent>

          <TabsContent value="photo" className="space-y-6">
            <PhotoTab
              product={product}
              photoPreview={state.photoPreview}
              uploadingPhoto={state.uploadingPhoto}
              onPhotoUpload={actions.handlePhotoUpload}
              onRemovePhoto={actions.removePhoto}
            />
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6">
            <SuppliersTab productId={product?.id.toString()} />
          </TabsContent>
        </Tabs>
      </Form>

      {/* Changes Warning */}
      {state.hasChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 border border-yellow-300 rounded-lg p-4 shadow-lg">
          <p className="text-yellow-800 text-sm">
            Você tem alterações não salvas
          </p>
        </div>
      )}
    </div>
  );
});