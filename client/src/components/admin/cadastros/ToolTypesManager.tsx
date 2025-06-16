
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search, Wrench } from "lucide-react";
import { useTools } from "@/contexts/ToolsContext";
import { useToast } from "@/hooks/use-toast";

const ToolTypesManager = () => {
  const { toolTypes, addToolType, updateToolType, deleteToolType, getToolsByType } = useTools();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Wrench",
  });

  const filteredTypes = toolTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingType) {
      updateToolType(editingType, formData);
      toast({
        title: "Sucesso",
        description: "Tipo de ferramenta atualizado com sucesso!",
      });
    } else {
      addToolType(formData);
      toast({
        title: "Sucesso",
        description: "Tipo de ferramenta criado com sucesso!",
      });
    }
    
    setFormData({ name: "", description: "", icon: "Wrench" });
    setEditingType(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (type: any) => {
    setFormData({
      name: type.name,
      description: type.description,
      icon: type.icon,
    });
    setEditingType(type.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    const toolsCount = getToolsByType(id).length;
    if (toolsCount > 0) {
      toast({
        title: "Erro",
        description: `Não é possível excluir. Existem ${toolsCount} ferramentas usando este tipo.`,
        variant: "destructive",
      });
      return;
    }
    
    deleteToolType(id);
    toast({
      title: "Sucesso",
      description: "Tipo de ferramenta excluído com sucesso!",
    });
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", icon: "Wrench" });
    setEditingType(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-border shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-primary" />
              <CardTitle className="text-foreground">Tipos de Ferramentas</CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90" 
                  onClick={resetForm}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Tipo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white border border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {editingType ? "Editar Tipo de Ferramenta" : "Novo Tipo de Ferramenta"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-foreground">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-foreground">Descrição</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon" className="text-foreground">Ícone (Lucide)</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
                      placeholder="ex: Search, BarChart, Bot"
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsDialogOpen(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {editingType ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tipos de ferramentas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-input text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          <div className="grid gap-4">
            {filteredTypes.map((type) => (
              <Card key={type.id} className="bg-gray-50 border border-border">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-foreground">{type.name}</h3>
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                          {getToolsByType(type.id).length} ferramentas
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">{type.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(type)}
                        className="text-foreground border-border hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(type.id)}
                        className="text-destructive border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTypes.length === 0 && (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum tipo de ferramenta encontrado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolTypesManager;
