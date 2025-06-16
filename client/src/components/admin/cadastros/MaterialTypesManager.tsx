
import { useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, FileText, Video, Youtube, FileSpreadsheet, Image, Globe, FileDown, Code2 } from "lucide-react";

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
  { name: "Documentos", icon: <FileText />, description: "Arquivos Word, PPT, etc" },
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
    <Card className="bg-white border border-border shadow-sm">
      <CardHeader>
        <CardTitle className="text-foreground">Tipos de Materiais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <Input
            placeholder="Novo tipo de material..."
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
          />
          <Input
            placeholder="Descrição (opcional)"
            value={newDesc}
            onChange={e => setNewDesc(e.target.value)}
            className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
          />
          <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" />Adicionar
          </Button>
        </form>
        <div className="space-y-2">
          <Input
            placeholder="Buscar tipos de material..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
          />
          {filtered.length === 0 && <div className="text-muted-foreground py-6 text-center">Nenhum tipo encontrado.</div>}
          {filtered.map(type => (
            <div key={type.name} className="flex items-center justify-between p-3 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex gap-3 items-center">
                {type.icon}
                <span className="font-medium text-foreground">{type.name}</span>
                <span className="text-xs text-muted-foreground">{type.description}</span>
              </div>
              <Button size="sm" variant="outline"
                className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
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
