import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, Eye, FileText, Video, Link, Lock, Globe, Filter, CheckCircle } from "lucide-react";
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
  verified: boolean;
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
    verified: true,
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
    verified: true,
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
    verified: false,
    embedCode: '<iframe src="https://calculator.example.com" width="100%" height="400"></iframe>',
    technicalInfo: {
      format: "Web App",
      language: "Português"
    }
  },
  {
    id: "4",
    title: "Templates de Email para Fornecedores",
    description: "Modelos prontos de emails para comunicação com fornecedores",
    type: "pdf",
    url: "/materials/email-templates.pdf",
    accessLevel: "public",
    fileSize: "1.2 MB",
    category: "Templates",
    downloadable: true,
    verified: true,
    technicalInfo: {
      format: "PDF",
      size: "1.2 MB",
      language: "Português"
    }
  },
  {
    id: "5",
    title: "Curso de Marketing Digital",
    description: "Vídeo aulas completas sobre marketing digital para e-commerce",
    type: "video",
    url: "https://www.youtube.com/embed/example2",
    accessLevel: "restricted",
    duration: "2:15:30",
    category: "Marketing",
    downloadable: false,
    verified: true,
    technicalInfo: {
      format: "MP4",
      resolution: "1080p",
      language: "Português"
    }
  },
  {
    id: "6",
    title: "Planilha de Controle de Estoque",
    description: "Planilha avançada para controle de estoque e produtos",
    type: "link",
    url: "https://sheets.google.com/example",
    accessLevel: "public",
    category: "Ferramentas",
    downloadable: true,
    verified: false,
    technicalInfo: {
      format: "Google Sheets",
      language: "Português"
    }
  }
];

const Materials = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [accessFilter, setAccessFilter] = useState("Todos");
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const { toast } = useToast();

  const categories = ["Todos", "Importação", "Fornecedores", "Ferramentas", "Marketing", "Templates"];

  const filteredMaterials = mockMaterials.filter(material => {
    const matchesSearch = material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         material.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "Todos" || material.category === selectedCategory;
    const matchesAccess = accessFilter === "Todos" || 
                         (accessFilter === "Público" && material.accessLevel === "public") ||
                         (accessFilter === "Restrito" && material.accessLevel === "restricted");
    return matchesSearch && matchesCategory && matchesAccess;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "pdf": return <FileText className="h-5 w-5" />;
      case "video": return <Video className="h-5 w-5" />;
      case "link": return <Link className="h-5 w-5" />;
      case "embed": return <Globe className="h-5 w-5" />;
      case "iframe": return <Globe className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
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

    toast({
      title: "Download iniciado",
      description: `O download de "${material.title}" foi iniciado.`,
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <h1 className="text-4xl font-bold">Materiais</h1>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verificados
          </Badge>
        </div>
        <p className="text-muted-foreground text-lg">
          Repositório de conteúdos com controle de acesso
        </p>
      </div>

      {/* Filtros em Uma Linha */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Barra de Busca */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Buscar materiais por título, descrição ou categoria..."
                className="pl-12 h-12 text-lg"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={accessFilter} onValueChange={setAccessFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Público">Público</SelectItem>
                  <SelectItem value="Restrito">Restrito</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || selectedCategory !== "Todos" || accessFilter !== "Todos") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("Todos");
                    setAccessFilter("Todos");
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de Materiais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map(material => (
          <Card key={material.id} className="hover:shadow-lg transition-shadow group">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  {getTypeIcon(material.type)}
                  <Badge variant="outline">{getTypeName(material.type)}</Badge>
                </div>
                <div className="flex gap-1">
                  {material.verified && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verificado
                    </Badge>
                  )}
                  {material.accessLevel === "restricted" ? (
                    <Lock className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Globe className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
              <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                {material.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {material.description}
              </p>
              
              <div className="flex justify-between items-center mb-4">
                <Badge variant="secondary" className="text-xs">
                  {material.category}
                </Badge>
                <div className="text-xs text-muted-foreground">
                  {material.fileSize && `${material.fileSize}`}
                  {material.duration && `${material.duration}`}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => setSelectedMaterial(material)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar
                </Button>
                {material.downloadable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(material)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <Card className="mt-8">
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Nenhum material encontrado</h3>
            <p className="text-muted-foreground">
              Tente ajustar os filtros ou termos de busca
            </p>
          </CardContent>
        </Card>
      )}

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
                    {selectedMaterial.verified && (
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verificado
                      </Badge>
                    )}
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
