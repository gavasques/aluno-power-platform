import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  User, 
  Shield,
  Coins,
  Activity,
  AlertCircle
} from 'lucide-react';

interface CreditBalance {
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
}

interface FeatureCost {
  feature_key: string;
  feature_name: string;
  feature_category: string;
  credit_cost: number;
  estimated_api_cost: number;
  is_active: boolean;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function CreditTest() {
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user info
  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) throw new Error('Failed to fetch user');
      const data = await response.json();
      return data.user;
    }
  });

  // Get credit balance
  const { data: creditBalance, isLoading: balanceLoading } = useQuery<CreditBalance>({
    queryKey: ['/api/credit-test/balance'],
    queryFn: async () => {
      const response = await fetch('/api/credit-test/balance', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch balance');
      return response.json();
    }
  });

  // Get feature costs
  const { data: features = [], isLoading: featuresLoading } = useQuery<FeatureCost[]>({
    queryKey: ['/api/credit-test/features'],
    queryFn: async () => {
      const response = await fetch('/api/credit-test/features');
      if (!response.ok) throw new Error('Failed to fetch features');
      return response.json();
    }
  });

  // Debit credits mutation
  const debitMutation = useMutation({
    mutationFn: async (featureKey: string) => {
      const response = await fetch('/api/credit-test/debit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ featureKey })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to debit credits');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        description: data.message,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/credit-test/balance'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Check access mutation
  const checkAccessMutation = useMutation({
    mutationFn: async (featureKey: string) => {
      const response = await fetch('/api/credit-test/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ featureKey })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to check access');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.hasAccess ? "Acesso Liberado!" : "Acesso Negado",
        description: data.message,
        variant: data.hasAccess ? "default" : "destructive"
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const selectedFeatureData = features.find(f => f.feature_key === selectedFeature);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Sistema de Créditos - Teste</h1>
        <p className="text-muted-foreground">
          Teste o sistema simplificado de créditos onde apenas administradores têm acesso gratuito.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações do Usuário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <Badge variant={isAdmin ? "default" : "secondary"}>
                    {isAdmin ? "Administrador" : "Usuário"}
                  </Badge>
                </div>
                {isAdmin && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Acesso Gratuito Ativo</span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Como administrador, você tem acesso gratuito a todas as funcionalidades.
                    </p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Credit Balance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Saldo de Créditos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {balanceLoading ? (
              <p>Carregando saldo...</p>
            ) : creditBalance ? (
              <>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {creditBalance.currentBalance}
                  </p>
                  <p className="text-sm text-muted-foreground">créditos disponíveis</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total Ganho</p>
                    <p className="font-medium">{creditBalance.totalEarned}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Gasto</p>
                    <p className="font-medium">{creditBalance.totalSpent}</p>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-muted-foreground">Erro ao carregar saldo</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Testing */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Testar Funcionalidades
          </CardTitle>
          <CardDescription>
            Selecione uma funcionalidade para testar o sistema de débito de créditos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Escolha uma funcionalidade:
              </label>
              <Select value={selectedFeature} onValueChange={setSelectedFeature}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma funcionalidade..." />
                </SelectTrigger>
                <SelectContent>
                  {featuresLoading ? (
                    <SelectItem value="" disabled>Carregando...</SelectItem>
                  ) : (
                    features.map((feature) => (
                      <SelectItem key={feature.feature_key} value={feature.feature_key}>
                        {feature.feature_name} ({feature.credit_cost} créditos)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedFeatureData && (
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{selectedFeatureData.feature_name}</h4>
                        <Badge variant="outline" className="mt-1">
                          {selectedFeatureData.feature_category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">
                          {selectedFeatureData.credit_cost} créditos
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ~${selectedFeatureData.estimated_api_cost.toFixed(3)} USD
                        </p>
                      </div>
                    </div>

                    {!isAdmin && creditBalance && creditBalance.currentBalance < selectedFeatureData.credit_cost && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm text-red-700">
                          Saldo insuficiente. Você precisa de {selectedFeatureData.credit_cost} créditos, 
                          mas tem apenas {creditBalance.currentBalance}.
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => checkAccessMutation.mutate(selectedFeature)}
              disabled={!selectedFeature || checkAccessMutation.isPending}
              variant="outline"
              className="flex-1"
            >
              <Shield className="h-4 w-4 mr-2" />
              {checkAccessMutation.isPending ? "Verificando..." : "Verificar Acesso"}
            </Button>

            <Button
              onClick={() => debitMutation.mutate(selectedFeature)}
              disabled={!selectedFeature || debitMutation.isPending}
              className="flex-1"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {debitMutation.isPending ? "Processando..." : "Usar Funcionalidade"}
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p><strong>Verificar Acesso:</strong> Testa se você tem permissão para usar a funcionalidade (não consome créditos).</p>
            <p><strong>Usar Funcionalidade:</strong> Simula o uso real da funcionalidade (consome créditos, exceto para admins).</p>
          </div>
        </CardContent>
      </Card>

      {/* Feature List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Funcionalidades Disponíveis</CardTitle>
          <CardDescription>
            Lista completa de funcionalidades e seus custos em créditos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {featuresLoading ? (
              <p>Carregando funcionalidades...</p>
            ) : (
              features.map((feature) => (
                <div key={feature.feature_key} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{feature.feature_name}</p>
                    <p className="text-sm text-muted-foreground">{feature.feature_category}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={feature.is_active ? "default" : "secondary"}>
                      {feature.credit_cost} créditos
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      ${feature.estimated_api_cost.toFixed(3)} USD
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}