import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Save, X } from 'lucide-react';

interface EditableSectionProps {
  title: string;
  value: string;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (value: string) => void;
  placeholder?: string;
  isUpdating?: boolean;
}

export const EditableSection = memo<EditableSectionProps>(({
  title,
  value,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onChange,
  placeholder = "Digite aqui...",
  isUpdating = false
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">{title}</h3>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button size="sm" onClick={onSave} disabled={isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={4}
        />
      ) : (
        <div className="p-3 bg-gray-50 rounded-md min-h-[100px]">
          {value ? (
            <p className="text-sm text-gray-900 whitespace-pre-wrap">{value}</p>
          ) : (
            <p className="text-sm text-gray-500">Não informado</p>
          )}
        </div>
      )}
    </div>
  );
});