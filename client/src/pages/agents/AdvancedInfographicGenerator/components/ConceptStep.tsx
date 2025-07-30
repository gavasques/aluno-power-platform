import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Palette, Plus, X, ArrowLeft, ArrowRight } from 'lucide-react';
import { INFOGRAPHIC_STYLES, COLOR_SCHEMES, LAYOUT_OPTIONS, type ConceptInfo } from '../types';

interface ConceptStepProps {
  conceptInfo: ConceptInfo;
  onUpdateField: (field: keyof ConceptInfo, value: any) => void;
  onPreviousStep: () => void;
  onGenerateInfographic: () => void;
}

export const ConceptStep = memo<ConceptStepProps>(({
  conceptInfo,
  onUpdateField,
  onPreviousStep,
  onGenerateInfographic
}) => {
  const [newElement, setNewElement] = React.useState('');

  const addElement = () => {
    if (newElement.trim() && !conceptInfo.elements.includes(newElement.trim())) {
      onUpdateField('elements', [...conceptInfo.elements, newElement.trim()]);
      setNewElement('');
    }
  };

  const removeElement = (elementToRemove: string) => {
    onUpdateField('elements', conceptInfo.elements.filter(element => element !== elementToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addElement();
    }
  };

  const isFormValid = () => {
    return conceptInfo.title && 
           conceptInfo.style && 
           conceptInfo.colorScheme && 
           conceptInfo.layout;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5" />
          Conceito Visual
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Infográfico *</Label>
            <Input
              id="title"
              value={conceptInfo.title}
              onChange={(e) => onUpdateField('title', e.target.value)}
              placeholder="Ex: Descubra o Futuro da Tecnologia"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="style">Estilo Visual *</Label>
            <Select value={conceptInfo.style} onValueChange={(value) => onUpdateField('style', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um estilo" />
              </SelectTrigger>
              <SelectContent>
                {INFOGRAPHIC_STYLES.map((style) => (
                  <SelectItem key={style} value={style}>
                    {style}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colorScheme">Esquema de Cores *</Label>
            <Select value={conceptInfo.colorScheme} onValueChange={(value) => onUpdateField('colorScheme', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione as cores" />
              </SelectTrigger>
              <SelectContent>
                {COLOR_SCHEMES.map((scheme) => (
                  <SelectItem key={scheme} value={scheme}>
                    {scheme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="layout">Layout *</Label>
            <Select value={conceptInfo.layout} onValueChange={(value) => onUpdateField('layout', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o layout" />
              </SelectTrigger>
              <SelectContent>
                {LAYOUT_OPTIONS.map((layout) => (
                  <SelectItem key={layout} value={layout}>
                    {layout}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descrição do Conceito</Label>
          <Textarea
            id="description"
            value={conceptInfo.description}
            onChange={(e) => onUpdateField('description', e.target.value)}
            placeholder="Descreva a ideia visual, tom, mensagem principal..."
            rows={4}
          />
        </div>

        {/* Visual Elements */}
        <div className="space-y-2">
          <Label htmlFor="elements">Elementos Visuais Desejados</Label>
          <div className="flex gap-2">
            <Input
              id="elements"
              value={newElement}
              onChange={(e) => setNewElement(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: Ícones, gráficos, imagens..."
              className="flex-1"
            />
            <Button type="button" onClick={addElement} size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {conceptInfo.elements.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {conceptInfo.elements.map((element, index) => (
                <Badge key={index} variant="outline" className="flex items-center gap-1">
                  {element}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => removeElement(element)}
                  />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPreviousStep}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          
          <Button onClick={onGenerateInfographic} disabled={!isFormValid()}>
            Gerar Infográfico
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});