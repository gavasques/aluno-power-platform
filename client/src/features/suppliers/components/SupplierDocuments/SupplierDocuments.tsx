/**
 * Componente de apresentação para gerenciamento de documentos do fornecedor
 * Upload, visualização e download de documentos organizados por categoria
 */

import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  FileText, 
  Shield, 
  Award,
  FileCheck,
  File
} from "lucide-react";
import type { SupplierDocument } from '../../types/supplier.types';

interface SupplierDocumentsProps {
  documents: SupplierDocument[];
  onUpload: (file: File, category: SupplierDocument['category']) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const SupplierDocuments = ({ 
  documents, 
  onUpload, 
  onDelete, 
  isLoading = false 
}: SupplierDocumentsProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (category: SupplierDocument['category']) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        await onUpload(file, category);
      }
    };
    input.click();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Tem certeza que deseja remover o documento "${name}"?`)) {
      await onDelete(id);
    }
  };

  const getCategoryColor = (category: SupplierDocument['category']) => {
    switch (category) {
      case 'certificate': return 'bg-blue-100 text-blue-800';
      case 'license': return 'bg-green-100 text-green-800';
      case 'contract': return 'bg-purple-100 text-purple-800';
      case 'quality': return 'bg-yellow-100 text-yellow-800';
      case 'other': return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: SupplierDocument['category']) => {
    switch (category) {
      case 'certificate': return 'Certificado';
      case 'license': return 'Licença';
      case 'contract': return 'Contrato';
      case 'quality': return 'Qualidade';
      case 'other': return 'Outros';
    }
  };

  const getCategoryIcon = (category: SupplierDocument['category']) => {
    switch (category) {
      case 'certificate': return <Award className="w-4 h-4" />;
      case 'license': return <Shield className="w-4 h-4" />;
      case 'contract': return <FileText className="w-4 h-4" />;
      case 'quality': return <FileCheck className="w-4 h-4" />;
      case 'other': return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const documentsByCategory = documents.reduce((acc, doc) => {
    if (!acc[doc.category]) {
      acc[doc.category] = [];
    }
    acc[doc.category].push(doc);
    return acc;
  }, {} as Record<SupplierDocument['category'], SupplierDocument[]>);

  const categories: SupplierDocument['category'][] = ['certificate', 'license', 'contract', 'quality', 'other'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Documentos</h3>
          <p className="text-sm text-gray-600">
            {documents.length} documento{documents.length !== 1 ? 's' : ''} armazenado{documents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant="outline"
              size="sm"
              onClick={() => handleFileUpload(category)}
              disabled={isLoading}
            >
              <Upload className="w-4 h-4 mr-1" />
              {getCategoryText(category)}
            </Button>
          ))}
        </div>
      </div>

      {/* Documents by Category */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento carregado</h3>
            <p className="text-gray-600 mb-4">
              Faça upload de certificados, licenças, contratos e outros documentos importantes.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="outline"
                  onClick={() => handleFileUpload(category)}
                  disabled={isLoading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload {getCategoryText(category)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const categoryDocs = documentsByCategory[category] || [];
            if (categoryDocs.length === 0) return null;

            return (
              <Card key={category}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(category)}
                      <CardTitle className="text-lg">{getCategoryText(category)}</CardTitle>
                      <Badge variant="secondary">{categoryDocs.length}</Badge>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleFileUpload(category)}
                      disabled={isLoading}
                    >
                      <Upload className="w-4 h-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryDocs.map((doc) => (
                      <div
                        key={doc.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate" title={doc.originalName}>
                              {doc.originalName}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatFileSize(doc.size)} • {doc.type.toUpperCase()}
                            </p>
                          </div>
                          <Badge className={getCategoryColor(doc.category)} variant="secondary">
                            {getCategoryText(doc.category)}
                          </Badge>
                        </div>
                        
                        {doc.description && (
                          <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                            {doc.description}
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">
                            {new Date(doc.uploadedAt).toLocaleDateString('pt-BR')}
                          </span>
                          
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(doc.url, '_blank')}
                              title="Visualizar"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const a = document.createElement('a');
                                a.href = doc.url;
                                a.download = doc.originalName;
                                a.click();
                              }}
                              title="Download"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(doc.id, doc.originalName)}
                              className="text-red-600 hover:text-red-700"
                              title="Remover"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Upload Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Tipos de arquivo suportados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-sm mb-2">Documentos</h4>
              <p className="text-xs text-gray-600">PDF, DOC, DOCX, TXT</p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Imagens</h4>
              <p className="text-xs text-gray-600">JPG, JPEG, PNG</p>
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-500">
            Tamanho máximo por arquivo: 10MB
          </div>
        </CardContent>
      </Card>
    </div>
  );
};