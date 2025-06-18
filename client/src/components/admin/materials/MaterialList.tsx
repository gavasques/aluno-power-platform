import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Eye, Download, FileText, Video, Code } from 'lucide-react';
import type { MaterialListProps } from './MaterialFormTypes';

export const MaterialList: React.FC<MaterialListProps> = ({
  materials,
  materialTypes,
  onEdit,
  onDelete,
  onView,
}) => {
  const getTypeName = (typeId: number) => {
    const type = materialTypes.find(t => t.id === typeId);
    return type?.name || 'Tipo não encontrado';
  };

  const getTypeIcon = (typeId: number) => {
    const type = materialTypes.find(t => t.id === typeId);
    const iconName = type?.icon || 'FileText';
    
    const icons = {
      FileText: FileText,
      Video: Video,
      Code: Code,
      Download: Download,
    };
    
    const IconComponent = icons[iconName as keyof typeof icons] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const getAccessBadge = (accessLevel: string) => {
    return accessLevel === 'public' 
      ? <Badge variant="default">Público</Badge>
      : <Badge variant="secondary">Restrito</Badge>;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return '-';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tipo</TableHead>
          <TableHead>Título</TableHead>
          <TableHead>Descrição</TableHead>
          <TableHead>Acesso</TableHead>
          <TableHead>Tamanho</TableHead>
          <TableHead>Downloads</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {materials.map((material) => (
          <TableRow key={material.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                {getTypeIcon(material.typeId)}
                <span className="text-sm">{getTypeName(material.typeId)}</span>
              </div>
            </TableCell>
            <TableCell className="font-medium">{material.title}</TableCell>
            <TableCell className="max-w-xs truncate">{material.description}</TableCell>
            <TableCell>{getAccessBadge(material.accessLevel)}</TableCell>
            <TableCell>{formatFileSize(material.fileSize)}</TableCell>
            <TableCell>{material.downloadCount}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(material)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(material)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(material.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};