
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

const initialTypes = [
  "Importador",
  "Distribuidor",
  "Fabricante",
  "Fabricante China",
  "Trading China",
  "Representante"
];

const SupplierTypesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [types, setTypes] = useState<string[]>(initialTypes);
  const [newType, setNewType] = useState("");

  const filtered = types.filter(t => t.toLowerCase().includes(searchTerm.toLowerCase()));

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (newType.trim() && !types.includes(newType.trim())) {
      setTypes([newType.trim(), ...types]);
    }
    setNewType("");
  }
  
  function handleDelete(type: string) {
    setTypes(types.filter(t => t !== type));
  }

  return (
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-foreground">Tipos de Fornecedor</CardTitle>
          <Button 
            onClick={() => document.getElementById('new-type-input')?.focus()} 
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Tipo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              id="new-type-input"
              placeholder="Novo tipo de fornecedor..."
              value={newType}
              onChange={e => setNewType(e.target.value)}
              className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
            />
            <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Adicionar
            </Button>
          </form>
          
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar tipos de fornecedor..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Nenhum tipo encontrado.
              </div>
            )}
            {filtered.map(type => (
              <div key={type} className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-foreground">{type}</span>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDelete(type)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupplierTypesManager;
