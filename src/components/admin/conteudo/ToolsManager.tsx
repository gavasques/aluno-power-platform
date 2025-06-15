
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Search, Wrench, Star, CheckCircle, ExternalLink } from "lucide-react";
import { useTools } from "@/contexts/ToolsContext";
import { useToast } from "@/hooks/use-toast";
import { Tool } from "@/types/tool";

const ToolsManager = () => {
  const { tools, toolTypes, addTool, updateTool, deleteTool } = useTools();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Tool>>({
    name: "",
    category: "",
    typeId: "",
    description: "",
    logo: "",
    verified: false,
    officialRating: 0,
    overview: "",
    features: [],
    pricing: { plans: [] },
    availabilityBrazil: "",
    lvReview: { rating: 0, review: "" },
    prosAndCons: { pros: [], cons: [] },
    discounts: []
  });
  const [currentFeature, setCurrentFeature] = useState("");
  const [currentPro, setCurrentPro] = useState("");
  const [currentCon, setCurrentCon] = useState("");

  const filteredTools = tools.filter(tool => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || tool.typeId === selectedType;
    return matchesSearch && matchesType;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      typeId: "",
      description: "",
      logo: "",
      verified: false,
      officialRating: 0,
      overview: "",
      features: [],
      pricing: { plans: [] },
      availabilityBrazil: "",
      lvReview: { rating: 0, review: "" },
      prosAndCons: { pros: [], cons: [] },
      discounts: []
    });
    setEditingTool(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingTool) {
      updateTool(editingTool, formData);
      toast({
        title: "Sucesso",
        description: "Ferramenta atualizada com sucesso!",
      });
    } else {
      addTool(formData as Omit<Tool, 'id' | 'createdAt' | 'updatedAt'>);
      toast({
        title: "Sucesso",
        description: "Ferramenta criada com sucesso!",
      });
    }
    
    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (tool: Tool) => {
    setFormData(tool);
    setEditingTool(tool.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteTool(id);
    toast({
      title: "Sucesso",
      description: "Ferramenta excluída com sucesso!",
    });
  };

  const addFeature = () => {
    if (currentFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...(prev.features || []), currentFeature.trim()]
      }));
      setCurrentFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || []
    }));
  };

  const addPro = () => {
    if (currentPro.trim()) {
      setFormData(prev => ({
        ...prev,
        prosAndCons: {
          ...prev.prosAndCons,
          pros: [...(prev.prosAndCons?.pros || []), currentPro.trim()]
        }
      }));
      setCurrentPro("");
    }
  };

  const addCon = () => {
    if (currentCon.trim()) {
      setFormData(prev => ({
        ...prev,
        prosAndCons: {
          ...prev.prosAndCons,
          cons: [...(prev.prosAndCons?.cons || []), currentCon.trim()]
        }
      }));
      setCurrentCon("");
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-700/50 border-red-500/20 shadow-lg shadow-red-500/10">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-red-400" />
              <CardTitle className="text-slate-100">Gestão de Ferramentas</CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30" 
                  variant="outline"
                  onClick={resetForm}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Ferramenta
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-red-500/20 max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-slate-100">
                    {editingTool ? "Editar Ferramenta" : "Nova Ferramenta"}
                  </DialogTitle>
                </DialogHeader>
                
                <form onSubmit={handleSubmit}>
                  <Tabs defaultValue="basic" className="w-full">
                    <TabsList className="bg-slate-700/50 border-red-500/20">
                      <TabsTrigger value="basic" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                        Básico
                      </TabsTrigger>
                      <TabsTrigger value="details" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                        Detalhes
                      </TabsTrigger>
                      <TabsTrigger value="review" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                        Avaliação
                      </TabsTrigger>
                      <TabsTrigger value="pros-cons" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400">
                        Prós/Contras
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="basic" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-slate-300">Nome</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-slate-600/50 border-red-500/20 text-slate-100"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="typeId" className="text-slate-300">Tipo</Label>
                          <Select 
                            value={formData.typeId} 
                            onValueChange={(value) => setFormData({ ...formData, typeId: value })}
                          >
                            <SelectTrigger className="bg-slate-600/50 border-red-500/20 text-slate-100">
                              <SelectValue placeholder="Selecione um tipo" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-700 border-red-500/20">
                              {toolTypes.map(type => (
                                <SelectItem key={type.id} value={type.id} className="text-slate-100">
                                  {type.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-slate-300">Descrição</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="bg-slate-600/50 border-red-500/20 text-slate-100"
                          rows={3}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="logo" className="text-slate-300">Logo URL</Label>
                        <Input
                          id="logo"
                          value={formData.logo}
                          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                          className="bg-slate-600/50 border-red-500/20 text-slate-100"
                          placeholder="https://exemplo.com/logo.png"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="verified"
                          checked={formData.verified}
                          onCheckedChange={(checked) => setFormData({ ...formData, verified: checked })}
                        />
                        <Label htmlFor="verified" className="text-slate-300">LV Verificado</Label>
                      </div>
                    </TabsContent>

                    <TabsContent value="details" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="overview" className="text-slate-300">Visão Geral</Label>
                        <Textarea
                          id="overview"
                          value={formData.overview}
                          onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                          className="bg-slate-600/50 border-red-500/20 text-slate-100"
                          rows={4}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-slate-300">Funcionalidades</Label>
                        <div className="flex space-x-2">
                          <Input
                            value={currentFeature}
                            onChange={(e) => setCurrentFeature(e.target.value)}
                            className="bg-slate-600/50 border-red-500/20 text-slate-100"
                            placeholder="Digite uma funcionalidade"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                          />
                          <Button type="button" onClick={addFeature} size="sm">
                            Adicionar
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {formData.features?.map((feature, index) => (
                            <Badge 
                              key={index} 
                              className="bg-blue-500/20 text-blue-400 cursor-pointer"
                              onClick={() => removeFeature(index)}
                            >
                              {feature} ×
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="availabilityBrazil" className="text-slate-300">Disponibilidade no Brasil</Label>
                        <Textarea
                          id="availabilityBrazil"
                          value={formData.availabilityBrazil}
                          onChange={(e) => setFormData({ ...formData, availabilityBrazil: e.target.value })}
                          className="bg-slate-600/50 border-red-500/20 text-slate-100"
                          rows={3}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="review" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="officialRating" className="text-slate-300">Avaliação Oficial (0-5)</Label>
                        <Input
                          id="officialRating"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={formData.officialRating}
                          onChange={(e) => setFormData({ ...formData, officialRating: parseFloat(e.target.value) || 0 })}
                          className="bg-slate-600/50 border-red-500/20 text-slate-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lvRating" className="text-slate-300">Avaliação LV (0-5)</Label>
                        <Input
                          id="lvRating"
                          type="number"
                          min="0"
                          max="5"
                          step="0.1"
                          value={formData.lvReview?.rating}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            lvReview: { 
                              ...formData.lvReview, 
                              rating: parseFloat(e.target.value) || 0 
                            }
                          })}
                          className="bg-slate-600/50 border-red-500/20 text-slate-100"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="lvReviewText" className="text-slate-300">Review LV</Label>
                        <Textarea
                          id="lvReviewText"
                          value={formData.lvReview?.review}
                          onChange={(e) => setFormData({ 
                            ...formData, 
                            lvReview: { 
                              ...formData.lvReview, 
                              review: e.target.value 
                            }
                          })}
                          className="bg-slate-600/50 border-red-500/20 text-slate-100"
                          rows={4}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="pros-cons" className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-slate-300">Prós</Label>
                          <div className="flex space-x-2">
                            <Input
                              value={currentPro}
                              onChange={(e) => setCurrentPro(e.target.value)}
                              className="bg-slate-600/50 border-red-500/20 text-slate-100"
                              placeholder="Digite um pró"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
                            />
                            <Button type="button" onClick={addPro} size="sm">
                              +
                            </Button>
                          </div>
                          <div className="space-y-1">
                            {formData.prosAndCons?.pros?.map((pro, index) => (
                              <div key={index} className="flex items-center justify-between bg-green-500/10 p-2 rounded">
                                <span className="text-slate-300 text-sm">{pro}</span>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    prosAndCons: {
                                      ...prev.prosAndCons,
                                      pros: prev.prosAndCons?.pros?.filter((_, i) => i !== index) || []
                                    }
                                  }))}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-300">Contras</Label>
                          <div className="flex space-x-2">
                            <Input
                              value={currentCon}
                              onChange={(e) => setCurrentCon(e.target.value)}
                              className="bg-slate-600/50 border-red-500/20 text-slate-100"
                              placeholder="Digite um contra"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
                            />
                            <Button type="button" onClick={addCon} size="sm">
                              +
                            </Button>
                          </div>
                          <div className="space-y-1">
                            {formData.prosAndCons?.cons?.map((con, index) => (
                              <div key={index} className="flex items-center justify-between bg-red-500/10 p-2 rounded">
                                <span className="text-slate-300 text-sm">{con}</span>
                                <Button 
                                  type="button" 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => setFormData(prev => ({
                                    ...prev,
                                    prosAndCons: {
                                      ...prev.prosAndCons,
                                      cons: prev.prosAndCons?.cons?.filter((_, i) => i !== index) || []
                                    }
                                  }))}
                                >
                                  ×
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex justify-end space-x-2 mt-6">
                    <Button 
                      type="button" 
                      variant="ghost" 
                      onClick={() => setIsDialogOpen(false)}
                      className="text-slate-400 hover:text-slate-300"
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/30"
                      variant="outline"
                    >
                      {editingTool ? "Atualizar" : "Criar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex space-x-4">
            <div className="flex-1 flex items-center space-x-2">
              <Search className="h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar ferramentas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-600/50 border-red-500/20 text-slate-100 placeholder-slate-400"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-48 bg-slate-600/50 border-red-500/20 text-slate-100">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 border-red-500/20">
                <SelectItem value="all" className="text-slate-100">Todos os tipos</SelectItem>
                {toolTypes.map(type => (
                  <SelectItem key={type.id} value={type.id} className="text-slate-100">
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-4">
            {filteredTools.map((tool) => (
              <Card key={tool.id} className="bg-slate-600/30 border-red-500/10">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={tool.logo}
                      alt={tool.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-100">{tool.name}</h3>
                        {tool.verified && (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            LV Verificado
                          </Badge>
                        )}
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                          {toolTypes.find(t => t.id === tool.typeId)?.name}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-sm mb-2">{tool.description}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-slate-300">LV:</span>
                          <div className="flex">{renderStars(tool.officialRating)}</div>
                          <span className="text-sm text-slate-400">{tool.officialRating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm text-slate-300">Usuários:</span>
                          <div className="flex">{renderStars(tool.userRating)}</div>
                          <span className="text-sm text-slate-400">
                            {tool.userRating} ({tool.reviewCount})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(tool)}
                        className="text-slate-400 hover:text-blue-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(tool.id)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredTools.length === 0 && (
              <div className="text-center py-8">
                <Wrench className="h-12 w-12 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-400">Nenhuma ferramenta encontrada</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolsManager;
