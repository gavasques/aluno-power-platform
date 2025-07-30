/**
 * PRESENTATION: ProductEditPresentation
 * Interface de usuário para edição de produtos
 * Extraído de ProductEdit.tsx (723 linhas) para modularização
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Helmet } from 'react-helmet-async';
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Package, 
  Upload, 
  X, 
  AlertCircle,
  CheckCircle2,
  Camera,
  FileText,
  Ruler,
  Tag,
  DollarSign
} from 'lucide-react';

// Import specialized components (to be created)
import { ProductBasicInfo } from '../ProductBasicInfo/ProductBasicInfo';
import { ProductDimensions } from '../ProductDimensions/ProductDimensions';
import { ProductForm } from '../ProductForm/ProductForm';

// Import types
import { ProductEditPresentationProps, PRODUCT_EDIT_TABS } from '../../types/productEdit';

export const ProductEditPresentation = ({
  state,
  productData,
  suppliersData,
  brandsData,
  categoriesData,
  actions,
  utils,
  readOnly = false,
  showTabs = false
}: ProductEditPresentationProps) => {

  // ===== COMPUTED VALUES =====
  const isLoading = productData.isLoading;
  const hasError = productData.error;
  const product = productData.data;
  const hasChanges = utils.hasChanges();
  const changedFields = utils.getChangedFields();

  // ===== HANDLERS =====
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly) {
      await actions.submitForm();
    }
  };

  const handleFieldChange = (field: keyof typeof state.formData, value: any) => {
    if (!readOnly) {
      actions.updateFormData(field, value);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !readOnly) {
      actions.handlePhotoSelect(file);
    }
  };

  const handleBack = () => {
    actions.navigateBack();
  };

  // ===== RENDER HELPERS =====
  const renderPhotoUpload = () => (
    <div className="space-y-4">
      <Label htmlFor="photo">Foto do Produto</Label>
      
      {state.photoPreview && (
        <div className="relative inline-block">
          <img 
            src={state.photoPreview} 
            alt="Preview" 
            className="w-32 h-32 object-cover rounded-lg border"
          />
          {!readOnly && (
            <button
              type="button"
              onClick={actions.removePhoto}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {!readOnly && (
        <div className="flex items-center gap-2">
          <Input
            id="photo"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => document.getElementById('photo')?.click()}
            disabled={state.isSaving}
          >
            <Camera className="w-4 h-4 mr-2" />
            {state.photoPreview ? 'Alterar Foto' : 'Adicionar Foto'}
          </Button>
          {state.photoFile && (
            <span className="text-sm text-gray-600">
              {utils.getFileSize(state.photoFile)}
            </span>
          )}
        </div>
      )}

      {state.errors.photo && (
        <p className="text-sm text-red-600">{state.errors.photo}</p>
      )}
    </div>
  );

  const renderBasicForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Nome */}
      <div className="md:col-span-2">
        <Label htmlFor="name">Nome do Produto *</Label>
        <Input
          id="name"
          value={state.formData.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="Digite o nome do produto"
          disabled={readOnly}
          className={state.errors.name ? 'border-red-500' : ''}
        />
        {state.errors.name && (
          <p className="text-sm text-red-600 mt-1">{state.errors.name}</p>
        )}
      </div>

      {/* SKU */}
      <div>
        <Label htmlFor="sku">SKU</Label>
        <Input
          id="sku"
          value={state.formData.sku || ''}
          onChange={(e) => handleFieldChange('sku', e.target.value)}
          placeholder="Ex: PROD-001"
          disabled={readOnly}
          className={state.errors.sku ? 'border-red-500' : ''}
        />
        {state.errors.sku && (
          <p className="text-sm text-red-600 mt-1">{state.errors.sku}</p>
        )}
      </div>

      {/* EAN */}
      <div>
        <Label htmlFor="ean">Código EAN</Label>
        <Input
          id="ean"
          value={state.formData.ean || ''}
          onChange={(e) => handleFieldChange('ean', e.target.value)}
          placeholder="Ex: 7891000055557"
          disabled={readOnly}
          className={state.errors.ean ? 'border-red-500' : ''}
        />
        {state.errors.ean && (
          <p className="text-sm text-red-600 mt-1">{state.errors.ean}</p>
        )}
      </div>

      {/* Marca */}
      <div>
        <Label htmlFor="brand">Marca</Label>
        <Input
          id="brand"
          value={state.formData.brand || ''}
          onChange={(e) => handleFieldChange('brand', e.target.value)}
          placeholder="Digite a marca"
          disabled={readOnly}
        />
      </div>

      {/* Categoria */}
      <div>
        <Label htmlFor="category">Categoria</Label>
        <Input
          id="category"
          value={state.formData.category || ''}
          onChange={(e) => handleFieldChange('category', e.target.value)}
          placeholder="Digite a categoria"
          disabled={readOnly}
        />
      </div>

      {/* Fornecedor */}
      <div className="md:col-span-2">
        <Label htmlFor="supplier">Fornecedor</Label>
        <Select
          value={state.formData.supplierId?.toString() || ''}
          onValueChange={(value) => handleFieldChange('supplierId', value ? parseInt(value) : undefined)}
          disabled={readOnly || suppliersData.isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder={
              suppliersData.isLoading ? 'Carregando fornecedores...' : 'Selecione um fornecedor'
            } />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Nenhum fornecedor</SelectItem>
            {suppliersData.data.map((supplier) => (
              <SelectItem key={supplier.id} value={supplier.id.toString()}>
                {supplier.tradeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const renderDetailsForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* NCM */}
      <div>
        <Label htmlFor="ncm">NCM</Label>
        <Input
          id="ncm"
          value={state.formData.ncm || ''}
          onChange={(e) => handleFieldChange('ncm', e.target.value)}
          placeholder="Ex: 12345678"
          disabled={readOnly}
          className={state.errors.ncm ? 'border-red-500' : ''}
        />
        {state.errors.ncm && (
          <p className="text-sm text-red-600 mt-1">{state.errors.ncm}</p>
        )}
      </div>

      {/* Custo Unitário */}
      <div>
        <Label htmlFor="costItem">Custo Unitário</Label>
        <Input
          id="costItem"
          type="number"
          step="0.01"
          min="0"
          value={state.formData.costItem || ''}
          onChange={(e) => handleFieldChange('costItem', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="0,00"
          disabled={readOnly}
          className={state.errors.costItem ? 'border-red-500' : ''}
        />
        {state.errors.costItem && (
          <p className="text-sm text-red-600 mt-1">{state.errors.costItem}</p>
        )}
      </div>

      {/* Custo da Embalagem */}
      <div>
        <Label htmlFor="packCost">Custo da Embalagem</Label>
        <Input
          id="packCost"
          type="number"
          step="0.01"
          min="0"
          value={state.formData.packCost || ''}
          onChange={(e) => handleFieldChange('packCost', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="0,00"
          disabled={readOnly}
          className={state.errors.packCost ? 'border-red-500' : ''}
        />
        {state.errors.packCost && (
          <p className="text-sm text-red-600 mt-1">{state.errors.packCost}</p>
        )}
      </div>

      {/* Taxa de Imposto */}
      <div>
        <Label htmlFor="taxPercent">Taxa de Imposto (%)</Label>
        <Input
          id="taxPercent"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={state.formData.taxPercent || ''}
          onChange={(e) => handleFieldChange('taxPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="0,00"
          disabled={readOnly}
          className={state.errors.taxPercent ? 'border-red-500' : ''}
        />
        {state.errors.taxPercent && (
          <p className="text-sm text-red-600 mt-1">{state.errors.taxPercent}</p>
        )}
      </div>

      {/* Peso */}
      <div>
        <Label htmlFor="weight">Peso (kg)</Label>
        <Input
          id="weight"
          type="number"
          step="0.001"
          min="0"
          value={state.formData.weight || ''}
          onChange={(e) => handleFieldChange('weight', e.target.value ? parseFloat(e.target.value) : undefined)}
          placeholder="0,000"
          disabled={readOnly}
          className={state.errors.weight ? 'border-red-500' : ''}
        />
        {state.errors.weight && (
          <p className="text-sm text-red-600 mt-1">{state.errors.weight}</p>
        )}
      </div>
    </div>
  );

  const renderDimensionsForm = () => (
    <div className="space-y-4">
      <Label>Dimensões (cm)</Label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="length">Comprimento</Label>
          <Input
            id="length"
            type="number"
            step="0.01"
            min="0"
            value={state.formData.dimensions?.length || ''}
            onChange={(e) => actions.updateDimensions({ 
              length: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
            placeholder="0,00"
            disabled={readOnly}
            className={state.errors.dimensions?.length ? 'border-red-500' : ''}
          />
          {state.errors.dimensions?.length && (
            <p className="text-sm text-red-600 mt-1">{state.errors.dimensions.length}</p>
          )}
        </div>

        <div>
          <Label htmlFor="width">Largura</Label>
          <Input
            id="width"
            type="number"
            step="0.01"
            min="0"
            value={state.formData.dimensions?.width || ''}
            onChange={(e) => actions.updateDimensions({ 
              width: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
            placeholder="0,00"
            disabled={readOnly}
            className={state.errors.dimensions?.width ? 'border-red-500' : ''}
          />
          {state.errors.dimensions?.width && (
            <p className="text-sm text-red-600 mt-1">{state.errors.dimensions.width}</p>
          )}
        </div>

        <div>
          <Label htmlFor="height">Altura</Label>
          <Input
            id="height"
            type="number"
            step="0.01"
            min="0"
            value={state.formData.dimensions?.height || ''}
            onChange={(e) => actions.updateDimensions({ 
              height: e.target.value ? parseFloat(e.target.value) : undefined 
            })}
            placeholder="0,00"
            disabled={readOnly}
            className={state.errors.dimensions?.height ? 'border-red-500' : ''}
          />
          {state.errors.dimensions?.height && (
            <p className="text-sm text-red-600 mt-1">{state.errors.dimensions.height}</p>
          )}
        </div>
      </div>

      {state.formData.dimensions && (
        <div className="text-sm text-gray-600">
          Volume calculado: {utils.calculateVolume(state.formData.dimensions).toFixed(6)} m³
        </div>
      )}
    </div>
  );

  const renderDescriptionForm = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={state.formData.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Descrição detalhada do produto"
          rows={4}
          disabled={readOnly}
        />
      </div>

      <div>
        <Label htmlFor="bulletPoints">Características (uma por linha)</Label>
        <Textarea
          id="bulletPoints"
          value={state.formData.bulletPoints || ''}
          onChange={(e) => handleFieldChange('bulletPoints', e.target.value)}
          placeholder="• Característica 1&#10;• Característica 2&#10;• Característica 3"
          rows={6}
          disabled={readOnly}
        />
      </div>

      <div>
        <Label htmlFor="observations">Observações</Label>
        <Textarea
          id="observations"
          value={state.formData.observations || ''}
          onChange={(e) => handleFieldChange('observations', e.target.value)}
          placeholder="Observações internas sobre o produto"
          rows={3}
          disabled={readOnly}
        />
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>
          {product ? `Editar ${product.name}` : 'Editar Produto'} - Minha Área
        </title>
        <meta 
          name="description" 
          content="Sistema de edição de produtos com informações completas, dimensões, preços e descrições."
        />
      </Helmet>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={state.isSaving}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6" />
                {product ? `Editar ${product.name}` : 'Editar Produto'}
              </h1>
              {product && (
                <p className="text-gray-600">
                  SKU: {product.sku || 'Não informado'} • 
                  Status: <Badge variant={product.active ? 'default' : 'secondary'}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  {changedFields.length} alterações
                </Badge>
              )}
              <Button
                onClick={actions.resetForm}
                variant="outline"
                size="sm"
                disabled={!hasChanges || state.isSaving}
              >
                Desfazer
              </Button>
              <Button
                onClick={() => actions.submitForm()}
                disabled={!hasChanges || state.isSaving}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {state.isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Alterações
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Carregando produto...</span>
          </div>
        )}

        {/* Error State */}
        {hasError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erro ao carregar produto: {hasError}
            </AlertDescription>
          </Alert>
        )}

        {/* Success State - Product Loaded */}
        {!isLoading && !hasError && product && (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {showTabs ? (
              // Tabbed Interface
              <Tabs value={state.activeTab} onValueChange={actions.setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic" className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    Básico
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Detalhes
                  </TabsTrigger>
                  <TabsTrigger value="dimensions" className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Dimensões
                  </TabsTrigger>
                  <TabsTrigger value="description" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Descrição
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Básicas</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {renderBasicForm()}
                      <Separator />
                      {renderPhotoUpload()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Detalhes do Produto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderDetailsForm()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="dimensions" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dimensões e Peso</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderDimensionsForm()}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="description" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Descrição e Características</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderDescriptionForm()}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            ) : (
              // Single Page Interface
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {renderBasicForm()}
                    <Separator />
                    {renderPhotoUpload()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Detalhes do Produto</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderDetailsForm()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dimensões e Peso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderDimensionsForm()}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Descrição e Características</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {renderDescriptionForm()}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Status Toggle */}
            {!readOnly && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="active">Status do Produto</Label>
                      <p className="text-sm text-gray-600">
                        Produtos inativos não aparecem nas listagens
                      </p>
                    </div>
                    <Switch
                      id="active"
                      checked={state.formData.active}
                      onCheckedChange={(checked) => handleFieldChange('active', checked)}
                      disabled={readOnly}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        )}

        {/* Unsaved Changes Dialog */}
        {state.showUnsavedChangesDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="h-6 w-6 text-orange-500" />
                <h3 className="text-lg font-semibold">Alterações não salvas</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Você tem alterações não salvas. Deseja salvá-las antes de sair?
              </p>
              <div className="flex items-center gap-2 justify-end">
                <Button
                  onClick={() => {
                    actions.hideUnsavedDialog();
                    actions.navigateBack();
                  }}
                  variant="outline"
                >
                  Descartar
                </Button>
                <Button
                  onClick={actions.hideUnsavedDialog}
                  variant="outline"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={async () => {
                    await actions.submitForm();
                    actions.hideUnsavedDialog();
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={state.isSaving}
                >
                  {state.isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar e Sair
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};