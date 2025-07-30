/**
 * PRESENTATION: ProductBasicDataTabPresentation
 * Interface de usuário para dados básicos de produtos
 * Extraído de ProductBasicDataTab.tsx (765 linhas) para modularização
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { 
  Package, 
  Ruler, 
  Weight, 
  Barcode, 
  Building, 
  Factory, 
  Save, 
  X,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2
} from 'lucide-react';

// Import specialized components (to be created)
import { ProductBasicInfoForm } from '../ProductBasicInfoForm/ProductBasicInfoForm';
import { ProductAttributesForm } from '../ProductAttributesForm/ProductAttributesForm';
import { ProductImagesManager } from '../ProductImagesManager/ProductImagesManager';
import { ProductTagsInput } from '../ProductTagsInput/ProductTagsInput';
import { CategorySelector } from '../CategorySelector/CategorySelector';
import { BrandSelector } from '../BrandSelector/BrandSelector';

// Import types
import { ProductBasicDataTabPresentationProps } from '../../types';

export const ProductBasicDataTabPresentation = ({
  state,
  product,
  categories,
  brands,
  form,
  actions,
  images,
  readOnly = false,
  showAdvancedFields = true,
  allowImageUpload = true,
  maxImages = 10
}: ProductBasicDataTabPresentationProps) => {

  // ===== COMPUTED VALUES =====
  const isEditing = !!product.data;
  const hasUnsavedChanges = form.isDirty;
  const canSave = form.isValid && !state.isSaving;

  // ===== HANDLERS =====
  const handleSave = async () => {
    if (canSave) {
      await actions.save();
    }
  };

  const handleGenerateSKU = () => {
    const generatedSKU = actions.generateSKU();
    actions.updateField('sku', generatedSKU);
  };

  const handleImageUpload = (files: File[]) => {
    if (allowImageUpload) {
      actions.uploadImages(files);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isEditing ? 'Editar Produto' : 'Novo Produto'} - Dados Básicos</title>
        <meta 
          name="description" 
          content={`${isEditing ? 'Edite' : 'Cadastre'} informações básicas do produto: nome, categoria, preço, imagens e atributos.`}
        />
      </Helmet>

      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <p className="text-sm text-gray-600">
                {isEditing ? 'Atualize as informações básicas do produto' : 'Preencha os dados básicos do produto'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          {!readOnly && (
            <div className="flex items-center gap-2">
              {hasUnsavedChanges && (
                <Badge variant="secondary" className="text-yellow-600 bg-yellow-50">
                  Alterações não salvas
                </Badge>
              )}
              
              <Button
                onClick={handleSave}
                disabled={!canSave}
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
                    {isEditing ? 'Atualizar' : 'Salvar'}
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Loading State */}
        {product.isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <span className="ml-3 text-gray-600">Carregando produto...</span>
          </div>
        )}

        {/* Error State */}
        {product.error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              <h3 className="font-medium text-red-900">Erro ao carregar produto</h3>
            </div>
            <p className="text-red-700 mt-1">{product.error}</p>
            <Button 
              onClick={product.refetch}
              variant="outline" 
              size="sm" 
              className="mt-3 text-red-600 border-red-600 hover:bg-red-50"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Main Form */}
        {!product.isLoading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Informações Básicas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ProductBasicInfoForm
                    formData={form.data}
                    errors={form.errors}
                    categories={categories.data}
                    brands={brands.data}
                    selectedCategory={state.selectedCategory}
                    selectedBrand={state.selectedBrand}
                    onFieldChange={actions.updateField}
                    onCategorySelect={actions.selectCategory}
                    onBrandSelect={actions.selectBrand}
                    onSKUGenerate={handleGenerateSKU}
                    readOnly={readOnly}
                  />
                </CardContent>
              </Card>

              {/* Category and Brand Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="h-5 w-5" />
                      Categoria
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CategorySelector
                      categories={categories.tree}
                      selectedCategory={state.selectedCategory}
                      selectedSubcategory={state.selectedSubcategory}
                      onCategorySelect={actions.selectCategory}
                      onSubcategorySelect={actions.selectSubcategory}
                      showSubcategories={true}
                      readOnly={readOnly}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Factory className="h-5 w-5" />
                      Marca
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BrandSelector
                      brands={brands.data}
                      selectedBrand={state.selectedBrand}
                      onBrandSelect={actions.selectBrand}
                      allowCreate={!readOnly}
                      readOnly={readOnly}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Advanced Fields */}
              {showAdvancedFields && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Ruler className="h-5 w-5" />
                      Detalhes Técnicos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="weight">Peso (kg)</Label>
                        <div className="relative">
                          <Input
                            id="weight"
                            type="number"
                            step="0.001"
                            min="0"
                            max="9999.999"
                            value={form.data.weight || ''}
                            onChange={(e) => actions.updateField('weight', parseFloat(e.target.value) || undefined)}
                            placeholder="0.000"
                            disabled={readOnly}
                            className="pl-8"
                          />
                          <Weight className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        {form.errors.weight && (
                          <p className="text-sm text-red-600 mt-1">{form.errors.weight}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="dimensions-length">Comprimento (cm)</Label>
                        <Input
                          id="dimensions-length"
                          type="number"
                          step="0.1"
                          min="0"
                          value={form.data.dimensions?.length || ''}
                          onChange={(e) => actions.updateField('dimensions', {
                            ...form.data.dimensions,
                            length: parseFloat(e.target.value) || undefined
                          })}
                          placeholder="0.0"
                          disabled={readOnly}
                        />
                      </div>

                      <div>
                        <Label htmlFor="cost-price">Preço de Custo</Label>
                        <div className="relative">
                          <Input
                            id="cost-price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={form.data.costPrice || ''}
                            onChange={(e) => actions.updateField('costPrice', parseFloat(e.target.value) || undefined)}
                            placeholder="0.00"
                            disabled={readOnly}
                            className="pl-8"
                          />
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">R$</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Product Attributes */}
              {state.selectedCategory?.attributes && state.selectedCategory.attributes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Atributos da Categoria</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductAttributesForm
                      attributes={state.selectedCategory.attributes}
                      values={form.data.attributes}
                      errors={form.errors}
                      onAttributeChange={actions.updateAttribute}
                      readOnly={readOnly}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <ProductTagsInput
                    tags={form.data.tags}
                    onTagsChange={actions.setTags}
                    onTagAdd={actions.addTag}
                    onTagRemove={actions.removeTag}
                    placeholder="Digite uma tag e pressione Enter"
                    maxTags={20}
                    readOnly={readOnly}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Images and Info */}
            <div className="space-y-6">
              
              {/* Product Images */}
              {allowImageUpload && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ImageIcon className="h-5 w-5" />
                      Imagens do Produto
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ProductImagesManager
                      images={images.previews}
                      isUploading={images.isUploading}
                      progress={images.progress}
                      errors={images.errors}
                      maxImages={maxImages}
                      onImagesAdd={handleImageUpload}
                      onImageRemove={actions.removeImage}
                      onMainImageSet={actions.setMainImage}
                      onImagesReorder={actions.reorderImages}
                      onImageAltUpdate={(index, alt) => {}} // TODO: implement
                      readOnly={readOnly}
                      allowUpload={allowImageUpload}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Product Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status do Produto</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={form.data.status}
                    onValueChange={(value) => actions.updateField('status', value)}
                    disabled={readOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          Rascunho
                        </div>
                      </SelectItem>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          Ativo
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          Inativo
                        </div>
                      </SelectItem>
                      <SelectItem value="archived">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-500" />
                          Arquivado
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Product Info Summary */}
              {isEditing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Produto</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-medium">#{product.data?.id}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">SKU:</span>
                      <span className="font-medium">{form.data.sku}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Preço:</span>
                      <span className="font-medium text-green-600">
                        R$ {form.data.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {product.data?.createdAt && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Criado em:</span>
                        <span className="font-medium">
                          {new Date(product.data.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Validation Errors */}
              {form.validationErrors.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="text-red-900 flex items-center gap-2">
                      <X className="h-5 w-5" />
                      Erros de Validação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {form.validationErrors.map((error, index) => (
                        <li key={index} className="text-sm text-red-700">
                          • {error.message}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};