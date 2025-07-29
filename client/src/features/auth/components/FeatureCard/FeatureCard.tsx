/**
 * COMPONENTE: FeatureCard  
 * Card de feature reutilizável
 * Extraído de LoginNew.tsx para modularização
 */
import { FeatureCardProps } from '../../types';

export const FeatureCard = ({ icon, title, description, color }: FeatureCardProps) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};