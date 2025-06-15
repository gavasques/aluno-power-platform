
import React, { useState } from 'react';
import { useMaterials } from '@/contexts/MaterialsContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  Eye,
  Download,
  Lock,
  Unlock,
  FileText,
  Video,
  Youtube,
  FileSpreadsheet,
  Code2,
  Globe,
  Image,
} from 'lucide-react';

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
  const IconComponent = icons[iconName] || FileText;
  return <IconComponent className="h-4 w-4" />;
};

const MaterialsManager = () => {
  const { materials, loading, deleteMaterial, getFilteredMaterials, setFilters, filters } = useMaterials();
  const [searchQuery, setSearchQuery] = useState('');

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este material?')) {
      deleteMaterial(id);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setFilters({ search: value });
  };

  const filteredMaterials = getFilteredMaterials();

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-2 text-muted-foreground">Carregando materiais...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Gerenciar Materiais</CardTitle>
              <CardDescription className="text-muted-foreground">
                Administre todos os materiais da plataforma
              </CardDescription>
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Novo Material
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar materiais..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-foreground">{materials.length}</div>
                  <p className="text-muted-foreground text-sm">Total de Materiais</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-green-600">
                    {materials.filter(m => m.accessLevel === 'public').length}
                  </div>
                  <p className="text-muted-foreground text-sm">Públicos</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {materials.filter(m => m.accessLevel === 'restricted').length}
                  </div>
                  <p className="text-muted-foreground text-sm">Restritos</p>
                </CardContent>
              </Card>
              <Card className="bg-white border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {materials.reduce((acc, m) => acc + m.viewCount, 0)}
                  </div>
                  <p className="text-muted-foreground text-sm">Total de Visualizações</p>
                </CardContent>
              </Card>
            </div>

            {/* Materials Table */}
            <div className="border border-border rounded-lg overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="border-border bg-muted/50">
                    <TableHead className="text-foreground font-medium">Material</TableHead>
                    <TableHead className="text-foreground font-medium">Tipo</TableHead>
                    <TableHead className="text-foreground font-medium">Acesso</TableHead>
                    <TableHead className="text-foreground font-medium">Visualizações</TableHead>
                    <TableHead className="text-foreground font-medium">Downloads</TableHead>
                    <TableHead className="text-foreground font-medium">Data</TableHead>
                    <TableHead className="text-foreground font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow key={material.id} className="border-border hover:bg-muted/50">
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-3">
                          {getIcon(material.type.icon)}
                          <div>
                            <div className="font-medium">{material.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">
                              {material.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <Badge variant="outline" className="border-border text-foreground">
                          {material.type.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {material.accessLevel === 'restricted' ? (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                            <Lock className="h-3 w-3 mr-1" />
                            Restrito
                          </Badge>
                        ) : (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <Unlock className="h-3 w-3 mr-1" />
                            Público
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {material.viewCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="flex items-center gap-1">
                          <Download className="h-4 w-4" />
                          {material.downloadCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {new Date(material.uploadDate).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-foreground hover:text-primary hover:bg-primary/10"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(material.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredMaterials.length === 0 && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Nenhum material encontrado.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaterialsManager;
