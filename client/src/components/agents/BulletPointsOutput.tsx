import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';

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
  const handleDownload = () => {
    if (!value.trim()) return;
    
    // Criar nome do arquivo com timestamp
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const filename = `bullet_points_${year}${month}${day}_${hours}${minutes}${seconds}.txt`;
    
    // Criar e fazer download do arquivo
    const blob = new Blob([value], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Bullet Points Gerados
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            disabled={!value}
          >
            <Download className="h-4 w-4 mr-1" />
            Download TXT
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCopy}
            disabled={!value}
          >
            <Copy className="h-4 w-4 mr-1" />
            Copiar
          </Button>
        </div>
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