import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AgentHeader } from '@/components/agents/common/AgentHeader';
import { ProcessingButton } from '@/components/agents/common/ProcessingButton';
import { ProductForm } from '@/components/agents/amazon/ProductForm';
import { ReviewsInput } from '@/components/agents/amazon/ReviewsInput';
import { DataSummary } from '@/components/agents/amazon/DataSummary';
import { apiRequest } from '@/lib/queryClient';

export interface ProductData {
  productName: string;
  mainKeywords: string;
  longTailKeywords: string;
  features: string;
  additionalInfo: string;
}

export interface ReviewsData {
  type: 'csv' | 'text';
  csvFiles: File[];
  textContent: string;
  reviewCount: number;
}

const AmazonListingsOptimizer = () => {
  const [, setLocation] = useLocation();
  const [productData, setProductData] = useState<ProductData>({
    productName: '',
    mainKeywords: '',
    longTailKeywords: '',
    features: '',
    additionalInfo: ''
  });
  
  const [reviewsData, setReviewsData] = useState<ReviewsData>({
    type: 'csv',
    csvFiles: [],
    textContent: '',
    reviewCount: 0
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState(0);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processingStages = [
    'Analisando avaliações...',
    'Gerando títulos...',
    'Criando bullet points...',
    'Finalizando descrição...'
  ];

  const handleProductChange = (data: ProductData) => {
    setProductData(data);
  };

  const handleReviewsChange = (data: ReviewsData) => {
    setReviewsData(data);
  };

  const isValid = () => {
    const hasProductName = productData.productName.length >= 5;
    const hasKeywords = productData.mainKeywords.split(',').filter(k => k.trim()).length >= 3;
    const hasFeatures = productData.features.split(',').filter(f => f.trim()).length >= 3;
    const hasReviews = reviewsData.reviewCount >= 5;
    
    return hasProductName && hasKeywords && hasFeatures && hasReviews;
  };

  const handleProcess = async () => {
    if (!isValid()) return;
    
    setIsProcessing(true);
    setError(null);
    setProcessingStage(0);
    setProcessingProgress(0);

    try {
      // Prepare review content
      let reviewContent = '';
      if (reviewsData.type === 'text') {
        reviewContent = reviewsData.textContent;
      } else {
        // For CSV files, we'll use a placeholder - in production this would read file content
        reviewContent = `Dados de ${reviewsData.csvFiles.length} arquivos CSV do Helium10 com ${reviewsData.reviewCount} avaliações processadas.`;
      }

      const requestData = {
        productName: productData.productName,
        mainKeywords: productData.mainKeywords,
        longTailKeywords: productData.longTailKeywords,
        features: productData.features,
        additionalInfo: productData.additionalInfo,
        reviewsData: {
          type: reviewsData.type,
          content: reviewContent,
          reviewCount: reviewsData.reviewCount
        }
      };

      // Simulate progress updates for each stage
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          const newProgress = prev + 2;
          const currentStage = Math.floor(newProgress / 25);
          
          if (currentStage !== processingStage && currentStage < 4) {
            setProcessingStage(currentStage);
          }
          
          return Math.min(newProgress, 98);
        });
      }, 1500);

      const response = await apiRequest('/api/agents/amazon-listings-optimizer/process', {
        method: 'POST',
        body: JSON.stringify(requestData),
        headers: {
          'Content-Type': 'application/json'
        }
      }) as { success: boolean; processingTime?: number; error?: string; data?: any };

      clearInterval(progressInterval);
      setProcessingProgress(100);

      if (response.success) {
        // TODO: Navigate to results page or show results
        // For now, show success message
        setTimeout(() => {
          setIsProcessing(false);
          alert(`Processamento concluído! Interface de resultados será implementada no próximo prompt.`);
        }, 500);
      } else {
        throw new Error(response.error || 'Erro no processamento');
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro interno do servidor';
      setError(errorMessage);
      setIsProcessing(false);
      setProcessingProgress(0);
      setProcessingStage(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <AgentHeader
        title="Amazon Listings Optimizer"
        description="Agente especializado em otimizar listagens da Amazon através da análise de avaliações de concorrentes"
        icon="🛒"
        isActive={true}
        onBack={() => setLocation('/agentes')}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-8">
          {/* Product Data Section */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Produto</CardTitle>
              <p className="text-sm text-gray-600">
                Insira as informações do produto e avaliações para processamento
              </p>
            </CardHeader>
            <CardContent>
              <ProductForm 
                data={productData}
                onChange={handleProductChange}
              />
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliações dos Concorrentes</CardTitle>
              <p className="text-sm text-gray-600">
                Escolha como inserir as avaliações para análise
              </p>
            </CardHeader>
            <CardContent>
              <ReviewsInput 
                data={reviewsData}
                onChange={handleReviewsChange}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary and Actions */}
        <div className="space-y-6">
          <DataSummary 
            productData={productData}
            reviewsData={reviewsData}
          />
          
          {/* Process Button */}
          <Card>
            <CardContent className="p-6">
              {isProcessing && (
                <div className="mb-6 space-y-4">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold mb-2">Processando com IA</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      {processingStages[processingStage]} ({processingProgress}%)
                    </p>
                    <Progress value={processingProgress} className="mb-2" />
                    <p className="text-xs text-gray-500">
                      Tempo estimado: 2-3 minutos
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              <ProcessingButton
                isProcessing={isProcessing}
                isValid={isValid()}
                onProcess={handleProcess}
                size="lg"
                processingText="Processando..."
                idleText="Processar Listagem"
                invalidText="Preencha os campos obrigatórios"
                icon={<ShoppingCart className="h-4 w-4" />}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AmazonListingsOptimizer;