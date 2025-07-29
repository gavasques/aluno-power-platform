/**
 * COMPONENTE: DocumentList - Lista de documentos reutilizável
 * Extraído de KnowledgeBaseManager.tsx para modularização
 */
import { FileText, Calendar, Tag, MoreVertical, Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DocumentListProps } from '../../types';

export const DocumentList = ({
  documents,
  isLoading,
  viewMode,
  selectedDoc,
  onDocumentSelect,
  onDocumentEdit,
  onDocumentDelete,
  onDocumentDuplicate,
  readOnly = false
}: DocumentListProps) => {
  
  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <Card
            key={doc.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedDoc?.id === doc.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => onDocumentSelect(doc)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-xs text-gray-500">
                    {doc.fileType?.toUpperCase() || 'DOC'}
                  </span>
                </div>
                
                {!readOnly && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => onDocumentEdit(doc)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDocumentDuplicate(doc.id)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDocumentDelete(doc.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                {doc.title}
              </h3>

              <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                {doc.summary || doc.content.substring(0, 120) + '...'}
              </p>

              <div className="flex flex-wrap gap-1 mb-3">
                {doc.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {doc.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{doc.tags.length - 3}
                  </Badge>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <span>{doc.uploadedBy}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card
          key={doc.id}
          className={`cursor-pointer transition-all hover:shadow-sm ${
            selectedDoc?.id === doc.id ? 'ring-2 ring-blue-500' : ''
          }`}
          onClick={() => onDocumentSelect(doc)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-5 w-5 text-blue-600 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {doc.summary || doc.content.substring(0, 80) + '...'}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {doc.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {doc.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{doc.tags.length - 2}
                    </Badge>
                  )}
                </div>

                <div className="text-xs text-gray-500 flex-shrink-0">
                  {new Date(doc.updatedAt).toLocaleDateString('pt-BR')}
                </div>
              </div>

              {!readOnly && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => onDocumentEdit(doc)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDocumentDuplicate(doc.id)}>
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDocumentDelete(doc.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};