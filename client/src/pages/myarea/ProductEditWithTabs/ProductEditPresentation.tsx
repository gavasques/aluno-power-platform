/**
 * PRESENTATION: ProductEditPresentation
 * Pure UI component for product editing with tabs functionality
 * Extracted from ProductEditWithTabs.tsx (680 lines) for modularization
 */
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, ArrowLeft } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { BasicInfoTab } from './components/BasicInfoTab';
import { PricingTab } from './components/PricingTab';
import { TABS_CONFIG, type ProductEditState, type ProductEditActions } from './types';

interface ProductEditPresentationProps {
  state: ProductEditState;
  actions: ProductEditActions;
  isEditing: boolean;
}

export const ProductEditPresentation = memo<ProductEditPresentationProps>(({
  state,
  actions,
  isEditing
}) => {
  if (state.loading) {
    return <LoadingSpinner message="Carregando produto..." />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do produto' : 'Cadastre um novo produto'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button 
            onClick={actions.saveProduct} 
            disabled={state.saving || !state.isDirty}
          >
            {state.saving ? (
              <ButtonLoader>Salvando...</ButtonLoader>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {isEditing ? 'Atualizar' : 'Criar'} Produto
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {state.error && (
        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
          <p className="text-red-600">{state.error}</p>
        </div>
      )}

      {/* Unsaved Changes Warning */}
      {state.isDirty && (
        <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
          <p className="text-yellow-800">
            Você tem alterações não salvas. Lembre-se de salvar antes de sair.
          </p>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={state.activeTab} onValueChange={actions.setActiveTab}>
        <TabsList className="grid w-full grid-cols-7">
          {TABS_CONFIG.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="basic" className="mt-6">
          <BasicInfoTab
            formData={state.formData}
            onFieldChange={actions.updateField}
            onArrayFieldChange={actions.updateArrayField}
          />
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <PricingTab
            formData={state.formData}
            onFieldChange={actions.updateField}
          />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aba de estoque em desenvolvimento...</p>
          </div>
        </TabsContent>

        <TabsContent value="dimensions" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aba de dimensões em desenvolvimento...</p>
          </div>
        </TabsContent>

        <TabsContent value="images" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aba de imagens em desenvolvimento...</p>
          </div>
        </TabsContent>

        <TabsContent value="seo" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aba de SEO em desenvolvimento...</p>
          </div>
        </TabsContent>

        <TabsContent value="suppliers" className="mt-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Aba de fornecedores em desenvolvimento...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
});