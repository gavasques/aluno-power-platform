/**
 * LogoGeneratorTool Component - Reusable logo generation form
 * 
 * Features:
 * - Professional form with all logo generation parameters
 * - Real-time validation and feedback
 * - Multiple logo results display
 * - Reference image upload support
 * - Credit cost display and validation
 * - Download functionality for all generated logos
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, Loader2, AlertCircle, CheckCircle, History } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import LogoHistoryModal from './LogoHistoryModal';
import { logger } from "@/utils/logger";
import { useCreditSystem } from '@/hooks/useCreditSystem';

interface LogoGeneratorToolProps {
  onLogoGenerated?: (results: any) => void;
  disabled?: boolean;
}

interface LogoResult {
  url: string;
  id: string;
  base64: string;
}

const colorTones = [
  { value: 'Auto', label: 'Auto' },
  { value: 'Gray', label: 'Cinza' },
  { value: 'Blue', label: 'Azul' },
  { value: 'Pink', label: 'Rosa' },
  { value: 'Orange', label: 'Laranja' },
  { value: 'Brown', label: 'Marrom' },
  { value: 'Yellow', label: 'Amarelo' },
  { value: 'Green', label: 'Verde' },
  { value: 'Purple', label: 'Roxo' },
  { value: 'Red', label: 'Vermelho' }
];

const FEATURE_CODE = 'tools.logo_generation';

export const LogoGeneratorTool: React.FC<LogoGeneratorToolProps> = ({ 
  onLogoGenerated, 
  disabled = false 
}) => {
  const [formData, setFormData] = useState({
    brandName: '',
    businessDescription: '',
    colorTone: 'Auto',
    logoDescription: '',
    referenceImage: '',
    count: 2
  });
  const [logos, setLogos] = useState<LogoResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const { toast } = useToast();
  const { checkCredits, showInsufficientCreditsToast, logAIGeneration } = useCreditSystem();

  // Get feature cost for dynamic pricing
  const { data: featureCosts } = useQuery({
    queryKey: ['/api/feature-costs'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const logoGenerationCostPerLogo = featureCosts?.data?.byCategory?.['Ferramentas']?.find(
    (item: any) => item.featureName === 'tools.logo_generation'
  )?.costPerUse || 10;
  
  const totalCost = logoGenerationCostPerLogo * formData.count;

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 5MB",
          variant: "destructive"
        });
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Tipo de arquivo inválido",
          description: "Apenas imagens são permitidas",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setFormData(prev => ({ ...prev, referenceImage: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.brandName.trim() || !formData.businessDescription.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome da marca e descrição do negócio são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Verificar créditos primeiro
    const creditCheck = await checkCredits(FEATURE_CODE);
    if (!creditCheck.canProcess) {
      showInsufficientCreditsToast(creditCheck.requiredCredits, creditCheck.currentBalance);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setLogos([]);

    try {
      logger.debug('🎨 Sending logo generation request:', formData);
      
      const response = await fetch('/api/picsart/logo-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      logger.debug('🎨 Logo generation response:', result);

      if (!response.ok) {
        throw new Error(result.error || result.details || 'Falha na geração de logomarcas');
      }

      if (result.success && result.data.logos) {
        setLogos(result.data.logos);
        onLogoGenerated?.(result.data);

        // Registrar log de uso com dedução automática de créditos
        await logAIGeneration({
          featureCode: FEATURE_CODE,
          provider: 'picsart',
          model: 'logo-generation-ai',
          prompt: `Geração de logo para marca: ${formData.brandName}`,
          response: `${result.data.logos.length} logomarcas geradas com sucesso`,
          inputTokens: 0,
          outputTokens: 0,
          totalTokens: 0,
          cost: 0,
          duration: result.data.processingTime || 0
        });
        
        toast({
          title: "Logomarcas geradas com sucesso!",
          description: `${result.data.logos.length} logomarcas criadas em ${Math.round(result.data.processingTime / 1000)}s`,
        });
      } else {
        throw new Error('Resposta inválida do servidor');
      }
    } catch (error) {
      logger.error('❌ Logo generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      
      toast({
        title: "Erro na geração",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLogo = (logo: LogoResult, index: number) => {
    try {
      const link = document.createElement('a');
      link.href = logo.base64;
      link.download = `logo_${formData.brandName.replace(/[^a-zA-Z0-9]/g, '_')}_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Download iniciado",
        description: `Logo ${index + 1} baixado com sucesso`,
      });
    } catch (error) {
      logger.error('❌ Download error:', error);
      toast({
        title: "Erro no download",
        description: "Falha ao baixar a imagem",
        variant: "destructive"
      });
    }
  };

  const downloadAllLogos = () => {
    logos.forEach((logo, index) => {
      setTimeout(() => downloadLogo(logo, index), index * 500);
    });
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Gerador de Logomarcas PRO
          </CardTitle>
          <CardDescription>
            Crie logomarcas profissionais com inteligência artificial
          </CardDescription>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              <Sparkles className="w-3 h-3 mr-1" />
              {totalCost} créditos ({logoGenerationCostPerLogo} por logo × {formData.count})
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowHistoryModal(true)}
              className="flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Ver Histórico
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Brand Name */}
              <div className="space-y-2">
                <Label htmlFor="brandName">Nome da Marca *</Label>
                <Input
                  id="brandName"
                  placeholder="Digite o nome da sua marca"
                  value={formData.brandName}
                  onChange={(e) => setFormData(prev => ({ ...prev, brandName: e.target.value }))}
                  disabled={disabled || isGenerating}
                  required
                />
              </div>

              {/* Color Tone */}
              <div className="space-y-2">
                <Label htmlFor="colorTone">Tom de Cor</Label>
                <Select 
                  value={formData.colorTone} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, colorTone: value }))}
                  disabled={disabled || isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tom de cor" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorTones.map(tone => (
                      <SelectItem key={tone.value} value={tone.value}>
                        {tone.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Business Description */}
            <div className="space-y-2">
              <Label htmlFor="businessDescription">Descrição do Negócio *</Label>
              <Textarea
                id="businessDescription"
                placeholder="Descreva seu negócio, o que faz, seus produtos ou serviços..."
                value={formData.businessDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, businessDescription: e.target.value }))}
                disabled={disabled || isGenerating}
                rows={3}
                required
              />
            </div>

            {/* Logo Description */}
            <div className="space-y-2">
              <Label htmlFor="logoDescription">Descrição do Logo (Opcional)</Label>
              <Textarea
                id="logoDescription"
                placeholder="Descreva como você imagina o logo: elementos, estilo, símbolos..."
                value={formData.logoDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, logoDescription: e.target.value }))}
                disabled={disabled || isGenerating}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Reference Image */}
              <div className="space-y-2">
                <Label htmlFor="referenceImage">Imagem de Referência (Opcional)</Label>
                <Input
                  id="referenceImage"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={disabled || isGenerating}
                />
                {formData.referenceImage && (
                  <div className="mt-2">
                    <img 
                      src={formData.referenceImage} 
                      alt="Referência" 
                      className="w-20 h-20 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              {/* Count */}
              <div className="space-y-2">
                <Label htmlFor="count">Quantidade de Logos</Label>
                <Select 
                  value={formData.count.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, count: parseInt(value) }))}
                  disabled={disabled || isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a quantidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map(num => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} logo{num > 1 ? 's' : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full" 
              disabled={disabled || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando logomarcas...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Logomarcas
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Results */}
      {logos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Logomarcas Geradas
            </CardTitle>
            <CardDescription>
              {logos.length} logomarca{logos.length > 1 ? 's' : ''} gerada{logos.length > 1 ? 's' : ''} para {formData.brandName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Download All Button */}
              <div className="flex justify-end">
                <Button 
                  onClick={downloadAllLogos}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Baixar Todos
                </Button>
              </div>

              {/* Logo Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {logos.map((logo, index) => (
                  <div key={logo.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Logo {index + 1}</h4>
                      <Button
                        onClick={() => downloadLogo(logo, index)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Download className="w-3 h-3" />
                        Baixar
                      </Button>
                    </div>
                    <div className="flex justify-center">
                      <img 
                        src={logo.base64} 
                        alt={`Logo ${index + 1}`}
                        className="max-w-full max-h-48 object-contain rounded-lg"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Logo History Modal */}
      <LogoHistoryModal 
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
      />
    </div>
  );
};