
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, ArrowUpDown, FileText, Video, Youtube, FileSpreadsheet, Image, Globe, Code2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { MaterialType, InsertMaterialType } from "@shared/schema";

const MaterialTypesManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newMaterialType, setNewMaterialType] = useState({ 
    name: "", 
    description: "", 
    icon: "FileText",
    allowsUpload: true,
    allowsUrl: true,
    viewerType: "inline" 
  });
  const [sortBy, setSortBy] = useState<"name" | "created" | "alphabetical">("alphabetical");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: materialTypes = [], isLoading } = useQuery<MaterialType[]>({
    queryKey: ['/api/material-types'],
  });

  const createMutation = useMutation({
    mutationFn: (materialType: InsertMaterialType) => 
      apiRequest('/api/material-types', {
        method: 'POST',
        body: JSON.stringify(materialType),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-types'] });
      toast({
        title: "Sucesso",
        description: "Tipo de material criado com sucesso!",
      });
      setNewMaterialType({ 
        name: "", 
        description: "", 
        icon: "FileText",
        allowsUpload: true,
        allowsUrl: true,
        viewerType: "inline" 
      });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao criar tipo de material.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/material-types/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/material-types'] });
      toast({
        title: "Sucesso",
        description: "Tipo de material removido com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao remover tipo de material.",
        variant: "destructive",
      });
    },
  });

  const filteredAndSortedMaterialTypes = materialTypes
    .filter((materialType) => materialType.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
        case "alphabetical":
          return a.name.localeCompare(b.name, 'pt-BR');
        case "created":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return a.name.localeCompare(b.name, 'pt-BR');
      }
    });

  function handleAddMaterialType(e: React.FormEvent) {
    e.preventDefault();
    if (newMaterialType.name.trim()) {
      createMutation.mutate({
        name: newMaterialType.name.trim(),
        description: newMaterialType.description.trim() || null,
        icon: newMaterialType.icon,
        allowsUpload: newMaterialType.allowsUpload,
        allowsUrl: newMaterialType.allowsUrl,
        viewerType: newMaterialType.viewerType as "inline" | "download" | "external",
      });
    }
  }

  function handleDeleteMaterialType(materialType: MaterialType) {
    deleteMutation.mutate(materialType.id);
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "FileText": return <FileText className="h-4 w-4" />;
      case "Video": return <Video className="h-4 w-4" />;
      case "Youtube": return <Youtube className="h-4 w-4" />;
      case "FileSpreadsheet": return <FileSpreadsheet className="h-4 w-4" />;
      case "Image": return <Image className="h-4 w-4" />;
      case "Globe": return <Globe className="h-4 w-4" />;
      case "Code2": return <Code2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

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
