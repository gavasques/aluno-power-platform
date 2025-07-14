import React from 'react';


const TestAgent: React.FC = () => {
  return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Teste do Sistema de Agentes
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Se você está vendo esta página, o sistema de roteamento está funcionando.
          </p>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Status do Sistema:</h2>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Roteamento dinâmico funcionando</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>PermissionGuard carregado</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span>Layout removido dos componentes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
  );
};

export default TestAgent;