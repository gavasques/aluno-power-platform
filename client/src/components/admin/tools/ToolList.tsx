import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, Star, Wrench, Image as ImageIcon } from 'lucide-react';
import type { ToolListProps } from './ToolFormTypes';

export const ToolList: React.FC<ToolListProps> = ({
  tools,
  toolTypes,
  onEdit,
  onDelete,
}) => {
  const getTypeName = (typeId: number) => {
    const type = toolTypes.find(t => t.id === typeId);
    return type?.name || 'Tipo não encontrado';
  };

  const getSupportBadge = (support: string) => {
    const badges = {
      works: { text: 'Funciona', variant: 'default' as const },
      partial: { text: 'Parcial', variant: 'secondary' as const },
      no: { text: 'Não funciona', variant: 'destructive' as const },
    };
    return badges[support as keyof typeof badges] || badges.no;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Logo</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Suporte Brasil</TableHead>
          <TableHead>Verificado</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tools.map((tool) => {
          const supportBadge = getSupportBadge(tool.brazilSupport);
          
          return (
            <TableRow key={tool.id}>
              <TableCell>
                {tool.logo ? (
                  <img 
                    src={tool.logo} 
                    alt={tool.name} 
                    className="h-8 w-8 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.parentElement!.querySelector('.fallback-icon')!.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <ImageIcon className={`h-8 w-8 text-gray-400 ${tool.logo ? 'hidden' : ''} fallback-icon`} />
              </TableCell>
              <TableCell className="font-medium">{tool.name}</TableCell>
              <TableCell>{getTypeName(tool.typeId)}</TableCell>
              <TableCell>
                <Badge variant={supportBadge.variant}>
                  {supportBadge.text}
                </Badge>
              </TableCell>
              <TableCell>
                {tool.verified ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                ) : (
                  <Star className="h-4 w-4 text-gray-300" />
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(tool)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(tool.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};