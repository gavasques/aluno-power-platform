import React from 'react';

interface CharacterCounterProps {
  current: number;
  max: number;
  warningThreshold: number;
}

export const CharacterCounter: React.FC<CharacterCounterProps> = ({
  current,
  max,
  warningThreshold
}) => {
  const getColorClass = () => {
    if (current >= max) return 'text-red-600 font-bold';
    if (current >= warningThreshold) return 'text-yellow-600 font-semibold';
    return 'text-gray-600';
  };

  const getBackgroundClass = () => {
    if (current >= max) return 'bg-red-50 border-red-200';
    if (current >= warningThreshold) return 'bg-yellow-50 border-yellow-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={`px-3 py-1 rounded-md border text-sm ${getBackgroundClass()}`}>
      <span className={getColorClass()}>
        {current}/{max} caracteres
      </span>
    </div>
  );
};