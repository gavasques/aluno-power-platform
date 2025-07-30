import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Invoice } from '@/types/stripe';
import { formatters } from '@/lib/utils/unifiedFormatters';

export const InvoiceViewer: React.FC = () => {
  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['/api/stripe/invoices'],
    queryFn: () => apiRequest('/api/stripe/invoices'),
  });

  const invoices = invoicesData as Invoice[] | null;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'bg-green-100 text-green-800',
      open: 'bg-yellow-100 text-yellow-800',
      void: 'bg-gray-100 text-gray-800',
      uncollectible: 'bg-red-100 text-red-800',
      draft: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      paid: 'Pago',
      open: 'Em Aberto',
      void: 'Cancelado',
      uncollectible: 'Não Cobrado',
      draft: 'Rascunho',
    };
    return statusMap[status] || status;
  };

  const formatCurrency = (amount: number, currency: string) => {
    return formatters.currency(amount / 100, { currency: currency.toUpperCase() });
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Histórico de Faturas</h3>

      {invoices && invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-medium">
                    Fatura #{invoice.number}
                  </h4>
                  <p className="text-sm text-gray-600">
                    Emitida em {formatDate(invoice.created)}
                  </p>
                  {invoice.due_date && (
                    <p className="text-sm text-gray-600">
                      Vencimento: {formatDate(invoice.due_date)}
                    </p>
                  )}
                </div>
                
                <span
                  className={`
                    inline-flex px-2 py-1 text-xs font-semibold rounded-full
                    ${getStatusColor(invoice.status)}
                  `}
                >
                  {getStatusText(invoice.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="font-medium">
                    {formatCurrency(invoice.amount_paid || invoice.amount_due, invoice.currency)}
                  </p>
                </div>
                
                {invoice.amount_due > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Valor Devido</p>
                    <p className="font-medium text-red-600">
                      {formatCurrency(invoice.amount_due, invoice.currency)}
                    </p>
                  </div>
                )}
                
                {invoice.amount_paid > 0 && (
                  <div>
                    <p className="text-sm text-gray-600">Valor Pago</p>
                    <p className="font-medium text-green-600">
                      {formatCurrency(invoice.amount_paid, invoice.currency)}
                    </p>
                  </div>
                )}
              </div>

              {invoice.lines.data.length > 0 && (
                <div className="mb-4">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">Itens</h5>
                  <div className="space-y-1">
                    {invoice.lines.data.map((line, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{line.description}</span>
                        <span className="font-medium">
                          {formatCurrency(line.amount, line.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                {invoice.hosted_invoice_url && (
                  <a
                    href={invoice.hosted_invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Visualizar Fatura
                  </a>
                )}
                
                {invoice.invoice_pdf && (
                  <a
                    href={invoice.invoice_pdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Baixar PDF
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5l3-3m0 0l3 3m-3-3v12"
            />
          </svg>
          <h4 className="mt-2 text-lg font-medium text-gray-900">
            Nenhuma fatura encontrada
          </h4>
          <p className="mt-1 text-sm text-gray-500">
            Suas faturas aparecerão aqui quando você fizer uma compra.
          </p>
        </div>
      )}
    </div>
  );
};