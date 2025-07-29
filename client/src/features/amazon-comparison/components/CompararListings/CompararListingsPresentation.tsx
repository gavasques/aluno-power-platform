/**
 * PRESENTATION: CompararListingsPresentation
 * Interface de usuário para comparação de listagens Amazon
 * Extraído de CompararListings.tsx (956 linhas) para modularização
 */
import { Package, Search, Download, Plus, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Helmet } from 'react-helmet-async';

// Import components
import { ComparisonForm } from '../ComparisonForm/ComparisonForm';
import { ComparisonResults } from '../ComparisonResults/ComparisonResults';

// Import types
import { 
  ComparisonFormProps, 
  ComparisonResultsProps, 
  ComparisonState,
  ComparisonErrors 
} from '../../types';

// ===== COMPONENT PROPS =====
interface CompararListingsPresentationProps {
  formProps: ComparisonFormProps;
  resultsProps: ComparisonResultsProps;
  state: ComparisonState;
  errors: ComparisonErrors;
}

export const CompararListingsPresentation = ({
  formProps,
  resultsProps,
  state,
  errors
}: CompararListingsPresentationProps) => {

  return (
    <>
      <Helmet>
        <title>Comparar Listings Amazon - Análise Competitiva | Guilherme Vasques</title>
        <meta 
          name="description" 
          content="Compare produtos Amazon lado a lado. Analise preços, avaliações, disponibilidade e características para tomar decisões informadas." 
        />
        <meta name="keywords" content="comparação amazon, análise competitiva, ASINs, preços amazon, avaliações produtos" />
        <meta property="og:title" content="Comparar Listings Amazon - Análise Competitiva" />
        <meta property="og:description" content="Ferramenta profissional para comparação de produtos Amazon." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://guilhermevasques.replit.app/hub/comparar-listings" />
      </Helmet>

      <div className="w-screen min-h-screen bg-gray-50 px-1 py-3">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Package className="h-8 w-8" />
            Comparar Listings Amazon
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Compare informações detalhadas entre múltiplos produtos Amazon lado a lado
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          
          {/* Comparison Form */}
          <ComparisonForm {...formProps} />

          {/* General Error Display */}
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.general}</AlertDescription>
            </Alert>
          )}

          {/* Loading State */}
          {state.loading && (
            <Card>
              <CardContent className="py-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-gray-600">Buscando produtos na Amazon...</p>
                  <p className="text-sm text-gray-500">Isso pode levar alguns segundos</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Results Display */}
          {!state.loading && state.results.length > 0 && (
            <ComparisonResults {...resultsProps} />
          )}

          {/* Empty State */}
          {!state.loading && state.results.length === 0 && !errors.general && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pronto para comparar?
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Insira os ASINs dos produtos que deseja comparar e clique em "Comparar Produtos" para começar.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Package className="mx-auto h-8 w-8 text-blue-600 mb-2" />
                      <h4 className="font-medium text-blue-900">Múltiplos Produtos</h4>
                      <p className="text-sm text-blue-700">Compare até 5 produtos simultaneamente</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Search className="mx-auto h-8 w-8 text-green-600 mb-2" />
                      <h4 className="font-medium text-green-900">Dados Completos</h4>
                      <p className="text-sm text-green-700">Preços, avaliações, disponibilidade e mais</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Download className="mx-auto h-8 w-8 text-purple-600 mb-2" />
                      <h4 className="font-medium text-purple-900">Exportação</h4>
                      <p className="text-sm text-purple-700">Exporte resultados para análise</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Como usar esta ferramenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">1. Insira os ASINs</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Adicione os códigos ASIN dos produtos que deseja comparar. Você pode encontrar o ASIN na URL do produto Amazon.
                  </p>
                  <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                    Exemplo: B08N5WRWNW
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">2. Selecione o País</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Escolha o mercado Amazon onde deseja buscar os produtos (Brasil, EUA, etc.).
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t">
                <h4 className="font-semibold text-gray-900 mb-2">💡 Dicas importantes</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• ASINs devem ter exatamente 10 caracteres alfanuméricos</li>
                  <li>• Você pode comparar de 2 a 5 produtos por vez</li>
                  <li>• Esta operação consome 5 créditos do seu saldo</li>
                  <li>• Resultados podem ser exportados em formato TXT</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};