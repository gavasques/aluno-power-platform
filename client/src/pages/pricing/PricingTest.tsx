import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Database, Calculator, Activity } from 'lucide-react';

export default function PricingTest() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    addLog("Testando conexão com banco de dados...");
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/products', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        addLog(`✅ Conexão OK - ${data.length || 0} produtos encontrados`);
      } else {
        addLog(`❌ Erro na conexão: ${response.status}`);
      }
    } catch (error) {
      addLog(`❌ Erro de rede: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const testPricingAPI = async () => {
    setIsLoading(true);
    addLog("Testando APIs de precificação...");
    
    const endpoints = [
      '/api/pricing/states',
      '/api/pricing/channels',
      '/api/categories'
    ];
    
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    for (const endpoint of endpoints) {
      try {
        addLog(`Testando ${endpoint}...`);
        const response = await fetch(endpoint, { headers });
        
        if (response.ok) {
          const data = await response.json();
          addLog(`✅ ${endpoint}: ${data.length || 0} registros`);
        } else {
          addLog(`❌ ${endpoint}: Status ${response.status}`);
        }
      } catch (error) {
        addLog(`❌ ${endpoint}: Erro ${error.message}`);
      }
    }
    
    setIsLoading(false);
  };

  const testCalculation = async () => {
    setIsLoading(true);
    addLog("Testando cálculo de precificação...");
    
    try {
      const calculationData = {
        productId: 1,
        channelId: 1,
        salePrice: 100.00
      };
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(calculationData)
      });
      
      if (response.ok) {
        const result = await response.json();
        addLog(`✅ Cálculo realizado - Lucro: R$ ${result.profit?.toFixed(2) || 'N/A'}`);
      } else {
        const error = await response.text();
        addLog(`❌ Erro no cálculo: ${error}`);
      }
    } catch (error) {
      addLog(`❌ Erro no cálculo: ${error.message}`);
    }
    
    setIsLoading(false);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teste do Sistema de Precificação</h1>
          <p className="text-muted-foreground">
            Ferramenta de diagnóstico para verificar o funcionamento do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Database Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Banco de Dados
            </CardTitle>
            <CardDescription>
              Testa a conexão e consulta básica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testDatabaseConnection}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                "Testar Conexão"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* API Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              APIs
            </CardTitle>
            <CardDescription>
              Testa endpoints de dados básicos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testPricingAPI}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                "Testar APIs"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Calculation Test */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Cálculo
            </CardTitle>
            <CardDescription>
              Testa o engine de precificação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testCalculation}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Calculando...
                </>
              ) : (
                "Testar Cálculo"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Logs Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Logs de Teste</CardTitle>
            <Button onClick={clearLogs} variant="outline" size="sm">
              Limpar
            </Button>
          </div>
          <CardDescription>
            Resultados dos testes em tempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 rounded-md p-4 h-64 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500 text-sm">Nenhum teste executado ainda...</p>
            ) : (
              <div className="space-y-1">
                {logs.map((log, index) => (
                  <div key={index} className="text-sm font-mono">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Links para outras funcionalidades do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full" asChild>
            <a href="/calculadora">
              Ir para Calculadora Completa
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}