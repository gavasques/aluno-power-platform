import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

export default function SimpleLancamentosManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-6 w-6 text-blue-600" />
          Lançamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Sistema de lançamentos em desenvolvimento.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Este módulo estará disponível em breve.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}