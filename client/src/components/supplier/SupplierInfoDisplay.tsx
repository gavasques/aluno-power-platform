import React from 'react';
import type { Supplier } from '@shared/schema';

interface SupplierInfoDisplayProps {
  supplier: Supplier;
}

export const SupplierInfoDisplay: React.FC<SupplierInfoDisplayProps> = ({ supplier }) => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              Informações Básicas
            </h4>
            <div className="space-y-3">
              <InfoRow label="Nome Fantasia" value={supplier.tradeName} />
              <InfoRow label="Razão Social" value={supplier.corporateName} />
              {supplier.cnpj && <InfoRow label="CNPJ" value={supplier.cnpj} />}
              {supplier.supplierType && (
                <InfoRow label="Tipo" value={supplier.supplierType} className="capitalize" />
              )}
            </div>
          </div>
          
          {(supplier.stateRegistration || supplier.municipalRegistration) && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                Inscrições
              </h4>
              <div className="space-y-3">
                {supplier.stateRegistration && (
                  <InfoRow label="Inscrição Estadual" value={supplier.stateRegistration} />
                )}
                {supplier.municipalRegistration && (
                  <InfoRow label="Inscrição Municipal" value={supplier.municipalRegistration} />
                )}
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Localização
          </h4>
          <div className="space-y-3">
            {supplier.country && <InfoRow label="País" value={supplier.country} />}
            {supplier.state && <InfoRow label="Estado" value={supplier.state} />}
            {supplier.city && <InfoRow label="Cidade" value={supplier.city} />}
            {supplier.cep && <InfoRow label="CEP" value={supplier.cep} />}
            {supplier.address && (
              <div className="flex flex-col">
                <span className="font-medium text-gray-700 mb-1">Endereço:</span>
                <span className="text-gray-900 p-3 bg-gray-50 rounded border text-sm">
                  {supplier.address}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {supplier.description && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Descrição
          </h4>
          <div className="p-4 bg-gray-50 rounded border">
            <p className="text-gray-700 leading-relaxed">{supplier.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface InfoRowProps {
  label: string;
  value: string;
  className?: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, className = '' }) => (
  <div className="flex justify-between">
    <span className="font-medium text-gray-700 w-32">{label}:</span>
    <span className={`text-gray-900 flex-1 ${className}`}>{value}</span>
  </div>
);