import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, Receipt, Settings, Package } from 'lucide-react';
import { SubscriptionPlans } from '@/components/stripe/SubscriptionPlans';

export default function MySubscriptions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assinaturas e Pagamentos</h1>
        <p className="text-muted-foreground mt-2">
          Gerencie sua assinatura, compre créditos e visualize seu histórico de pagamentos.
        </p>
      </div>

      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Planos
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Minha Assinatura
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Créditos
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Escolha seu Plano</CardTitle>
              <CardDescription>
                Selecione o plano ideal para suas necessidades de e-commerce
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionPlans />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status da Assinatura</CardTitle>
              <CardDescription>
                Visualize e gerencie sua assinatura atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  As informações da sua assinatura são exibidas na aba "Planos"
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Créditos</CardTitle>
              <CardDescription>
                Compre créditos adicionais ou visualize seu saldo atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Os pacotes de créditos estão disponíveis na aba "Planos"
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>
                Visualize todas as suas transações e faturas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Seu histórico de pagamentos aparecerá aqui após suas primeiras transações
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}