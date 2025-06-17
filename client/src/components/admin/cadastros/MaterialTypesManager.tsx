
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
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-foreground">Tipos de Materiais</CardTitle>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white max-w-md">
              <DialogHeader>
                <DialogTitle>Novo Tipo de Material</DialogTitle>
                <DialogDescription>Configure o novo tipo de material e suas funcionalidades.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddMaterialType} className="space-y-4">
                <Input
                  autoFocus
                  required
                  placeholder="Nome do Tipo"
                  value={newMaterialType.name}
                  onChange={(e) => setNewMaterialType(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                />
                <Textarea
                  placeholder="Descrição (opcional)"
                  value={newMaterialType.description}
                  onChange={(e) => setNewMaterialType(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                />
                <Select value={newMaterialType.icon} onValueChange={(value) => setNewMaterialType(prev => ({ ...prev, icon: value }))}>
                  <SelectTrigger className="bg-white border border-input">
                    <SelectValue placeholder="Selecionar ícone" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-input">
                    <SelectItem value="FileText">Documento</SelectItem>
                    <SelectItem value="Video">Vídeo</SelectItem>
                    <SelectItem value="Youtube">YouTube</SelectItem>
                    <SelectItem value="FileSpreadsheet">Planilha</SelectItem>
                    <SelectItem value="Image">Imagem</SelectItem>
                    <SelectItem value="Globe">Web/iFrame</SelectItem>
                    <SelectItem value="Code2">Código/Embed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newMaterialType.viewerType} onValueChange={(value) => setNewMaterialType(prev => ({ ...prev, viewerType: value }))}>
                  <SelectTrigger className="bg-white border border-input">
                    <SelectValue placeholder="Tipo de visualização" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-input">
                    <SelectItem value="inline">Visualização inline</SelectItem>
                    <SelectItem value="download">Download apenas</SelectItem>
                    <SelectItem value="external">Link externo</SelectItem>
                  </SelectContent>
                </Select>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="ghost" className="mr-2">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button 
                    type="submit" 
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    disabled={createMutation.isPending}
                  >
                    Adicionar
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Buscar tipos de materiais..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-input text-foreground placeholder:text-muted-foreground flex-1"
            />
            <Select value={sortBy} onValueChange={(value: "name" | "created" | "alphabetical") => setSortBy(value)}>
              <SelectTrigger className="w-48 bg-white border border-input">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-input">
                <SelectItem value="alphabetical">Ordem Alfabética</SelectItem>
                <SelectItem value="created">Mais Recentes</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!isLoading && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground">
                {filteredAndSortedMaterialTypes.length} tipo{filteredAndSortedMaterialTypes.length !== 1 ? 's' : ''} de material{filteredAndSortedMaterialTypes.length !== 1 ? 'is' : ''}
                {searchTerm && ` encontrado${filteredAndSortedMaterialTypes.length !== 1 ? 's' : ''} para "${searchTerm}"`}
              </span>
              <span className="text-xs text-muted-foreground">
                Ordenado por {sortBy === 'alphabetical' ? 'ordem alfabética' : 'mais recentes'}
              </span>
            </div>
          )}
          
          <div className="space-y-3">
            {isLoading && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Carregando tipos de materiais...
              </div>
            )}
            {!isLoading && filteredAndSortedMaterialTypes.length === 0 && (
              <div className="text-muted-foreground px-4 py-8 text-center">
                Nenhum tipo de material encontrado.
              </div>
            )}
            {!isLoading && filteredAndSortedMaterialTypes.map((materialType) => (
              <div
                key={materialType.id}
                className="flex items-center justify-between p-4 bg-gray-50 border border-border rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    {getIconComponent(materialType.icon)}
                    <div>
                      <div className="font-medium text-foreground">{materialType.name}</div>
                      {materialType.description && (
                        <div className="text-sm text-muted-foreground mt-1">{materialType.description}</div>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        {materialType.viewerType === 'inline' ? 'Visualização inline' : 
                         materialType.viewerType === 'download' ? 'Download apenas' : 'Link externo'} • 
                        Criado em {new Date(materialType.createdAt).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDeleteMaterialType(materialType)}
                  disabled={deleteMutation.isPending}
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
export default MaterialTypesManager;
