import React from 'react';
import { CheckoutButton } from './CheckoutButton';
import { STRIPE_CONFIG, Plan, CreditPackage } from '@/types/stripe';

interface PricingTableProps {
  type: 'plans' | 'credits';
}

export const PricingTable: React.FC<PricingTableProps> = ({ type }) => {
  const items = type === 'plans' ? STRIPE_CONFIG.plans : STRIPE_CONFIG.creditPackages;

  if (type === 'plans') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(items as Plan[]).map((plan) => (
          <div
            key={plan.id}
            className={`
              relative border rounded-lg p-6
              ${plan.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
            `}
          >
            {plan.popular && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white px-2 py-1 text-xs rounded-bl">
                Mais Popular
              </div>
            )}

            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-3xl font-bold mb-4">
              R$ {plan.price.toFixed(2)}
              <span className="text-sm font-normal text-gray-600">/mês</span>
            </p>

            <ul className="space-y-2 mb-6">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {plan.credits.toLocaleString()} créditos/mês
              </li>
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <CheckoutButton
              type="subscription"
              priceId={plan.priceId}
              planName={plan.name}
              className="w-full"
            >
              Assinar {plan.name}
            </CheckoutButton>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {(items as CreditPackage[]).map((pkg) => (
        <div
          key={pkg.id}
          className="border border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors"
        >
          <h3 className="text-lg font-semibold mb-2">{pkg.name}</h3>
          <p className="text-2xl font-bold mb-4">
            R$ {pkg.price.toFixed(2)}
          </p>

          <div className="space-y-2 mb-6">
            <p className="text-gray-600">
              {pkg.credits.toLocaleString()} créditos
            </p>
            {pkg.bonus && (
              <p className="text-green-600 font-medium">
                + {pkg.bonus} créditos bônus
              </p>
            )}
            {pkg.bonus && (
              <p className="text-sm text-gray-500">
                Total: {(pkg.credits + pkg.bonus).toLocaleString()} créditos
              </p>
            )}
          </div>

          <CheckoutButton
            type="credits"
            priceId={pkg.priceId}
            creditsAmount={pkg.credits}
            className="w-full"
          >
            Comprar Créditos
          </CheckoutButton>
        </div>
      ))}
    </div>
  );
};