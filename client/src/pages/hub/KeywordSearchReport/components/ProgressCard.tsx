import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { SearchState } from '../types';

interface ProgressCardProps {
  state: SearchState;
}

export const ProgressCard: React.FC<ProgressCardProps> = memo(({ state }) => {
  if (!state.isSearching) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progresso da Busca</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={state.progress} className="w-full" />
        <div className="text-sm text-muted-foreground">
          <div>Página atual: {state.currentPage}/{state.totalPages}</div>
          <div>{Math.round(state.progress)}% concluído</div>
          <div>Produtos encontrados: {state.products.length}</div>
        </div>
      </CardContent>
    </Card>
  );
});