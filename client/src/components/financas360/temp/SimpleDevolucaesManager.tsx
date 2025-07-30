import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export default function SimpleDevolucaesManager() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 text-red-600" />
          Devoluções
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Sistema de devoluções em desenvolvimento.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Este módulo estará disponível em breve.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}