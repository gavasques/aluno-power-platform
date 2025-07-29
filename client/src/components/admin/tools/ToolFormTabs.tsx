import { FC, Dispatch, SetStateAction } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { ToolVideoManager } from '@/components/videos/ToolVideoManager.tsx';
import { ToolDiscounts } from '@/components/discounts/ToolDiscounts';
import type { ToolFormData } from './ToolFormTypes';
import type { Tool as DbTool } from '@shared/schema';

interface ToolFormTabsProps {
  formData: ToolFormData;
  setFormData: Dispatch<SetStateAction<ToolFormData>>;
  editingTool: DbTool | null;
  toolTypes: Array<{ id: number; name: string }>;
  currentFeature: string;
  setCurrentFeature: (value: string) => void;
  currentPro: string;
  setCurrentPro: (value: string) => void;
  currentCon: string;
  setCurrentCon: (value: string) => void;
}

export const ToolFormTabs: FC<ToolFormTabsProps> = ({
  formData,
  setFormData,
  editingTool,
  toolTypes,
  currentFeature,
  setCurrentFeature,
  currentPro,
  setCurrentPro,
  currentCon,
  setCurrentCon,
}) => {
  const addFeature = () => {
    if (currentFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, currentFeature.trim()]
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addPro = () => {
    if (currentPro.trim()) {
      setFormData(prev => ({
        ...prev,
        pros: [...prev.pros, currentPro.trim()]
      }));
      setCurrentPro("");
    }
  };

  const removePro = (index: number) => {
    setFormData(prev => ({
      ...prev,
      pros: prev.pros.filter((_, i) => i !== index)
    }));
  };

  const addCon = () => {
    if (currentCon.trim()) {
      setFormData(prev => ({
        ...prev,
        cons: [...prev.cons, currentCon.trim()]
      }));
      setCurrentCon("");
    }
  };

  const removeCon = (index: number) => {
    setFormData(prev => ({
      ...prev,
      cons: prev.cons.filter((_, i) => i !== index)
    }));
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="basic">Básico</TabsTrigger>
        <TabsTrigger value="features">Funcionalidades</TabsTrigger>
        <TabsTrigger value="videos">Vídeos</TabsTrigger>
        <TabsTrigger value="discounts">Descontos</TabsTrigger>
        <TabsTrigger value="analysis">Análise</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Nome da ferramenta"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Tipo *</Label>
            <Select value={formData.typeId} onValueChange={(value) => setFormData(prev => ({ ...prev, typeId: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {toolTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Descrição da ferramenta"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="logo">URL do Logo</Label>
            <Input
              id="logo"
              value={formData.logo}
              onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
              placeholder="https://exemplo.com/logo.png"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://exemplo.com"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brazilSupport">Suporte ao Brasil</Label>
            <Select 
              value={formData.brazilSupport} 
              onValueChange={(value: "works" | "partial" | "no") => 
                setFormData(prev => ({ ...prev, brazilSupport: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="works">Funciona</SelectItem>
                <SelectItem value="partial">Parcial</SelectItem>
                <SelectItem value="no">Não funciona</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2 pt-6">
            <Switch
              id="verified"
              checked={formData.verified}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, verified: checked }))}
            />
            <Label htmlFor="verified">Ferramenta verificada</Label>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="features" className="space-y-4">
        <div className="space-y-4">
          <Label>Funcionalidades</Label>
          <div className="flex gap-2">
            <Input
              value={currentFeature}
              onChange={(e) => setCurrentFeature(e.target.value)}
              placeholder="Digite uma funcionalidade..."
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            />
            <Button type="button" onClick={addFeature}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-2">
            {formData.features.map((feature, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span>{feature}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFeature(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="videos" className="space-y-6">
        {editingTool && (
          <ToolVideoManager toolId={editingTool.id} />
        )}
        {!editingTool && (
          <div className="text-center text-gray-500 py-8">
            <p>Salve a ferramenta primeiro para gerenciar vídeos</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="discounts" className="space-y-6">
        {editingTool && (
          <ToolDiscounts toolId={editingTool.id} isAdmin={true} />
        )}
        {!editingTool && (
          <div className="text-center text-gray-500 py-8">
            <p>Salve a ferramenta primeiro para gerenciar descontos</p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="analysis" className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pontos Positivos</Label>
              <div className="flex gap-2">
                <Input
                  value={currentPro}
                  onChange={(e) => setCurrentPro(e.target.value)}
                  placeholder="Digite um ponto positivo..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                />
                <Button type="button" onClick={addPro}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.pros.map((pro, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                    <span>{pro}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removePro(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pontos Negativos</Label>
              <div className="flex gap-2">
                <Input
                  value={currentCon}
                  onChange={(e) => setCurrentCon(e.target.value)}
                  placeholder="Digite um ponto negativo..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                />
                <Button type="button" onClick={addCon}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.cons.map((con, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded">
                    <span>{con}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCon(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};