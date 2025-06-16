
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Search, Eye, FileText, Video, Link, Lock, Globe, Filter, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMaterials } from "@/contexts/MaterialsContext";
import { useNavigate } from "react-router-dom";

const Materials = () => {
  const { getFilteredMaterials, materialTypes, filters, setFilters, incrementDownload } = useMaterials();
  const [searchTerm, setSearchTerm] = useState(filters.search || "");
  const [selectedCategory, setSelectedCategory] = useState(filters.typeId || "");
  const [accessFilter, setAccessFilter] = useState(filters.accessLevel || "all");
  const { toast } = useToast();
  const navigate = useNavigate();

  // Sincronizar filtros locais com o contexto
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setFilters({ search: value });
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    setFilters({ typeId: value });
  };

  const handleAccessChange = (value: string) => {
    setAccessFilter(value);
    setFilters({ accessLevel: value as any });
  };

  const filteredMaterials = getFilteredMaterials();
  const categories = ["Todos", ...materialTypes.map(type => type.name)];

  const getTypeIcon = (iconName: string) => {
    switch (iconName) {
      case "FileText": return <FileText className="h-5 w-5" />;
      case "Video": return <Video className="h-5 w-5" />;
      case "Youtube": return <Video className="h-5 w-5" />;
      case "FileSpreadsheet": return <FileText className="h-5 w-5" />;
      case "Code2": return <Globe className="h-5 w-5" />;
      case "Globe": return <Globe className="h-5 w-5" />;
      case "Image": return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const handleDownload = (material: any) => {
    if (!material.fileUrl && material.type.viewerType !== 'download') {
      toast({
        title: "Download não disponível",
        description: "Este material não está disponível para download.",
        variant: "destructive"
      });
      return;
    }

    incrementDownload(material.id);
    toast({
      title: "Download iniciado",
      description: `O download de "${material.title}" foi iniciado.`,
    });
  };

  const handleViewMaterial = (material: any) => {
    navigate(`/hub/materiais/${material.id}`);
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
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              
              <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  {materialTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={accessFilter} onValueChange={handleAccessChange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Acesso" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="public">Público</SelectItem>
                  <SelectItem value="restricted">Restrito</SelectItem>
                </SelectContent>
              </Select>

              {(searchTerm || selectedCategory || accessFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    handleSearchChange("");
                    handleCategoryChange("");
                    handleAccessChange("all");
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
                  {getTypeIcon(material.type.icon)}
                  <Badge variant="outline">{material.type.name}</Badge>
                </div>
                <div className="flex gap-1">
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
                <div className="flex flex-wrap gap-1">
                  {material.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {material.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{material.tags.length - 2}
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {material.fileSize && `${(material.fileSize / 1024 / 1024).toFixed(1)} MB`}
                  {material.technicalInfo?.duration && material.technicalInfo.duration}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => handleViewMaterial(material)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Visualizar
                </Button>
                {(material.fileUrl || material.type.viewerType === 'download') && (
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
    </div>
  );
};

export default Materials;
