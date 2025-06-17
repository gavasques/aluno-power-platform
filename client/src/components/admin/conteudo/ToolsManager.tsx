import React, { useState } from 'react';
import { useTools } from '@/contexts/ToolsContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Star,
  Wrench,
  Image as ImageIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Tool as DbTool, InsertTool } from '@shared/schema';

const ToolsManager = () => {
  const { tools, toolTypes, addTool, updateTool, deleteTool } = useTools();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<DbTool | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    typeId: "",
    logo: "",
    website: "",
    brazilSupport: "works" as "works" | "partial" | "no",
    verified: false,
  });

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || tool.typeId === parseInt(selectedType);
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      typeId: "",
      logo: "",
      website: "",
      brazilSupport: "works",
      verified: false,
    });
    setEditingTool(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.typeId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const toolData: InsertTool = {
      name: formData.name,
      description: formData.description,
      typeId: parseInt(formData.typeId),
      logo: formData.logo,
      website: formData.website || null,
      brazilSupport: formData.brazilSupport,
      verified: formData.verified,
    };

    try {
      if (editingTool) {
        await updateTool(editingTool.id, toolData);
        toast({
          title: "Sucesso",
          description: "Ferramenta atualizada com sucesso!",
        });
      } else {
        await addTool(toolData);
        toast({
          title: "Sucesso",
          description: "Ferramenta criada com sucesso!",
        });
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar ferramenta.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (tool: DbTool) => {
    setFormData({
      name: tool.name,
      description: tool.description || "",
      typeId: tool.typeId.toString(),
      logo: tool.logo || "",
      website: tool.website || "",
      brazilSupport: tool.brazilSupport as "works" | "partial" | "no",
      verified: tool.verified || false,
    });
    setEditingTool(tool);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta ferramenta?')) {
      try {
        await deleteTool(id);
        toast({
          title: "Sucesso",
          description: "Ferramenta excluída com sucesso!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir ferramenta.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getBrazilSupportLabel = (support: string) => {
    switch (support) {
      case 'works': return 'Funciona no Brasil';
      case 'partial': return 'Funciona Parcialmente no Brasil';
      case 'no': return 'Não roda no Brasil';
      default: return 'Não informado';
    }
  };

  const getToolTypeName = (typeId: number) => {
    return toolTypes.find(type => type.id === typeId)?.name || 'Tipo não encontrado';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Wrench className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Gestão de Ferramentas</h1>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Ferramenta
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ferramentas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {toolTypes.map(type => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Logo</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Brasil</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma ferramenta encontrada
                      <div className="text-sm mt-1">
                        Tente ajustar os filtros ou adicione uma nova ferramenta
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredTools.map((tool) => (
                    <TableRow key={tool.id}>
                      <TableCell>
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                          {tool.logo ? (
                            <img 
                              src={tool.logo} 
                              alt={`${tool.name} logo`}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                img.style.display = 'none';
                                const parent = img.parentElement;
                                if (parent) {
                                  parent.innerHTML = '<div class="text-gray-400 flex items-center justify-center w-full h-full"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                                }
                              }}
                            />
                          ) : (
                            <ImageIcon className="w-4 h-4 text-gray-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{tool.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {tool.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getToolTypeName(tool.typeId)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={tool.brazilSupport === 'works' ? 'default' : 
                                   tool.brazilSupport === 'partial' ? 'secondary' : 'destructive'}
                        >
                          {getBrazilSupportLabel(tool.brazilSupport)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {tool.verified ? (
                          <Badge variant="default" className="bg-green-500">
                            Verificado
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(tool)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(tool.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTool ? "Editar Ferramenta" : "Nova Ferramenta"}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="typeId">Tipo *</Label>
                <Select 
                  value={formData.typeId} 
                  onValueChange={(value) => setFormData({ ...formData, typeId: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {toolTypes.map(type => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              <div className="flex gap-4 items-start">
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setFormData({ ...formData, logo: event.target?.result as string });
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Ou cole uma URL da imagem"
                    value={formData.logo}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                  />
                </div>
                {formData.logo && (
                  <div className="w-16 h-16 border border-gray-300 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    <img 
                      src={formData.logo} 
                      alt="Preview"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        const parent = img.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="text-gray-400 text-xs">Erro ao carregar</div>';
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://exemplo.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="verified"
                  checked={formData.verified}
                  onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                />
                <Label htmlFor="verified">Ferramenta Verificada</Label>
              </div>
              <div className="space-y-2">
                <Label>Funciona no Brasil</Label>
                <Select 
                  value={formData.brazilSupport} 
                  onValueChange={(value) => setFormData({ ...formData, brazilSupport: value as "works" | "partial" | "no" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="works">Funciona no Brasil</SelectItem>
                    <SelectItem value="partial">Funciona Parcialmente no Brasil</SelectItem>
                    <SelectItem value="no">Não roda no Brasil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingTool ? 'Atualizar' : 'Criar'} Ferramenta
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ToolsManager;