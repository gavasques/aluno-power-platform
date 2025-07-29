/**
 * Simple ProductChannelsManager for debugging
 */


import { useParams, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProductChannelsManagerSimple: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  
  const productId = parseInt(id || '0');

  const handleGoBack = () => {
    setLocation('/produtos-pro');
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGoBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Canais de Venda - TESTE
            </h1>
            <p className="text-gray-600">
              Produto ID: {productId}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p>Página de teste para verificar se o componente carrega corretamente.</p>
        <p>Se você está vendo esta mensagem, o problema não é com o lazy loading.</p>
      </div>
    </div>
  );
};

export default ProductChannelsManagerSimple;