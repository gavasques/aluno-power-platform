
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, FileText, Video, Youtube, FileSpreadsheet, Image, Globe, FileDown, Code2, FileWord2 } from "lucide-react";

type MaterialType = {
  name: string;
  icon: React.ReactNode;
  description?: string;
};

const defaultTypes: MaterialType[] = [
  { name: "PDF", icon: <FileText />, description: "Visualizar PDF e download" },
  { name: "Vídeo Youtube", icon: <Youtube />, description: "Vídeo do Youtube embutido" },
  { name: "Vídeo Panda", icon: <Video />, description: "Vídeo hospedado no Panda" },
  { name: "Vídeos", icon: <Video />, description: "Upload/download vídeos próprios" },
  { name: "Planilhas", icon: <FileSpreadsheet />, description: "Planilhas para download" },
  { name: "Embed", icon: <Code2 />, description: "Código embed na tela" },
  { name: "iframe", icon: <Globe />, description: "Exibir código iFrame tela" },
  { name: "Documentos", icon: <FileWord2 />, description: "Arquivos Word, PPT, etc" },
  { name: "Imagens", icon: <Image />, description: "Exibir e baixar imagens" },
];

const MaterialTypesManager = () => {
  const [types, setTypes] = useState<MaterialType[]>(defaultTypes);
  const [searchTerm, setSearchTerm] = useState("");
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const filtered = types.filter(t =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (newName.trim() && !types.some(t => t.name === newName.trim())) {
      setTypes([{ name: newName.trim(), icon: <FileText />, description: newDesc }, ...types]);
    }
    setNewName("");
    setNewDesc("");
  }
  function handleDelete(name: string) {
    setTypes(types.filter(t => t.name !== name));
  }

  return (
    <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
      <CardHeader>
        <CardTitle className="text-slate-100">Tipos de Materiais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <Input
            placeholder="Novo tipo de material..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
          />
          <Input
            placeholder="Descrição (opcional)"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
          />
          <Button type="submit" className="bg-red-500/20 text-red-400 hover:bg-red-500/30" variant="outline">
            <Plus className="h-4 w-4" />Adicionar
          </Button>
        </form>
        <div className="space-y-2">
          <Input
            placeholder="Buscar tipos de material..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
          />
          {filtered.length === 0 && <div className="text-slate-400 py-6 text-center">Nenhum tipo encontrado.</div>}
          {filtered.map(type => (
            <div key={type.name} className="flex items-center justify-between p-3 bg-slate-600/30 border border-red-500/20 rounded-lg">
              <div className="flex gap-3 items-center">
                {type.icon}
                <span className="font-medium text-slate-100">{type.name}</span>
                <span className="text-xs text-slate-400">{type.description}</span>
              </div>
              <Button size="sm" variant="outline"
                className="bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30"
                onClick={() => handleDelete(type.name)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
export default MaterialTypesManager;
