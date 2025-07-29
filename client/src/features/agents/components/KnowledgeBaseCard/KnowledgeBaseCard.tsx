/**
 * Componente de apresentação para base de conhecimento
 * Interface para gerenciar documentos e coleções
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Upload, Trash2, FileText, AlertCircle } from "lucide-react";
import type { KnowledgeBaseProps } from '../../types/agent.types';

export const KnowledgeBaseCard = ({
  collections,
  onUpload,
  onDelete,
  onCreateCollection,
  isLoading = false
}: KnowledgeBaseProps) => {
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  const totalDocuments = collections.reduce((sum, collection) => sum + collection.documents.length, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Base de Conhecimento
          <Badge variant="secondary">{totalDocuments} documentos</Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Info sobre retrieval */}
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-800 mb-2">
            📚 Sistema de Recuperação OpenAI (Retrieval)
          </h3>
          <p className="text-blue-700 text-sm mb-3">
            Faça upload de documentos para que os agentes OpenAI possam usar informações específicas 
            da sua empresa em suas respostas. Ideal para manuais, políticas, catálogos de produtos e conhecimento especializado.
          </p>
          <div className="text-xs text-blue-600 space-y-1">
            <div><strong>Tipos suportados:</strong> PDF, TXT, MD, DOCX (até 10MB cada)</div>
            <div><strong>Como usar:</strong> Ative "Recuperação de Informações" nas configurações do agente OpenAI</div>
            <div><strong>Funcionamento:</strong> O agente busca automaticamente nos documentos quando relevante para a pergunta</div>
          </div>
        </div>

        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload de Documentos
          </h3>
          <p className="text-gray-600 mb-4">
            Adicione documentos à base de conhecimento para uso pelos agentes
          </p>
          
          <input
            type="file"
            id="knowledge-upload"
            className="hidden"
            accept=".pdf,.txt,.md,.docx"
            onChange={handleFileUpload}
            disabled={isLoading}
          />
          
          <Button 
            onClick={() => document.getElementById('knowledge-upload')?.click()}
            disabled={isLoading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isLoading ? 'Carregando...' : 'Selecionar Arquivo'}
          </Button>
          
          <p className="text-xs text-gray-500 mt-2">
            PDF, TXT, MD, DOCX até 10MB
          </p>
        </div>

        {/* Collections List */}
        {collections.length === 0 ? (
          <div className="text-center py-8">
            <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum documento na base
            </h3>
            <p className="text-gray-600">
              Faça upload do primeiro documento para começar a usar a recuperação de informações.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h4 className="font-medium">Documentos Disponíveis ({totalDocuments})</h4>
            
            {collections.map((collection) => (
              <div key={collection.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Database className="w-4 h-4 text-gray-600" />
                    <h5 className="font-medium">{collection.name}</h5>
                    <Badge 
                      variant={collection.isActive ? "secondary" : "outline"}
                      className={collection.isActive ? "bg-green-100 text-green-800" : ""}
                    >
                      {collection.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(collection.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {collection.description && (
                  <p className="text-sm text-gray-600 mb-3">{collection.description}</p>
                )}

                {/* Documents in collection */}
                <div className="space-y-2">
                  {collection.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium">{doc.name}</div>
                          <div className="text-xs text-gray-500">
                            {(doc.size / 1024 / 1024).toFixed(2)} MB • {doc.type}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline"
                          className={
                            doc.status === 'completed' ? 'bg-green-100 text-green-800' :
                            doc.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                            doc.status === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {doc.status === 'completed' ? 'Processado' :
                           doc.status === 'processing' ? 'Processando' :
                           doc.status === 'error' ? 'Erro' : 'Carregando'}
                        </Badge>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(collection.id, doc.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Processing errors */}
                {collection.documents.some(doc => doc.status === 'error') && (
                  <Alert variant="destructive" className="mt-3">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Alguns documentos falharam no processamento. Verifique o formato e tamanho dos arquivos.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Usage Instructions */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-medium text-amber-800 mb-2">📖 Como Usar</h4>
          <ol className="text-sm text-amber-700 space-y-1 list-decimal list-inside">
            <li>Faça upload dos documentos relevantes</li>
            <li>Aguarde o processamento (pode levar alguns minutos)</li>
            <li>Ative "Recuperação de Informações" nas configurações do agente OpenAI</li>
            <li>O agente automaticamente buscará informações nos documentos quando necessário</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};