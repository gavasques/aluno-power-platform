import React from 'react';

interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Carregando...',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const containerHeight = {
    sm: 'h-32',
    md: 'h-64',
    lg: 'h-96'
  };

  return (
    <div className={`flex items-center justify-center ${containerHeight[size]} ${className}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-primary mx-auto mb-4`}></div>
        {message && <p className="text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingState;