import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, Plus, X, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { ProductConfig, AMAZON_CATEGORIES, AMAZON_MARKETPLACES, AI_MODELS } from '@/types/amazon';

interface AmazonProductFormProps {
  onConfigSubmit: (config: ProductConfig) => void;
  initialConfig?: Partial<ProductConfig>;
  isLoading?: boolean;
}

export const AmazonProductForm = ({ onConfigSubmit, initialConfig, isLoading }: AmazonProductFormProps) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductConfig>({
    defaultValues: {
      productName: initialConfig?.productName || '',
      targetAudience: initialConfig?.targetAudience || '',
      keyFeatures: initialConfig?.keyFeatures || [],
      mainBenefits: initialConfig?.mainBenefits || [],
      priceRange: initialConfig?.priceRange || '',
      competitors: initialConfig?.competitors || [],
      ...initialConfig
    }
  });

  const watchedKeyFeatures = watch('keyFeatures') || [];
  const watchedMainBenefits = watch('mainBenefits') || [];
  const watchedCompetitors = watch('competitors') || [];

  const addFeature = () => {
    const currentFeatures = watchedKeyFeatures;
    if (currentFeatures.length < 10) {
      setValue('keyFeatures', [...currentFeatures, '']);
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = watchedKeyFeatures;
    setValue('keyFeatures', currentFeatures.filter((_, i) => i !== index));
  };

  const updateFeature = (index: number, value: string) => {
    const currentFeatures = watchedKeyFeatures;
    const newFeatures = [...currentFeatures];
    newFeatures[index] = value;
    setValue('keyFeatures', newFeatures);
  };

  const addBenefit = () => {
    const currentBenefits = watchedMainBenefits;
    if (currentBenefits.length < 10) {
      setValue('mainBenefits', [...currentBenefits, '']);
    }
  };

  const removeBenefit = (index: number) => {
    const currentBenefits = watchedMainBenefits;
    setValue('mainBenefits', currentBenefits.filter((_, i) => i !== index));
  };

  const updateBenefit = (index: number, value: string) => {
    const currentBenefits = watchedMainBenefits;
    const newBenefits = [...currentBenefits];
    newBenefits[index] = value;
    setValue('mainBenefits', newBenefits);
  };

  const addCompetitor = () => {
    const currentCompetitors = watchedCompetitors;
    if (currentCompetitors.length < 5) {
      setValue('competitors', [...currentCompetitors, '']);
    }
  };

  const removeCompetitor = (index: number) => {
    const currentCompetitors = watchedCompetitors;
    setValue('competitors', currentCompetitors.filter((_, i) => i !== index));
  };

  const updateCompetitor = (index: number, value: string) => {
    const currentCompetitors = watchedCompetitors;
    const newCompetitors = [...currentCompetitors];
    newCompetitors[index] = value;
    setValue('competitors', newCompetitors);
  };

  const onSubmit = (data: ProductConfig) => {
    // Filtrar campos vazios
    const cleanedData = {
      ...data,
      keyFeatures: data.keyFeatures.filter(f => f.trim() !== ''),
      mainBenefits: data.mainBenefits.filter(b => b.trim() !== ''),
      competitors: data.competitors.filter(c => c.trim() !== '')
    };
    onConfigSubmit(cleanedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5" />
          Configuração do Produto
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Informações Básicas</h3>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Nome do Produto *</label>
              <Input
                {...register('productName', { required: 'Nome do produto é obrigatório' })}
                placeholder="Ex: Fone Bluetooth Premium"
                className={errors.productName ? 'border-red-500' : ''}
              />
              {errors.productName && (
                <p className="text-sm text-red-600 mt-1">{errors.productName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Categoria *</label>
                <Select onValueChange={(value) => setValue('category', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {AMAZON_CATEGORIES.map(cat => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Marketplace *</label>
                <Select onValueChange={(value) => setValue('marketplace', value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o marketplace" />
                  </SelectTrigger>
                  <SelectContent>
                    {AMAZON_MARKETPLACES.map(mp => (
                      <SelectItem key={mp.value} value={mp.value}>
                        {mp.flag} {mp.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Público-Alvo *</label>
              <Textarea
                {...register('targetAudience', { required: 'Público-alvo é obrigatório' })}
                placeholder="Ex: Profissionais que trabalham em home office, jovens adultos entre 25-40 anos..."
                rows={3}
                className={errors.targetAudience ? 'border-red-500' : ''}
              />
              {errors.targetAudience && (
                <p className="text-sm text-red-600 mt-1">{errors.targetAudience.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Faixa de Preço</label>
              <Input
                {...register('priceRange')}
                placeholder="Ex: R$ 100 - R$ 200"
              />
            </div>
          </div>

          {/* Características Principais */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Características Principais</h3>
              <Button type="button" onClick={addFeature} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            
            {watchedKeyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={feature}
                  onChange={(e) => updateFeature(index, e.target.value)}
                  placeholder={`Característica ${index + 1}`}
                />
                <Button
                  type="button"
                  onClick={() => removeFeature(index)}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {watchedKeyFeatures.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Nenhuma característica adicionada.</p>
                <Button type="button" onClick={addFeature} size="sm" variant="outline" className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeira Característica
                </Button>
              </div>
            )}
          </div>

          {/* Principais Benefícios */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Principais Benefícios</h3>
              <Button type="button" onClick={addBenefit} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            
            {watchedMainBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={benefit}
                  onChange={(e) => updateBenefit(index, e.target.value)}
                  placeholder={`Benefício ${index + 1}`}
                />
                <Button
                  type="button"
                  onClick={() => removeBenefit(index)}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            {watchedMainBenefits.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">Nenhum benefício adicionado.</p>
                <Button type="button" onClick={addBenefit} size="sm" variant="outline" className="mt-2">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Benefício
                </Button>
              </div>
            )}
          </div>

          {/* Concorrentes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">Concorrentes (Opcional)</h3>
              <Button type="button" onClick={addCompetitor} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            
            {watchedCompetitors.map((competitor, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={competitor}
                  onChange={(e) => updateCompetitor(index, e.target.value)}
                  placeholder="Nome do produto concorrente ou ASIN"
                />
                <Button
                  type="button"
                  onClick={() => removeCompetitor(index)}
                  size="sm"
                  variant="outline"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Configurações de IA */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações de IA
            </h3>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Modelo de IA</label>
              <Select onValueChange={(value) => setValue('aiModel', value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o modelo de IA" />
                </SelectTrigger>
                <SelectContent>
                  {AI_MODELS.map(model => (
                    <SelectItem key={model.value} value={model.value}>
                      <div>
                        <p className="font-medium">{model.label}</p>
                        <p className="text-xs text-muted-foreground">{model.description}</p>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processando...
                </>
              ) : (
                'Gerar Conteúdo Amazon'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};