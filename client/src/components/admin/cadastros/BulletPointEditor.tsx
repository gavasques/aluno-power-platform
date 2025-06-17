import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Plus } from 'lucide-react';

interface BulletPointEditorProps {
  label: string;
  placeholder: string;
  items: string[];
  onChange: (items: string[]) => void;
}

export const BulletPointEditor: React.FC<BulletPointEditorProps> = ({
  label,
  placeholder,
  items,
  onChange
}) => {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (newItem.trim() && !items.includes(newItem.trim())) {
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addItem();
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-white">{label}</Label>
      
      {/* List of current items */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between bg-slate-700 p-2 rounded-md"
            >
              <span className="text-white text-sm flex items-center">
                <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                {item}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new item */}
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="bg-slate-800 border-slate-600 text-white"
        />
        <Button
          type="button"
          onClick={addItem}
          variant="outline"
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};