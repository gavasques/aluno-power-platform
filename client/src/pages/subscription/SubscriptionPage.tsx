import React, { useState } from 'react';
import { SubscriptionManager } from '@/components/stripe/SubscriptionManager';
import { PricingTable } from '@/components/stripe/PricingTable';
import { PaymentMethodManager } from '@/components/stripe/PaymentMethodManager';
import { InvoiceViewer } from '@/components/stripe/InvoiceViewer';

const SubscriptionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'subscription' | 'plans' | 'credits' | 'payment' | 'invoices'>('subscription');

  const tabs = [
    { id: 'subscription', name: 'Minha Assinatura', description: 'Gerenciar assinatura atual' },
    { id: 'plans', name: 'Planos', description: 'Escolher ou trocar plano' },
    { id: 'credits', name: 'Créditos', description: 'Comprar créditos extras' },
    { id: 'payment', name: 'Pagamento', description: 'Métodos de pagamento' },
    { id: 'invoices', name: 'Faturas', description: 'Histórico de cobrança' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'subscription':
        return <SubscriptionManager />;
      case 'plans':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Planos de Assinatura</h2>
              <p className="text-gray-600">
                Escolha o plano que melhor atende às suas necessidades de créditos mensais.
              </p>
            </div>
            <PricingTable type="plans" />
          </div>
        );
      case 'credits':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Pacotes de Créditos</h2>
              <p className="text-gray-600">
                Compre créditos extras para usar quando precisar de mais processamento de IA.
              </p>
            </div>
            <PricingTable type="credits" />
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Métodos de Pagamento</h2>
              <p className="text-gray-600">
                Gerencie seus cartões de crédito e métodos de pagamento.
              </p>
            </div>
            <PaymentMethodManager />
          </div>
        );
      case 'invoices':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Histórico de Faturas</h2>
              <p className="text-gray-600">
                Visualize e baixe suas faturas anteriores.
              </p>
            </div>
            <InvoiceViewer />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Central de Assinaturas e Pagamentos
          </h1>
          <p className="text-lg text-gray-600">
            Gerencie sua assinatura, métodos de pagamento e histórico de faturas
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span>{tab.name}</span>
                    <span className="text-xs text-gray-400 hidden sm:block">
                      {tab.description}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          {renderTabContent()}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Precisa de Ajuda?
            </h3>
            <p className="text-blue-700 mb-4">
              Nossa equipe está aqui para ajudar com qualquer dúvida sobre assinaturas ou pagamentos.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
                Falar com Suporte
              </button>
              <button className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-600 px-4 py-2 rounded-md font-medium transition-colors">
                Central de Ajuda
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;