/**
 * AdvancedInfographicGenerator - Refatorado com useReducer
 * Estado complexo migrado de 9 useState para reducer pattern
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, CheckCircle, ArrowRight, Image, Download, ArrowLeft, X } from 'lucide-react';
import { PermissionGuard } from '@/components/guards/PermissionGuard';
import Layout from '@/components/layout/Layout';
import { Link } from 'wouter';
import { LoadingSpinner, ButtonLoader } from '@/components/common/LoadingSpinner';

import { useInfographicGenerator } from './hooks';
import type { ProductData } from './types';

export default function AdvancedInfographicGeneratorRefactored() {
  const {
    state,
    departments,
    actions: {
      handleImageUpload,
      removeImage,
      updateFormField,
      analyzeProduct,
      resetForm,
      setLoading,
      setShowProcessingModal,
      advanceStep
    }
  } = useInfographicGenerator();

  // Helper function to handle form submission
  const handleAnalyzeProduct = () => {
    const productData: ProductData = {
      name: state.form.productName,
      description: state.form.description,
      category: state.form.category,
      targetAudience: state.form.targetAudience,
      effortLevel: 'high'
    };

    analyzeProduct(productData);
  };

  // Helper functions for the UI
  const getStepProgress = () => {
    switch (state.session.step) {
      case 'input': return 0;
      case 'concepts': return 25;
      case 'prompt': return 50;
      case 'generating': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const isFormValid = () => {
    return state.form.productName && 
           state.form.description && 
           state.form.category && 
           state.form.targetAudience &&
           state.upload.file;
  };

  return (
    <Layout>
      <PermissionGuard 
        featureCode="agents.advanced_infographic"
        showMessage={true}
        message="Você não tem permissão para usar o Gerador Avançado de Infográficos."
      >
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Link href="/agentes">
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Voltar
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Gerador Avançado de Infográficos
            </h1>
            <p className="text-gray-600">
              Sistema inteligente de 3 etapas para criar infográficos profissionais para Amazon
            </p>
          
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Dados do Produto</span>
                <span>Conceitos</span>
                <span>Prompt Otimizado</span>
                <span>Gerando</span>
                <span>Concluído</span>
              </div>
              <Progress value={getStepProgress()} className="h-2" />
            </div>
          </div>

          {/* Step 1: Product Input */}
          {state.session.step === 'input' && (
            <div className="grid lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Dados do Produto
                  </CardTitle>
                  <CardDescription>
                    Preencha as informações detalhadas do seu produto
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="productName">Nome do Produto</Label>
                    <Input
                      id="productName"
                      value={state.form.productName}
                      onChange={(e) => updateFormField('productName', e.target.value)}
                      placeholder="Ex: Organizador de Gavetas Premium"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição Detalhada</Label>
                    <Textarea
                      id="description"
                      value={state.form.description}
                      onChange={(e) => updateFormField('description', e.target.value)}
                      placeholder="Descreva detalhadamente as características, benefícios e diferenciais do produto..."
                      className="h-32"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select 
                      value={state.form.category} 
                      onValueChange={(value) => updateFormField('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria do produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="targetAudience">Público-Alvo</Label>
                    <Textarea
                      id="targetAudience"
                      value={state.form.targetAudience}
                      onChange={(e) => updateFormField('targetAudience', e.target.value)}
                      placeholder="Descreva o público-alvo ideal para este produto..."
                      className="h-24"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Imagem de Referência
                  </CardTitle>
                  <CardDescription>
                    Upload uma foto do produto para análise visual
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!state.upload.preview ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">
                        Arraste uma imagem aqui ou clique para selecionar
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Máximo 25MB - JPG, PNG ou WEBP
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        id="imageUpload"
                      />
                      <Button variant="outline" asChild>
                        <label htmlFor="imageUpload" className="cursor-pointer">
                          Selecionar Imagem
                        </label>
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={state.upload.preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="lg:col-span-2">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">Pronto para Analisar</h3>
                        <p className="text-sm text-gray-600">
                          Nossos agentes de IA irão analisar seu produto e gerar conceitos personalizados
                        </p>
                      </div>
                      <Button
                        onClick={handleAnalyzeProduct}
                        disabled={!isFormValid() || state.ui.loading}
                        className="flex items-center gap-2"
                      >
                        {state.ui.loading ? (
                          <ButtonLoader />
                        ) : (
                          <>
                            Analisar Produto
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Step 2: Concepts */}
          {state.session.step === 'concepts' && state.session.concepts && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Conceitos Gerados
                  </CardTitle>
                  <CardDescription>
                    Nossos agentes analisaram seu produto e geraram {state.session.concepts.length} conceitos únicos
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {state.session.concepts.map((concept, index) => (
                  <Card key={concept.id} className="relative overflow-hidden">
                    {concept.recommended && (
                      <Badge className="absolute top-2 right-2 bg-green-500">
                        Recomendado
                      </Badge>
                    )}
                    <CardHeader>
                      <CardTitle className="text-lg">{concept.title}</CardTitle>
                      <CardDescription>{concept.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Foco:</p>
                        <p className="text-sm text-gray-600">{concept.focusType}</p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Pontos-chave:</p>
                        <ul className="text-sm text-gray-600 space-y-1">
                          {concept.keyPoints.slice(0, 3).map((point, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-blue-500">•</span>
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">Paleta de Cores:</p>
                        <div className="flex gap-2">
                          {Object.values(concept.colorPalette).slice(0, 4).map((color, i) => (
                            <div
                              key={i}
                              className="w-6 h-6 rounded-full border"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => {/* TODO: implement concept selection */}}
                        disabled={state.ui.loading}
                      >
                        Usar Este Conceito
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={resetForm}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </div>
            </div>
          )}

          {/* Processing Modal */}
          <Dialog open={state.ui.showProcessingModal} onOpenChange={setShowProcessingModal}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Processando Infográfico</DialogTitle>
                <DialogDescription>
                  Nossos agentes estão trabalhando para criar seu infográfico...
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PermissionGuard>
    </Layout>
  );
}