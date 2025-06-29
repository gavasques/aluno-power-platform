import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TestTube, Upload, Trash2, ImageIcon, CheckCircle2, AlertTriangle } from "lucide-react";

interface TestResponse {
  success: boolean;
  message: string;
  response?: string;
  requestSent?: string;
  responseReceived?: string;
  duration?: number;
  cost?: number;
}

interface ReferenceImage {
  file: File;
  preview: string;
}

interface ProviderTestPanelProps {
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
  onTest: (data: {
    provider: string;
    model: string;
    prompt: string;
    temperature: number;
    maxTokens: number;
    referenceImages?: File[];
  }) => Promise<TestResponse>;
}

export default function ProviderTestPanel({
  provider,
  model,
  temperature,
  maxTokens,
  onTest
}: ProviderTestPanelProps) {
  const [testPrompt, setTestPrompt] = useState('Olá! Como você está hoje?');
  const [testResponse, setTestResponse] = useState('');
  const [requestSent, setRequestSent] = useState('');
  const [responseReceived, setResponseReceived] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);
  const [lastTestResult, setLastTestResult] = useState<TestResponse | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = e.target?.result as string;
          setReferenceImages(prev => [...prev, { file, preview }]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleTest = async () => {
    if (!model) {
      setLastTestResult({
        success: false,
        message: "Selecione um modelo antes de testar"
      });
      return;
    }

    setIsLoading(true);
    setLastTestResult(null);

    try {
      const result = await onTest({
        provider,
        model,
        prompt: testPrompt,
        temperature,
        maxTokens,
        referenceImages: referenceImages.map(img => img.file)
      });

      setLastTestResult(result);
      if (result.success) {
        setTestResponse(result.response || '');
        setRequestSent(result.requestSent || '');
        setResponseReceived(result.responseReceived || '');
      }
    } catch (error: any) {
      setLastTestResult({
        success: false,
        message: `Erro: ${error.message || 'Falha na conexão'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          Teste de Conexão
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="testPrompt">Prompt de Teste</Label>
          <Textarea
            id="testPrompt"
            value={testPrompt}
            onChange={(e) => setTestPrompt(e.target.value)}
            placeholder="Digite uma mensagem para testar o modelo"
            className="mt-2"
            rows={3}
          />
        </div>

        {(model === 'gpt-image-edit' || model === 'gpt-image-1') && (
          <div>
            <Label htmlFor="referenceImages">
              Imagens de Referência {model === 'gpt-image-edit' ? '(Obrigatório para edição)' : '(Opcional para criação)'}
            </Label>
            <div className="mt-2 space-y-2">
              <Input
                id="referenceImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="cursor-pointer"
              />
              
              {referenceImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {referenceImages.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(index)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <Button 
          onClick={handleTest} 
          disabled={isLoading || !model || (model === 'gpt-image-edit' && referenceImages.length === 0)}
          className="w-full"
        >
          <TestTube className="w-4 h-4 mr-2" />
          {isLoading ? 'Testando...' : 'Testar Conexão'}
        </Button>

        {lastTestResult && (
          <Alert variant={lastTestResult.success ? "default" : "destructive"}>
            <div className="flex items-center gap-2">
              {lastTestResult.success ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertTriangle className="w-4 h-4" />
              )}
              <AlertDescription>{lastTestResult.message}</AlertDescription>
            </div>
          </Alert>
        )}

        {testResponse && (
          <div>
            <Label>Resposta do Modelo</Label>
            <Textarea
              value={testResponse}
              readOnly
              className="mt-2 bg-gray-50"
              rows={4}
            />
          </div>
        )}

        {(requestSent || responseReceived) && (
          <details className="text-sm">
            <summary className="cursor-pointer font-medium">Detalhes da Requisição</summary>
            <div className="mt-2 space-y-2">
              {requestSent && (
                <div>
                  <Label>Requisição Enviada:</Label>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {requestSent}
                  </pre>
                </div>
              )}
              {responseReceived && (
                <div>
                  <Label>Resposta Recebida:</Label>
                  <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                    {responseReceived}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}
      </CardContent>
    </Card>
  );
}