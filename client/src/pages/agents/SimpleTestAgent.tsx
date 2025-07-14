import React from 'react';


const SimpleTestAgent: React.FC = () => {
  return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            HTML Description Agent - Versão Simples
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Este é um teste simplificado do agente de HTML Description.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Status:</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Componente carregado</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Sem hooks complexos</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>PermissionGuard funcional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default SimpleTestAgent;