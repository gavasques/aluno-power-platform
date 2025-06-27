import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Copy, Edit3, Eye, Save, RotateCcw } from 'lucide-react';

interface DescriptionEditorProps {
  description: string;
  keywords: string[];
  onCopy: (description: string) => void;
  onSave?: (editedDescription: string) => void;
}

export const DescriptionEditor = ({ description, keywords, onCopy, onSave }: DescriptionEditorProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description);

  const handleSave = () => {
    if (onSave) {
      onSave(editedDescription);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedDescription(description);
    setIsEditing(false);
  };

  const highlightKeywords = (text: string) => {
    let highlightedText = text;
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, `<mark class="bg-yellow-200 text-yellow-800 px-1 rounded">${keyword}</mark>`);
    });
    return highlightedText;
  };

  const wordCount = editedDescription.trim().split(/\s+/).length;
  const charCount = editedDescription.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Descrição do Produto</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {wordCount} palavras · {charCount} caracteres
          </Badge>
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button variant="outline" size="sm" onClick={() => onCopy(description)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {isEditing ? <Edit3 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {isEditing ? 'Editando Descrição' : 'Descrição Gerada'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                rows={12}
                className="resize-none font-mono text-sm"
                placeholder="Edite a descrição do produto..."
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{wordCount} palavras</span>
                <span>{charCount} caracteres</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div 
                className="bg-gray-50 border rounded-lg p-4 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: highlightKeywords(description) }}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{description.trim().split(/\s+/).length} palavras</span>
                <span>{description.length} caracteres</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Keywords Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Palavras-chave Integradas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
              >
                {keyword}
              </Badge>
            ))}
          </div>
          {keywords.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhuma palavra-chave identificada na descrição.</p>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Eye className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-green-800 mb-1">Dicas para descrições Amazon:</h4>
            <div className="text-sm text-green-700 space-y-1">
              <p>• Use palavras-chave naturalmente no texto (destacadas em amarelo)</p>
              <p>• Mantenha entre 200-2000 palavras para melhor SEO</p>
              <p>• Inclua especificações técnicas e benefícios</p>
              <p>• Use formatação HTML simples (negrito, listas, quebras de linha)</p>
              <p>• Evite claims promocionais exagerados</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};