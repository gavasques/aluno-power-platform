import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { ProductData, ReviewsData } from '@/pages/agents/amazon-listings-optimizer';

interface DataSummaryProps {
  productData: ProductData;
  reviewsData: ReviewsData;
}

export const DataSummary: React.FC<DataSummaryProps> = ({ productData, reviewsData }) => {
  const getKeywordCount = (keywords: string) => {
    return keywords.split(',').filter(k => k.trim()).length;
  };

  const getFeatureCount = (features: string) => {
    return features.split(',').filter(f => f.trim()).length;
  };

  const getLongTailCount = (longTail: string) => {
    return longTail.split(',').filter(lt => lt.trim()).length;
  };

  const isComplete = () => {
    const hasProductName = productData.productName.length >= 5;
    const hasKeywords = getKeywordCount(productData.mainKeywords) >= 3;
    const hasFeatures = getFeatureCount(productData.features) >= 3;
    const hasReviews = reviewsData.reviewCount >= 5;
    
    return hasProductName && hasKeywords && hasFeatures && hasReviews;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Resumo dos Dados</CardTitle>
          {isComplete() && (
            <CheckCircle className="h-5 w-5 text-green-600" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          {/* Produto */}
          <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              productData.productName.length >= 5 ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Produto:</span>
              <p className="text-sm text-gray-600">
                {productData.productName || 'Não informado'}
              </p>
            </div>
          </div>

          {/* Palavras-chave */}
          <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              getKeywordCount(productData.mainKeywords) >= 3 ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Palavras-chave:</span>
              <p className="text-sm text-gray-600">
                {getKeywordCount(productData.mainKeywords)} principais
                {getLongTailCount(productData.longTailKeywords) > 0 && 
                  ` + ${getLongTailCount(productData.longTailKeywords)} long tail`
                }
              </p>
            </div>
          </div>

          {/* Características */}
          <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              getFeatureCount(productData.features) >= 3 ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Características:</span>
              <p className="text-sm text-gray-600">
                {getFeatureCount(productData.features)} características
              </p>
            </div>
          </div>

          {/* Avaliações */}
          <div className="flex items-start gap-3">
            <div className={`w-2 h-2 rounded-full mt-2 ${
              reviewsData.reviewCount >= 5 ? 'bg-green-500' : 'bg-gray-300'
            }`}></div>
            <div className="flex-1">
              <span className="text-sm font-medium text-gray-700">Avaliações:</span>
              <p className="text-sm text-gray-600">
                {reviewsData.reviewCount} 
                {reviewsData.type === 'csv' ? ' (via CSV)' : ' (via texto)'}
              </p>
            </div>
          </div>

          {/* Informações adicionais */}
          {productData.additionalInfo.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full mt-2 bg-blue-500"></div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-700">Informações extras:</span>
                <p className="text-sm text-gray-600">
                  {productData.additionalInfo.length} caracteres
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Status */}
        {isComplete() ? (
          <div className="flex items-center gap-2 text-green-700 bg-green-50 p-3 rounded-lg">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Dados completos - Pronto para processar!
            </span>
          </div>
        ) : (
          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            Complete os campos obrigatórios para continuar
          </div>
        )}
      </CardContent>
    </Card>
  );
};