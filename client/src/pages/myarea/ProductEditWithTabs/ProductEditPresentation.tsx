/**
 * PRESENTATION: ProductEditPresentation
 * Pure UI component for product editing functionality
 * Extracted from ProductEditWithTabs.tsx (680 lines) for modularization
 */
import React, { memo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Loader2, Package, Upload, Users } from 'lucide-react';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import ProductSupplierManagerRefactored from '@/components/product/ProductSupplierManagerRefactored';
import { BasicInfoTab } from './components/BasicInfoTab';
import { DimensionsTab } from './components/DimensionsTab';
import { PhotoUploadTab } from './components/PhotoUploadTab';
import type { ProductFormData, Product, ProductEditState, ProductEditActions } from './types';

interface ProductEditPresentationProps {
  form: UseFormReturn<ProductFormData>;
  product?: Product;
  suppliers: any[];
  state: ProductEditState;
  isLoading: boolean;
  error: any;
  isUpdating: boolean;
  actions: ProductEditActions;
}

export const ProductEditPresentation = memo<ProductEditPresentationProps>(({
  form,
  product,
  suppliers,
  state,
  isLoading,
  error,
  isUpdating,
  actions
}) => {
  if (isLoading) {
    return <LoadingSpinner message="Carregando produto..." />;
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-red-600">Erro ao carregar produto: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Produto não encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={actions.onNavigateBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Produto</h1>
            <p className="text-muted-foreground">{product.name}</p>
          </div>
        </div>
        <Button 
          type="submit" 
          form="product-form" 
          disabled={isUpdating}
          className="min-w-[120px]"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </>
          )}
        </Button>
      </div>

      {/* Form */}
      <Form {...form}>
        <form 
          id="product-form"
          onSubmit={form.handleSubmit(actions.onSave)}
          className="space-y-6"
        >
          <Card>
            <CardContent className="pt-6">
              <Tabs value={state.activeTab} onValueChange={actions.setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Básico
                  </TabsTrigger>
                  <TabsTrigger value="dimensions" className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Especificações
                  </TabsTrigger>
                  <TabsTrigger value="photo" className="flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Foto
                  </TabsTrigger>
                  <TabsTrigger value="suppliers" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Fornecedores
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="mt-6">
                  <BasicInfoTab form={form} suppliers={suppliers || []} />
                </TabsContent>

                <TabsContent value="dimensions" className="mt-6">
                  <DimensionsTab form={form} />
                </TabsContent>

                <TabsContent value="photo" className="mt-6">
                  <PhotoUploadTab 
                    photoPreview={state.photoPreview}
                    onPhotoChange={actions.handlePhotoChange}
                  />
                </TabsContent>

                <TabsContent value="suppliers" className="mt-6">
                  <ProductSupplierManagerRefactored productId={product.id} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
});