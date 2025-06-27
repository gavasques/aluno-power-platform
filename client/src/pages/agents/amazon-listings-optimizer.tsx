import React, { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AgentHeader } from '@/components/agents/common/AgentHeader';
import { ProcessingButton } from '@/components/agents/common/ProcessingButton';
import { ProductForm } from '@/components/agents/amazon/ProductForm';
import { ReviewsInput } from '@/components/agents/amazon/ReviewsInput';
import { DataSummary } from '@/components/agents/amazon/DataSummary';

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
    // TODO: Implement actual processing logic
    setTimeout(() => {
      setIsProcessing(false);
      // TODO: Navigate to results page or show results
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => setLocation('/agentes')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar aos Agentes
          </Button>
        </div>
        
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
              🛒
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                Amazon Listings Optimizer
              </h1>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                Ativo
              </Badge>
            </div>
            <p className="text-lg text-gray-600">
              Agente especializado em otimizar listagens da Amazon através da análise de avaliações de concorrentes
            </p>
          </div>
        </div>
      </div>

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
              <Button
                onClick={handleProcess}
                disabled={!isValid() || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processando...
                  </>
                ) : isValid() ? (
                  <>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Processar Listagem
                  </>
                ) : (
                  'Preencha os campos obrigatórios'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AmazonListingsOptimizer;