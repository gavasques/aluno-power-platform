/**
 * COMPONENTE: ExportButton
 * Botão para exportar dados da comparação
 * Extraído de CompararListings.tsx para modularização
 */
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportButtonProps } from '../../types';

export const ExportButton = ({ results, loading, onExport }: ExportButtonProps) => {
  const hasResults = results.length > 0;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      disabled={!hasResults || loading}
      className="text-green-600 border-green-200 hover:bg-green-50"
    >
      <Download className="h-4 w-4 mr-1" />
      Exportar TXT
    </Button>
  );
};