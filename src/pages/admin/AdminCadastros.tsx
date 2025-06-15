
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Tag, Brain, FileText, Package, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminCadastrosProps {
  subsection?: string;
}

const AdminCadastros = ({ subsection = "categorias" }: AdminCadastrosProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState(subsection);

  // Estados para os diferentes cadastros
  const [categories, setCategories] = useState([
    { id: "1", name: "Eletrônicos", description: "Produtos eletrônicos e tecnologia", active: true },
    { id: "2", name: "Roupas e Acessórios", description: "Vestuário e acessórios", active: true },
    { id: "3", name: "Casa e Jardim", description: "Produtos para casa e jardim", active: true }
  ]);

  const [prompts, setPrompts] = useState([
    { id: "1", title: "Descrição de Produto", content: "Crie uma descrição atrativa para o produto: {produto}", category: "Marketing", active: true },
    { id: "2", title: "Análise de Concorrência", content: "Analise a concorrência para: {produto}", category: "Análise", active: true }
  ]);

  const [templates, setTemplates] = useState([
    { id: "1", name: "Template E-commerce", description: "Template para lojas virtuais", type: "Loja", active: true },
    { id: "2", name: "Template Blog", description: "Template para blogs", type: "Conteúdo", active: true }
  ]);

  const [materials, setMaterials] = useState([
    { id: "1", name: "Vídeo Aula", description: "Material em vídeo", active: true },
    { id: "2", name: "PDF", description: "Material em PDF", active: true },
    { id: "3", name: "Planilha", description: "Material em planilha", active: true }
  ]);

  const [supplierTypes, setSupplierTypes] = useState([
    { id: "1", name: "Fornecedor Nacional", description: "Fornecedores do Brasil", active: true },
    { id: "2", name: "Fornecedor Internacional", description: "Fornecedores do exterior", active: true },
    { id: "3", name: "Dropshipping", description: "Fornecedores dropshipping", active: true }
  ]);

  const handleSave = (type: string) => {
    toast({
      title: "Sucesso!",
      description: `${type} salvo com sucesso.`,
    });
  };

  const handleDelete = (type: string, id: string) => {
    toast({
      title: "Item removido",
      description: `${type} removido com sucesso.`,
    });
  };

  const renderCategoriesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Categorias de Produtos</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Categoria
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <Badge variant={category.active ? "default" : "secondary"}>
                      {category.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete("Categoria", category.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderPromptsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Prompts de IA</h3>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Prompt
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Conteúdo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prompts.map((prompt) => (
                <TableRow key={prompt.id}>
                  <TableCell className="font-medium">{prompt.title}</TableCell>
                  <TableCell>{prompt.category}</TableCell>
                  <TableCell className="max-w-xs truncate">{prompt.content}</TableCell>
                  <TableCell>
                    <Badge variant={prompt.active ? "default" : "secondary"}>
                      {prompt.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete("Prompt", prompt.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cadastros Administrativos</h1>
        <p className="text-muted-foreground">Gerencie todos os cadastros utilizados na plataforma</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="categorias" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Prompts IA
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="materiais" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Materiais
          </TabsTrigger>
          <TabsTrigger value="fornecedores" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Tipos Fornecedor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categorias" className="mt-6">
          {renderCategoriesTab()}
        </TabsContent>

        <TabsContent value="prompts" className="mt-6">
          {renderPromptsTab()}
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tipos de Templates</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.type}</TableCell>
                        <TableCell>{template.description}</TableCell>
                        <TableCell>
                          <Badge variant={template.active ? "default" : "secondary"}>
                            {template.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete("Template", template.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="materiais" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tipos de Materiais</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.name}</TableCell>
                        <TableCell>{material.description}</TableCell>
                        <TableCell>
                          <Badge variant={material.active ? "default" : "secondary"}>
                            {material.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete("Material", material.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fornecedores" className="mt-6">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Tipos de Fornecedores</h3>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo
              </Button>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">{type.name}</TableCell>
                        <TableCell>{type.description}</TableCell>
                        <TableCell>
                          <Badge variant={type.active ? "default" : "secondary"}>
                            {type.active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDelete("Tipo", type.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminCadastros;
