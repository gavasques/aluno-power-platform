import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Download, Eye, Trash2 } from "lucide-react";
import type { SupplierDocument } from '@/types/supplier';

interface DocumentsTabProps {
  documents: SupplierDocument[];
  supplierId: number;
  onUpdate: () => void;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  documents,
  supplierId,
  onUpdate
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'certificate': return 'bg-green-100 text-green-800 border-green-200';
      case 'license': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'contract': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'quality': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'certificate': return 'Certificado';
      case 'license': return 'Licença';
      case 'contract': return 'Contrato';
      case 'quality': return 'Qualidade';
      case 'other': return 'Outro';
      default: return category;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Documentos</h3>
          <p className="text-sm text-gray-500">
            Gerencie documentos relacionados ao fornecedor
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Upload Documento
        </Button>
      </div>

      {documents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento cadastrado
            </h4>
            <p className="text-gray-500 mb-4">
              Faça upload de documentos importantes deste fornecedor.
            </p>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Upload Primeiro Documento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((document) => (
            <Card key={document.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {document.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {document.originalName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(document.category)}>
                      {getCategoryText(document.category)}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>{document.type.toUpperCase()}</span>
                    <span>{formatFileSize(document.size)}</span>
                    <span>
                      Enviado em {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                {document.description && (
                  <p className="text-sm text-gray-600 mt-3 pt-3 border-t">
                    {document.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};