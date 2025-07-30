import React, { memo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { FileText, Edit, Save, X, Star, Plus, Trash2 } from 'lucide-react';
import type { Supplier, SupplierInfoState, SupplierInfoActions } from '../types';

interface DescriptionSectionProps {
  supplier: Supplier;
  state: SupplierInfoState;
  actions: SupplierInfoActions;
}

export const DescriptionSection = memo<DescriptionSectionProps>(({
  supplier,
  state,
  actions
}) => {
  const isEditing = state.editingSection === 'description';
  const formData = state.formData;
  const [newTag, setNewTag] = useState('');

  const hasDescriptionInfo = supplier.description || supplier.rating || (supplier.tags && supplier.tags.length > 0);
  
  const currentRating = formData.rating ?? supplier.rating ?? 0;
  const currentTags = formData.tags ?? supplier.tags ?? [];

  const handleAddTag = () => {
    if (newTag.trim()) {
      actions.addTag(newTag.trim());
      setNewTag('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const renderStars = (rating: number, interactive = false) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'fill-yellow-400 text-yellow-400' 
            : 'text-gray-300'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => actions.updateRating(index + 1) : undefined}
      />
    ));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Descrição e Avaliação
          </CardTitle>
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={() => actions.startEditing('description')}>
              <Edit className="w-4 h-4 mr-2" />
              {hasDescriptionInfo ? 'Editar' : 'Adicionar'}
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={actions.cancelEditing}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                size="sm" 
                onClick={actions.saveChanges}
                disabled={state.isSubmitting || !state.hasChanges}
              >
                <Save className="w-4 h-4 mr-2" />
                {state.isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => actions.updateFormField('description', e.target.value)}
                placeholder="Descrição detalhada do fornecedor, produtos, serviços, etc."
                rows={4}
              />
            </div>

            {/* Rating */}
            <div className="space-y-2">
              <Label>Avaliação</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {renderStars(currentRating, true)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {currentRating} de 5 estrelas
                </span>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Adicionar tag"
                    className="flex-1"
                  />
                  <Button type="button" size="sm" onClick={handleAddTag}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {currentTags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {currentTags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                        <button
                          type="button"
                          onClick={() => actions.removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {hasDescriptionInfo ? (
              <>
                {/* Description */}
                {supplier.description && (
                  <div>
                    <h4 className="font-medium mb-2">Descrição</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {supplier.description}
                    </p>
                  </div>
                )}

                {/* Rating */}
                {supplier.rating && (
                  <div>
                    <h4 className="font-medium mb-2">Avaliação</h4>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(supplier.rating)}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {supplier.rating} de 5 estrelas
                      </span>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {supplier.tags && supplier.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-1">
                      {supplier.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhuma descrição ou avaliação cadastrada
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});