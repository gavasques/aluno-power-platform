import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestImagePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Teste: Página de Imagens Funcionando</h1>
      <Card>
        <CardHeader>
          <CardTitle>Rota /admin/images está funcionando!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Se você está vendo esta página, a navegação está funcionando corretamente.</p>
          <p className="mt-2">URL atual: {window.location.pathname}</p>
        </CardContent>
      </Card>
    </div>
  );
}