import React from 'react';
import { SubscriptionManager } from '@/components/stripe/SubscriptionManager';
import { Star, CreditCard, FileText, Settings } from 'lucide-react';

const MySubscriptions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Star className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Minhas Assinaturas</h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie sua assinatura, visualize detalhes do plano e controle seus pagamentos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Menu Lateral */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4">Gerenciar</h3>
              <nav className="space-y-2">
                <div className="flex items-center space-x-3 p-3 rounded-lg bg-primary/5 text-primary">
                  <Star className="h-5 w-5" />
                  <span className="font-medium">Assinatura Atual</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <CreditCard className="h-5 w-5" />
                  <span>Métodos de Pagamento</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <FileText className="h-5 w-5" />
                  <span>Histórico de Faturas</span>
                </div>
                <div className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                  <Settings className="h-5 w-5" />
                  <span>Configurações</span>
                </div>
              </nav>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6">
                <SubscriptionManager />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySubscriptions;