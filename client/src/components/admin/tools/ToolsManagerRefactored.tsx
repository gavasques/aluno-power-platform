import { useState } from 'react';
import { useTools } from '@/contexts/ToolsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ToolFilters } from './ToolFilters';
import { ToolList } from './ToolList';
import { ToolForm } from './ToolForm';
import type { ToolFormData } from './ToolFormTypes';
import type { Tool as DbTool, InsertTool } from '@shared/schema';

const ToolsManagerRefactored = () => {
  const { tools, toolTypes, addTool, updateTool, deleteTool } = useTools();
  const { toast } = useToast();
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<DbTool | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<ToolFormData>({
    name: "",
    description: "",
    typeId: "",
    logo: "",
    website: "",
    features: [],
    pros: [],
    cons: [],
    brazilSupport: "works",
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
      features: [],
      pros: [],
      cons: [],
      brazilSupport: "works",
      verified: false,
    });
    setEditingTool(null);
  };

  const handleSubmit = async (data: ToolFormData) => {
    if (!data.name || !data.typeId) {
      toast({
        title: "Erro",
        description: "Nome e tipo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    const toolData: InsertTool = {
      name: data.name,
      description: data.description,
      typeId: parseInt(data.typeId),
      logo: data.logo || null,
      website: data.website || null,
      features: data.features.length > 0 ? data.features : null,
      pros: data.pros.length > 0 ? data.pros : null,
      cons: data.cons.length > 0 ? data.cons : null,
      brazilSupport: data.brazilSupport,
      verified: data.verified,
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
      setIsDialogOpen(false);
      resetForm();
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
      name: tool.name || "",
      description: tool.description || "",
      typeId: tool.typeId.toString(),
      logo: tool.logo || "",
      website: tool.website || "",
      features: tool.features || [],
      pros: tool.pros || [],
      cons: tool.cons || [],
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

  const handleCreateNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                Gerenciar Ferramentas
              </CardTitle>
              <CardDescription>
                Gerencie as ferramentas disponíveis na plataforma
              </CardDescription>
            </div>
            <Button onClick={handleCreateNew}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Ferramenta
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ToolFilters
            searchTerm={searchTerm}
            selectedType={selectedType}
            toolTypes={toolTypes}
            onSearchChange={setSearchTerm}
            onTypeChange={setSelectedType}
          />
          
          <ToolList
            tools={filteredTools}
            toolTypes={toolTypes}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>

      <ToolForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
        editingTool={editingTool}
        toolTypes={toolTypes}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
      />
    </div>
  );
};

export default ToolsManagerRefactored;