/**
 * PRESENTATION: ImportedProductFormPresentation
 * Interface de usuário para formulário de produtos importados
 * Extraído de ImportedProductForm.tsx (926 linhas) para modularização
 */
import { ArrowLeft, Save, Package, Eye, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet-async';

// Import step components
import { ProductFormSteps } from '../ProductFormSteps/ProductFormSteps';
import { BasicInfoStep } from '../steps/BasicInfoStep/BasicInfoStep';
import { PricingStep } from '../steps/PricingStep/PricingStep';
import { SpecificationsStep } from '../steps/SpecificationsStep/SpecificationsStep';
import { ImagesStep } from '../steps/ImagesStep/ImagesStep';
import { InventoryStep } from '../steps/InventoryStep/InventoryStep';
import { VariationsStep } from '../steps/VariationsStep/VariationsStep';
import { ShippingStep } from '../steps/ShippingStep/ShippingStep';
import { SEOStep } from '../steps/SEOStep/SEOStep';
import { ComplianceStep } from '../steps/ComplianceStep/ComplianceStep';
import { PreviewStep } from '../steps/PreviewStep/PreviewStep';

// Import types
import { ImportedProductFormPresentationProps } from '../../types';

export const ImportedProductFormPresentation = ({
  state,
  actions,
  validation,
  navigation,
  onSuccess,
  onCancel
}: ImportedProductFormPresentationProps) => {
  // ===== HOOKS =====
  const [, setLocation] = useLocation();

  // ===== HANDLERS =====
  const handleSave = async () => {
    const success = await actions.saveProduct();
    if (success && onSuccess) {
      onSuccess(state.formData);
    }
  };

  const handleSaveDraft = async () => {
    await actions.saveDraft();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      setLocation('/myarea/importacoes/produtos');
    }
  };

  // ===== RENDER CURRENT STEP =====
  const renderCurrentStep = () => {
    const stepProps = {
      formData: state.formData,
      errors: validation.errors,
      onChange: actions.updateField,
      onValidate: validation.validateField
    };

    switch (navigation.currentStep) {
      case 1:
        return <BasicInfoStep {...stepProps} />;
      case 2:
        return <PricingStep {...stepProps} />;
      case 3:
        return <SpecificationsStep {...stepProps} />;
      case 4:
        return (
          <ImagesStep
            images={state.formData.images || []}
            previews={[]} // TODO: Connect with useProductImages
            errors={validation.errors}
            onAddImages={actions.addImage}
            onRemoveImage={actions.removeImage}
            onReorderImages={() => {}} // TODO: Implement
            onSetMainImage={() => {}} // TODO: Implement
          />
        );
      case 5:
        return <InventoryStep {...stepProps} />;
      case 6:
        return (
          <VariationsStep
            variations={state.formData.variations || []}
            errors={validation.errors}
            onAddVariation={actions.addVariation}
            onUpdateVariation={actions.updateVariation}
            onRemoveVariation={actions.removeVariation}
          />
        );
      case 7:
        return <ShippingStep {...stepProps} />;
      case 8:
        return (
          <SEOStep
            {...stepProps}
            onGenerateSEO={() => {
              // TODO: Implement SEO generation
              console.log('Generate SEO');
            }}
          />
        );
      case 9:
        return <ComplianceStep {...stepProps} />;
      case 10:
        return (
          <PreviewStep
            formData={state.formData}
            validation={validation.results}
            onEdit={actions.goToStep}
          />
        );
      default:
        return <BasicInfoStep {...stepProps} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {state.formData.name 
            ? `Editar ${state.formData.name} - Produtos Importados`
            : 'Novo Produto Importado - Cadastro'
          }
        </title>
        <meta 
          name="description" 
          content="Cadastre e gerencie produtos importados com formulário completo incluindo especificações, imagens, inventário e conformidade." 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 p-4">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="h-6 w-6" />
                  {state.formData.name || 'Novo Produto Importado'}
                </h1>
                <p className="text-gray-600 text-sm">
                  Etapa {navigation.currentStep} de {navigation.totalSteps} - {navigation.stepTitles[navigation.currentStep - 1]}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Auto Save Indicator */}
              {state.autoSave && state.isDirty && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Auto-salvando...
                </Badge>
              )}

              {/* Preview Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={actions.togglePreview}
                disabled={state.isLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                {state.previewMode ? 'Editar' : 'Prévia'}
              </Button>

              {/* Save Draft */}
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={state.isSaving || state.isLoading}
              >
                {state.isSaving ? 'Salvando...' : 'Salvar Rascunho'}
              </Button>

              {/* Save Product */}
              <Button
                onClick={handleSave}
                disabled={state.isSaving || state.isLoading || !validation.isValid}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {state.isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Produto
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progresso do Formulário</span>
              <span>{Math.round(validation.results.completeness)}% completo</span>
            </div>
            <Progress 
              value={validation.results.completeness} 
              className="h-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Steps Navigation Sidebar */}
          <div className="lg:col-span-1">
            <ProductFormSteps
              currentStep={navigation.currentStep}
              totalSteps={navigation.totalSteps}
              stepTitles={navigation.stepTitles}
              completedSteps={navigation.completedSteps}
              onStepClick={actions.goToStep}
              canGoToStep={(step) => step <= navigation.currentStep + 1}
            />

            {/* Validation Summary */}
            {validation.results.criticalIssues.length > 0 && (
              <Card className="mt-4 border-red-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-red-800">
                    Problemas Críticos ({validation.results.criticalIssues.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm text-red-700 space-y-1">
                    {validation.results.criticalIssues.slice(0, 3).map((issue, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-red-500 mt-1">•</span>
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Warnings */}
            {validation.results.warnings.length > 0 && (
              <Card className="mt-4 border-yellow-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-yellow-800">
                    Avisos ({validation.results.warnings.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {validation.results.warnings.slice(0, 2).map((warning, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-yellow-500 mt-1">•</span>
                        <span>{warning}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    {navigation.stepTitles[navigation.currentStep - 1]}
                  </CardTitle>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      Etapa {navigation.currentStep}/{navigation.totalSteps}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <Separator />
              
              <CardContent className="pt-6">
                {state.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <span className="ml-3 text-gray-600">Carregando produto...</span>
                  </div>
                ) : (
                  renderCurrentStep()
                )}
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={actions.previousStep}
                disabled={!navigation.canGoPrevious || state.isLoading}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>

              <div className="flex gap-3">
                {navigation.currentStep === navigation.totalSteps ? (
                  <Button
                    onClick={handleSave}
                    disabled={state.isSaving || !validation.isValid}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Finalizar e Salvar
                  </Button>
                ) : (
                  <Button
                    onClick={actions.nextStep}
                    disabled={!navigation.canGoNext || state.isLoading}
                  >
                    Próximo
                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};