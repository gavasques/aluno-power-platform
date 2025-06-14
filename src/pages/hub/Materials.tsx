
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Search, Eye, FileText, Video, Link, Lock, Globe } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Material {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "link" | "embed" | "iframe";
  url: string;
  accessLevel: "public" | "restricted";
  fileSize?: string;
  duration?: string;
  category: string;
  downloadable: boolean;
  embedCode?: string;
  technicalInfo: {
    format?: string;
    size?: string;
    resolution?: string;
    language?: string;
  };
}

const mockMaterials: Material[] = [
  {
    id: "1",
    title: "Guia Completo de Importação para E-commerce",
    description: "Manual detalhado sobre todos os processos de importação para vendedores online",
    type: "pdf",
    url: "/materials/guia-importacao.pdf",
    accessLevel: "public",
    fileSize: "2.5 MB",
    category: "Importação",
    downloadable: true,
    technicalInfo: {
      format: "PDF",
      size: "2.5 MB",
      language: "Português"
    }
  },
  {
    id: "2",
    title: "Como Negociar com Fornecedores Chineses",
    description: "Vídeo tutorial com dicas práticas para negociação efetiva",
    type: "video",
    url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    accessLevel: "restricted",
    duration: "15:30",
    category: "Fornecedores",
    downloadable: false,
    technicalInfo: {
      format: "MP4",
      resolution: "1080p",
      language: "Português"
    }
  },
  {
    id: "3",
    title: "Calculadora de Impostos de Importação",
    description: "Ferramenta online para calcular impostos de importação",
    type: "embed",
    url: "https://calculator.example.com",
    accessLevel: "public",
    category: "Ferramentas",
    downloadable: false,
    embedCode: '<iframe src="https://calculator.example.com" width="100%" height="400"></iframe>',
    technicalInfo: {
      format: "Web App",
      language: "Português"
    }
  }
];

const Materials = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const { toast } = useToast();

  const categories = ["Todos", "Importação", "Fornecedores", "Ferramentas", "Marketing"];

  const filteredMaterials = mockMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || material.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="h-4 w-4" />;
      case "video": return <Video className="h-4 w-4" />;
      case "link": return <Link className="h-4 w-4" />;
      case "embed": return <Globe className="h-4 w-4" />;
      case "iframe": return <Globe className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case "pdf": return "PDF";
      case "video": return "Vídeo";
      case "link": return "Link";
      case "embed": return "Embed";
      case "iframe": return "IFrame";
      default: return "Arquivo";
    }
  };

  const handleDownload = (material: Material) => {
    if (!material.downloadable) {
      toast({
        title: "Download não disponível",
        description: "Este material não está disponível para download.",
        variant: "destructive"
      });
      return;
    }

    // Simular download
    toast({
      title: "Download iniciado",
      description: `O download de "${material.title}" foi iniciado.`,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Materiais</h1>
        <p className="text-muted-foreground">
          Repositório de conteúdos com controle de acesso
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de Filtros */}
        <div className="lg:w-1/4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar materiais..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <div className="space-y-2">
                  {categories.map(category => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Materiais */}
        <div className="lg:w-3/4">
          <div className="grid gap-4">
            {filteredMaterials.map(material => (
              <Card key={material.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeIcon(material.type)}
                        <CardTitle className="text-xl">{material.title}</CardTitle>
                        {material.accessLevel === "restricted" && (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex gap-2 mb-2">
                        <Badge variant="secondary">{material.category}</Badge>
                        <Badge variant="outline">{getTypeName(material.type)}</Badge>
                        <Badge variant={material.accessLevel === "public" ? "default" : "destructive"}>
                          {material.accessLevel === "public" ? "Público" : "Restrito"}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground">{material.description}</p>
                      {(material.fileSize || material.duration) && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {material.fileSize && `Tamanho: ${material.fileSize}`}
                          {material.duration && `Duração: ${material.duration}`}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMaterial(material)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      {material.downloadable && (
                        <Button
                          size="sm"
                          onClick={() => handleDownload(material)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedMaterial.title}</h2>
                  <div className="flex gap-2">
                    <Badge variant="secondary">{selectedMaterial.category}</Badge>
                    <Badge variant="outline">{getTypeName(selectedMaterial.type)}</Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedMaterial(null)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <Tabs defaultValue="preview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preview">Visualizar</TabsTrigger>
                  <TabsTrigger value="description">Descrição</TabsTrigger>
                  <TabsTrigger value="technical">Informações Técnicas</TabsTrigger>
                </TabsList>

                <TabsContent value="preview" className="mt-6">
                  <Card>
                    <CardContent className="p-6">
                      {selectedMaterial.type === "video" && (
                        <div className="aspect-video">
                          <iframe
                            src={selectedMaterial.url}
                            className="w-full h-full rounded-lg"
                            allowFullScreen
                          />
                        </div>
                      )}
                      {selectedMaterial.type === "pdf" && (
                        <div className="text-center py-8">
                          <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-lg font-medium mb-2">Visualização do PDF</p>
                          <p className="text-muted-foreground mb-4">
                            O arquivo PDF será exibido aqui em produção
                          </p>
                          <Button onClick={() => handleDownload(selectedMaterial)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download PDF
                          </Button>
                        </div>
                      )}
                      {(selectedMaterial.type === "embed" || selectedMaterial.type === "iframe") && (
                        <div className="min-h-96">
                          <iframe
                            src={selectedMaterial.url}
                            className="w-full h-96 rounded-lg border"
                          />
                        </div>
                      )}
                      {selectedMaterial.type === "link" && (
                        <div className="text-center py-8">
                          <Link className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-lg font-medium mb-2">Link Externo</p>
                          <Button asChild>
                            <a href={selectedMaterial.url} target="_blank" rel="noopener noreferrer">
                              Abrir Link
                            </a>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="description" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Descrição</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{selectedMaterial.description}</p>
                      {selectedMaterial.downloadable && (
                        <div className="mt-4">
                          <Button onClick={() => handleDownload(selectedMaterial)}>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="technical" className="mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Informações Técnicas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedMaterial.technicalInfo.format && (
                          <div>
                            <label className="text-sm font-medium">Formato</label>
                            <p className="text-muted-foreground">{selectedMaterial.technicalInfo.format}</p>
                          </div>
                        )}
                        {selectedMaterial.technicalInfo.size && (
                          <div>
                            <label className="text-sm font-medium">Tamanho</label>
                            <p className="text-muted-foreground">{selectedMaterial.technicalInfo.size}</p>
                          </div>
                        )}
                        {selectedMaterial.technicalInfo.resolution && (
                          <div>
                            <label className="text-sm font-medium">Resolução</label>
                            <p className="text-muted-foreground">{selectedMaterial.technicalInfo.resolution}</p>
                          </div>
                        )}
                        {selectedMaterial.technicalInfo.language && (
                          <div>
                            <label className="text-sm font-medium">Idioma</label>
                            <p className="text-muted-foreground">{selectedMaterial.technicalInfo.language}</p>
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium">Nível de Acesso</label>
                          <p className="text-muted-foreground">
                            {selectedMaterial.accessLevel === "public" ? "Público" : "Restrito"}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Download</label>
                          <p className="text-muted-foreground">
                            {selectedMaterial.downloadable ? "Disponível" : "Não disponível"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Materials;
