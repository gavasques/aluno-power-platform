/**
 * Componente de apresentação para teste de conexão
 * Interface para testar conectividade com providers de IA
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  TestTube, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  FileJson,
  Download
} from "lucide-react";
import type { TestConnectionProps, TestConnection } from '../../types/agent.types';

export const TestConnectionCard = ({
  selectedAgent,
  onTest,
  isLoading = false
}: TestConnectionProps) => {
  const [testMessage, setTestMessage] = useState("Este é um teste de conexão. Responda apenas 'Conexão bem-sucedida!'");
  const [testResult, setTestResult] = useState<any>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  if (!selectedAgent) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Teste de Conexão
          </h3>
          <p className="text-gray-600">
            Selecione um agente para testar a conectividade com o provider de IA.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleTest = async () => {
    if (!selectedAgent) return;

    setIsTestingConnection(true);
    setTestResult(null);

    const testData: TestConnection = {
      provider: selectedAgent.provider,
      model: selectedAgent.model,
      testMessage,
      temperature: selectedAgent.temperature,
      maxTokens: 100
    };

    try {
      const result = await onTest(testData);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        duration: 0
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const downloadResult = () => {
    if (!testResult) return;
    
    const blob = new Blob([JSON.stringify(testResult, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-result-${selectedAgent.name}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Teste de Conexão
          <Badge variant="outline">{selectedAgent.name}</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Agent Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Provider:</span>
              <span className="ml-2">{selectedAgent.provider}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Modelo:</span>
              <span className="ml-2">{selectedAgent.model}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Temperatura:</span>
              <span className="ml-2">{selectedAgent.temperature}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Max Tokens:</span>
              <span className="ml-2">{selectedAgent.maxTokens}</span>
            </div>
          </div>
        </div>

        {/* Test Message */}
        <div className="space-y-2">
          <Label htmlFor="testMessage">Mensagem de Teste</Label>
          <Textarea
            id="testMessage"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder="Digite uma mensagem para testar o agente..."
            rows={3}
          />
          <p className="text-xs text-gray-600">
            Esta mensagem será enviada para o agente para testar a conectividade.
          </p>
        </div>

        {/* Test Button */}
        <Button 
          onClick={handleTest}
          disabled={isTestingConnection || isLoading || !testMessage.trim()}
          className="w-full"
        >
          <Zap className="w-4 h-4 mr-2" />
          {isTestingConnection ? 'Testando Conexão...' : 'Executar Teste'}
        </Button>

        <Separator />

        {/* Test Results */}
        {testResult && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Resultado do Teste</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadResult}
              >
                <Download className="w-4 h-4 mr-2" />
                Download JSON
              </Button>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <Badge 
                variant={testResult.success ? "secondary" : "destructive"}
                className={testResult.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {testResult.success ? 'Sucesso' : 'Falha'}
              </Badge>
              {testResult.duration && (
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{testResult.duration}ms</span>
                </Badge>
              )}
            </div>

            {/* Metrics */}
            {testResult.success && (
              <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <div className="font-bold text-green-800">
                    {testResult.duration || 0}ms
                  </div>
                  <div className="text-xs text-green-600">Duração</div>
                </div>
                {testResult.tokensUsed && (
                  <div className="text-center">
                    <div className="font-bold text-green-800">
                      {testResult.tokensUsed}
                    </div>
                    <div className="text-xs text-green-600">Tokens</div>
                  </div>
                )}
                {testResult.cost && (
                  <div className="text-center">
                    <div className="font-bold text-green-800">
                      ${testResult.cost.toFixed(4)}
                    </div>
                    <div className="text-xs text-green-600">Custo</div>
                  </div>
                )}
              </div>
            )}

            {/* Success Response */}
            {testResult.success && testResult.response && (
              <div className="space-y-2">
                <Label>Resposta do Agente</Label>
                <div className="p-4 border rounded-lg bg-gray-50">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700">
                    {testResult.response}
                  </pre>
                </div>
              </div>
            )}

            {/* Error Details */}
            {!testResult.success && testResult.error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Erro na Conexão</div>
                  <div className="text-sm">{testResult.error}</div>
                </AlertDescription>
              </Alert>
            )}

            {/* Raw JSON Response (for debugging) */}
            <details className="space-y-2">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                Ver resposta completa (JSON)
              </summary>
              <div className="p-4 border rounded-lg bg-slate-900 text-blue-400 text-sm font-mono overflow-x-auto max-h-60">
                <pre>{JSON.stringify(testResult, null, 2)}</pre>
              </div>
            </details>
          </div>
        )}

        {/* Testing Progress */}
        {isTestingConnection && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Testando conexão...</span>
          </div>
        )}

        {/* Help Text */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">💡 Dicas para Teste</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Use mensagens simples para testar conectividade básica</li>
            <li>• Verifique se as credenciais do provider estão configuradas</li>
            <li>• Teste diferentes temperaturas para ver variações na resposta</li>
            <li>• Use o modo de debug para ver detalhes técnicos</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};