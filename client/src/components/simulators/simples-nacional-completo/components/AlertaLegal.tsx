import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

export const AlertaLegal = () => {
  return (
    <Alert>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <strong>Aviso:</strong> Este simulador é apenas para fins de estimativa. 
        Consulte sempre um contador para valores oficiais e orientações específicas.
      </AlertDescription>
    </Alert>
  );
};