
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

const initialTypes = [
  "Comunicação com Fornecedor", "Email", "Negociar Chinês", "Desconto Fornecedor"
];

const TemplateTypesManager = () => {
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
    <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
      <CardHeader>
        <CardTitle className="text-slate-100">Tipos de Templates</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <Input
            placeholder="Novo tipo de template..."
            value={newType}
            onChange={e => setNewType(e.target.value)}
            className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
          />
          <Button type="submit" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
            <Plus className="h-4 w-4" />Adicionar
          </Button>
        </form>
        <div className="space-y-2">
          <Input
            placeholder="Buscar tipos de template..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
          />
          {filtered.length === 0 && <div className="text-slate-400 py-6 text-center">Nenhum tipo encontrado.</div>}
          {filtered.map(type => (
            <div key={type} className="flex items-center justify-between p-3 bg-slate-600/30 border border-red-500/20 rounded-lg">
              <span className="font-medium text-slate-100">{type}</span>
              <Button size="sm" variant="outline"
                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                onClick={() => handleDelete(type)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
export default TemplateTypesManager;
