import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function SimpleNotasFiscaisManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-6 w-6 text-green-600" />
          Notas Fiscais
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Sistema de notas fiscais em desenvolvimento.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Este módulo estará disponível em breve.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}