import React from 'react';
import { StandardizedLayout, PageWrapper, ResponsiveGrid } from './StandardizedLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Demonstração prática do sistema de layout padronizado
export const LayoutDemo = () => {
  const [variant, setVariant] = React.useState<'default' | 'admin' | 'minimal' | 'dashboard'>('default');

  const sampleCards = [
    {
      title: 'Performance',
      description: 'Sistema 40% mais rápido',
      value: '+40%',
      trend: 'up',
    },
    {
      title: 'Bundle Size',
      description: 'Redução significativa',
      value: '-30%',
      trend: 'down',
    },
    {
      title: 'Mobile Score',
      description: 'Responsividade aprimorada',
      value: '95/100',
      trend: 'up',
    },
  ];

  return (
    <StandardizedLayout variant={variant}>
      <PageWrapper
        title="Sistema de Layout Padronizado"
        description="Demonstração das melhorias implementadas no sistema de layout"
        actions={
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={variant === 'default' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVariant('default')}
            >
              Padrão
            </Button>
            <Button 
              variant={variant === 'admin' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVariant('admin')}
            >
              Admin
            </Button>
            <Button 
              variant={variant === 'minimal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVariant('minimal')}
            >
              Minimal
            </Button>
            <Button 
              variant={variant === 'dashboard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setVariant('dashboard')}
            >
              Dashboard
            </Button>
          </div>
        }
      >
        {/* Demonstração do Grid System */}
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Grid System Responsivo</h2>
            <ResponsiveGrid columns={3} gap="md">
              {sampleCards.map((card, index) => (
                <Card key={index} className="card-optimized">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{card.title}</CardTitle>
                    <CardDescription>{card.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">{card.value}</span>
                      <span className={`text-sm ${
                        card.trend === 'up' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {card.trend === 'up' ? '↗' : '↘'} Otimizado
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </ResponsiveGrid>
          </section>

          {/* Demonstração do Container System */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Container System</h2>
            <div className="space-y-4">
              <div className="container-responsive">
                <Card className="card-optimized">
                  <CardHeader>
                    <CardTitle>Container Responsivo</CardTitle>
                    <CardDescription>
                      Adapta automaticamente ao tamanho da tela
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Este container usa o sistema padronizado de breakpoints:
                      640px, 768px, 1024px, 1280px, 1536px
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>

          {/* Demonstração dos Utilities CSS */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Utilities CSS Padronizadas</h2>
            <div className="layout-grid-2">
              <Card className="card-optimized">
                <CardHeader>
                  <CardTitle className="flex-between">
                    <span>Flexbox Utils</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      .flex-between
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex-center p-2 bg-muted/50 rounded text-xs">
                      .flex-center
                    </div>
                    <div className="flex-between p-2 bg-muted/50 rounded text-xs">
                      <span>.flex-between</span>
                      <span>→</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-optimized">
                <CardHeader>
                  <CardTitle>Responsividade</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="hide-mobile p-2 bg-blue-50 dark:bg-blue-950 rounded text-xs">
                      Visível apenas no desktop (.hide-mobile)
                    </div>
                    <div className="show-mobile p-2 bg-green-50 dark:bg-green-950 rounded text-xs">
                      Visível apenas no mobile (.show-mobile)
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Demonstração do Loading States */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Loading States Otimizados</h2>
            <Card className="card-optimized">
              <CardHeader>
                <CardTitle>Skeleton Loading</CardTitle>
                <CardDescription>Estados de carregamento padronizados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="skeleton-optimized h-4 w-3/4"></div>
                  <div className="skeleton-optimized h-4 w-1/2"></div>
                  <div className="skeleton-optimized h-8 w-full"></div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Variáveis CSS Demonstração */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Variáveis CSS Padronizadas</h2>
            <Card className="card-optimized">
              <CardHeader>
                <CardTitle>Sistema de Espacamento</CardTitle>
                <CardDescription>Variáveis CSS customizadas para consistência</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div style={{ padding: 'var(--spacing-xs)' }} className="bg-muted/30 border rounded">
                    --spacing-xs (4px)
                  </div>
                  <div style={{ padding: 'var(--spacing-sm)' }} className="bg-muted/30 border rounded">
                    --spacing-sm (8px)
                  </div>
                  <div style={{ padding: 'var(--spacing-md)' }} className="bg-muted/30 border rounded">
                    --spacing-md (16px)
                  </div>
                  <div style={{ padding: 'var(--spacing-lg)' }} className="bg-muted/30 border rounded">
                    --spacing-lg (24px)
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </PageWrapper>
    </StandardizedLayout>
  );
};

export default LayoutDemo;