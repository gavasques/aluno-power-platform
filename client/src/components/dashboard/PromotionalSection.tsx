import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star, Zap } from 'lucide-react';

const PromotionalSection: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Venda Moda na Amazon */}
      <Card className="bg-purple-50 border border-purple-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-purple-900 mb-2">Venda Moda na Amazon</h3>
              <p className="text-purple-700 text-sm leading-relaxed">0% de Comissão para novas contas</p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-purple-600" />
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md"
              onClick={() => window.open('https://venda.amazon.com.br/?ld=elbrsoa_atesliberdade_virtualsoftsrp2025na', '_blank')}
            >
              Cadastre-se →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Venda na Amazon */}
      <Card className="bg-blue-50 border border-blue-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-blue-900 mb-2">Venda na Amazon</h3>
              <p className="text-blue-700 text-sm leading-relaxed">Tenha nossos benefícios exclusivos</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="mt-4">
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md"
              onClick={() => window.open('https://amzn.to/3RTu5Sk', '_blank')}
            >
              Cadastre-se →
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Helium 10 */}
      <Card className="bg-orange-50 border border-orange-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-orange-900 mb-2">Helium 10</h3>
              <p className="text-orange-700 text-sm leading-relaxed">Software para encontrar produtos</p>
            </div>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Zap className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          
          <div className="mt-4 flex gap-2">
            <Button 
              size="sm" 
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-3 py-1 rounded text-xs"
              onClick={() => window.open('https://helium10.com/go/guilherme74', '_blank')}
            >
              Anual
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-50 font-medium px-3 py-1 rounded text-xs"
              onClick={() => window.open('https://helium10.com/go/guilherme20', '_blank')}
            >
              Mensal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default memo(PromotionalSection);