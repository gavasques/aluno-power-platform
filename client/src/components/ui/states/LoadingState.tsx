/**
 * Componente reutilizável para estados de carregamento
 * Elimina duplicação dos estados de loading nos managers
 */

import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingState({ 
  message = "Carregando...", 
  size = 'md',
  className = "" 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const containerClasses = {
    sm: 'p-4',
    md: 'p-8',
    lg: 'p-12'
  };

  return (
    <div className={`flex items-center justify-center ${containerClasses[size]} ${className}`}>
      <div className="text-center">
        <div 
          className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600 mx-auto mb-4`}
        />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}