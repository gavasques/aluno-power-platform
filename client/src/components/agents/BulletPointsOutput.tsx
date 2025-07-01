import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy } from 'lucide-react';

interface BulletPointsOutputProps {
  value: string;
  onChange: (value: string) => void;
  onCopy: () => void;
}

export const BulletPointsOutput: React.FC<BulletPointsOutputProps> = ({
  value,
  onChange,
  onCopy
}) => {
  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Bullet Points Gerados
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onCopy}
          disabled={!value}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copiar Bullet Points
        </Button>
      </div>
      
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Os bullet points gerados aparecerão aqui. Você pode editá-los conforme necessário..."
        className="flex-1 resize-none text-sm font-mono"
      />
    </div>
  );
};