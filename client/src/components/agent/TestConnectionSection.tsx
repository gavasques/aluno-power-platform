import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { TestTube, Upload, Trash2, Download, FileJson } from "lucide-react";
import { useAgentData } from '@/hooks/useAgentData';
import type { Agent, AgentFormData } from '@/types/agent';

interface TestConnectionSectionProps {
  formData: AgentFormData;
  selectedAgent: Agent;
}

interface ReferenceImage {
  file: File;
  preview: string;
}

export const TestConnectionSection: React.FC<TestConnectionSectionProps> = ({
  formData,
  selectedAgent
}) => {
  const { testConnectionMutation } = useAgentData();
  const [testPrompt, setTestPrompt] = useState('Olá! Como você está hoje?');
  const [testResponse, setTestResponse] = useState('');
  const [requestSent, setRequestSent] = useState('');
  const [responseReceived, setResponseReceived] = useState('');
  const [referenceImages, setReferenceImages] = useState<ReferenceImage[]>([]);

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

    // Reset input
    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const clearImages = () => {
    setReferenceImages([]);
  };

  const handleTestConnection = async () => {
    if (!testPrompt.trim()) {
      return;
    }

    try {
      // Preparar imagens se houver
      const referenceImagesData = referenceImages.map(img => ({
        data: img.preview,
        filename: img.file.name
      }));

      const testData = {
        provider: formData.provider,
        model: formData.model,
        prompt: testPrompt,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
        reasoningLevel: formData.reasoningLevel,
        enableSearch: formData.enableSearch,
        enableImageUnderstanding: formData.enableImageUnderstanding,
        referenceImages: referenceImagesData.length > 0 ? referenceImagesData : undefined
      };

      const result = await testConnectionMutation.mutateAsync(testData);
      setTestResponse(result.response || 'Teste realizado com sucesso!');
      setRequestSent(result.requestSent || '');
      setResponseReceived(result.responseReceived || '');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Falha no teste de conexão";
      setTestResponse(`Erro: ${errorMsg}`);
      setRequestSent('');
      setResponseReceived('');
    }
  };

  return (
    <div className="space-y-4">
      <Separator />
      <h3 className="font-medium text-gray-900 flex items-center gap-2">
        <TestTube className="w-4 h-4" />
        Testar Conexão
      </h3>

      {/* Upload de imagens para teste */}
      {(formData.provider === 'openai' || formData.provider === 'xai') && (
        <div>
          <Label>Imagens para Teste (Opcional)</Label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="flex-1"
              />
              {referenceImages.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={clearImages}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
            
            {referenceImages.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {referenceImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-20 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 w-6 h-6 p-0"
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

      {/* Prompt de teste */}
      <div>
        <Label htmlFor="testPrompt">Prompt de Teste</Label>
        <Textarea
          id="testPrompt"
          value={testPrompt}
          onChange={(e) => setTestPrompt(e.target.value)}
          placeholder="Digite um prompt para testar o modelo..."
          rows={3}
        />
      </div>

      {/* Botão de teste */}
      <Button 
        onClick={handleTestConnection}
        disabled={testConnectionMutation.isPending || !formData.model || !testPrompt.trim()}
        className="w-full"
      >
        {testConnectionMutation.isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Testando...
          </>
        ) : (
          <>
            <TestTube className="w-4 h-4 mr-2" />
            Testar Conexão
          </>
        )}
      </Button>

      {/* Resposta do teste */}
      {testResponse && (
        <div>
          <Label>Resposta do Teste</Label>
          <div className="p-4 border rounded-lg bg-gray-50 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
            {testResponse}
          </div>
        </div>
      )}

      {/* Debug information */}
      {(requestSent || responseReceived) && (
        <div className="space-y-4">
          {requestSent && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium text-gray-700">
                  Request Enviado (Debug)
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([requestSent], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'request.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download JSON
                </Button>
              </div>
              <div className="p-4 border rounded-lg bg-slate-900 text-green-400 text-sm font-mono overflow-x-auto max-h-60">
                <pre>{requestSent}</pre>
              </div>
            </div>
          )}

          {responseReceived && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-xs font-medium text-gray-700">
                  Response Recebido (Debug)
                </Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([responseReceived], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'response.json';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download JSON
                </Button>
              </div>
              <div className="p-4 border rounded-lg bg-slate-900 text-blue-400 text-sm font-mono overflow-x-auto max-h-60">
                <pre>{responseReceived}</pre>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};