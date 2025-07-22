
import React, { useState } from 'react';
import { useMaterials } from '@/contexts/MaterialsContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  FileText,
  Video,
  Youtube,
  FileSpreadsheet,
  Code2,
  Globe,
  Image,
  Lock,
  Unlock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Material } from '@/types/material';
// Removed unused import

const getIcon = (iconName: string) => {
  const icons: Record<string, React.ComponentType> = {
    FileText,
    Video,
    Youtube,
    FileSpreadsheet,
    Code2,
    Globe,
    Image
  };
  return icons[iconName] || FileText;
};

const MaterialCard = ({ material }: { material: Material }) => {
  const IconComponent = getIcon(material.type.icon);
  
  return (
    <Card className="bg-white border border-border shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <IconComponent className="h-5 w-5 text-primary" {...({} as any)} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground line-clamp-1">
                {material.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground">{material.type.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {material.accessLevel === 'restricted' ? (
              <Lock className="h-4 w-4 text-yellow-500" />
            ) : (
              <Unlock className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {material.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {material.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {material.tags.length > 3 && (
            <Badge variant="secondary" className="text-xs">
              +{material.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {material.viewCount}
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {material.downloadCount}
            </div>
          </div>
          <span>{new Date(material.uploadDate).toLocaleDateString('pt-BR')}</span>
        </div>

        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link to={`/minha-area/materiais/${material.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              Visualizar
            </Link>
          </Button>
          {material.type.viewerType === 'download' && (
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const MyMaterials = () => {
  const { getFilteredMaterials, materialTypes, filters, setFilters, loading } = useMaterials();
  const [showFilters, setShowFilters] = useState(false);
  
  const materials = getFilteredMaterials();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Carregando materiais...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Meus Materiais</h1>
          <p className="text-muted-foreground">Gerencie seus conteúdos e recursos</p>
        </div>
        <Button asChild>
          <Link to="/minha-area/materiais/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Material
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-white border border-border">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por título, descrição ou tags..."
                value={filters.search}
                onChange={(e) => setFilters({ search: e.target.value })}
                className="pl-10"
              />
            </div>
            <Select value={filters.typeId} onValueChange={(value) => setFilters({ typeId: value })}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Tipo de material" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {materialTypes.map(type => (
                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filters.accessLevel} onValueChange={(value: string) => setFilters({ accessLevel: value })}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Acesso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="public">Público</SelectItem>
                <SelectItem value="restricted">Restrito</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? 'bg-primary/10' : ''}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{materials.length}</div>
            <p className="text-muted-foreground text-sm">Total de Materiais</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {materials.filter(m => m.accessLevel === 'public').length}
            </div>
            <p className="text-muted-foreground text-sm">Públicos</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {materials.filter(m => m.accessLevel === 'restricted').length}
            </div>
            <p className="text-muted-foreground text-sm">Restritos</p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-border">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">
              {materials.reduce((acc, m) => acc + m.viewCount, 0)}
            </div>
            <p className="text-muted-foreground text-sm">Total de Visualizações</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Materiais */}
      {materials.length === 0 ? (
        <Card className="bg-white border border-border">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum material encontrado</p>
            <Button asChild className="mt-4">
              <Link to="/minha-area/materiais/novo">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeiro material
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map(material => (
            <MaterialCard key={material.id} material={material as any} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyMaterials;
