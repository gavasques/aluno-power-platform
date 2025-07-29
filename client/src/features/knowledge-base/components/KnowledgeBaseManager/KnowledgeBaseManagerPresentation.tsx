/**
 * PRESENTATION: KnowledgeBaseManagerPresentation
 * Interface de usuário para gerenciamento da base de conhecimento
 * Extraído de KnowledgeBaseManager.tsx (843 linhas) para modularização
 */
import { useState } from 'react';
import { Database, Upload, Search, Grid, List, Filter, Plus, FileText, Folder } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';

// Import specialized components (to be created)
import { DocumentList } from '../DocumentList/DocumentList';
import { CollectionList } from '../CollectionList/CollectionList'; 
import { DocumentForm } from '../DocumentForm/DocumentForm';
import { FileUploadForm } from '../FileUploadForm/FileUploadForm';
import { CollectionForm } from '../CollectionForm/CollectionForm';
import { SearchBar } from '../SearchBar/SearchBar';
import { FilterBar } from '../FilterBar/FilterBar';

// Import types
import { KnowledgeBaseManagerPresentationProps } from '../../types';

export const KnowledgeBaseManagerPresentation = ({
  state,
  documents,
  collections,
  actions,
  search,
  upload,
  readOnly = false,
  showCollections = true,
  allowUpload = true
}: KnowledgeBaseManagerPresentationProps) => {
  // ===== LOCAL STATE =====
  const [showDocumentForm, setShowDocumentForm] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showCollectionForm, setShowCollectionForm] = useState(false);
  const [activeTab, setActiveTab] = useState('documents');

  // ===== COMPUTED VALUES =====
  const allTags = Array.from(
    new Set(documents.data.flatMap(doc => doc.tags))
  ).sort();

  const documentStats = {
    total: documents.data.length,
    filtered: documents.filteredData.length,
    collections: collections.data.length,
    recentUploads: documents.data.filter(doc => {
      const uploadDate = new Date(doc.createdAt);
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return uploadDate > dayAgo;
    }).length
  };

  // ===== HANDLERS =====
  const handleDocumentSave = async (data: any) => {
    if (state.selectedDoc) {
      await actions.updateDocument(state.selectedDoc.id, data);
    } else {
      await actions.createDocument(data);
    }
    setShowDocumentForm(false);
    actions.selectDocument(null);
  };

  const handleFileUpload = async (data: any) => {
    await actions.uploadFile(data);
    setShowUploadForm(false);
  };

  const handleCollectionSave = async (data: any) => {
    if (state.selectedCollection) {
      await actions.updateCollection(state.selectedCollection.id, data);
    } else {
      await actions.createCollection(data);
    }
    setShowCollectionForm(false);
    actions.selectCollection(null);
  };

  return (
    <>
      <Helmet>
        <title>Base de Conhecimento - Gerenciamento de Documentos</title>
        <meta 
          name="description" 
          content="Gerencie documentos, coleções e base de conhecimento para agentes de IA com upload de arquivos, busca avançada e organização por tags." 
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 p-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Base de Conhecimento
                </h1>
                <p className="text-gray-600">
                  Gerencie documentos e coleções para agentes de IA
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  <span>{documentStats.total} docs</span>
                </div>
                {showCollections && (
                  <div className="flex items-center gap-1">
                    <Folder className="h-4 w-4" />
                    <span>{documentStats.collections} coleções</span>
                  </div>
                )}
                {documentStats.recentUploads > 0 && (
                  <Badge variant="secondary">
                    {documentStats.recentUploads} novos
                  </Badge>
                )}
              </div>

              {/* Action Buttons */}
              {!readOnly && (
                <div className="flex gap-2">
                  {allowUpload && (
                    <Button
                      onClick={() => setShowUploadForm(true)}
                      disabled={upload.isUploading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {upload.isUploading ? 'Enviando...' : 'Upload'}
                    </Button>
                  )}
                  
                  <Button
                    onClick={() => setShowDocumentForm(true)}
                    variant="outline"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Documento
                  </Button>

                  {showCollections && (
                    <Button
                      onClick={() => setShowCollectionForm(true)}
                      variant="outline"
                    >
                      <Folder className="h-4 w-4 mr-2" />
                      Nova Coleção
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 space-y-4">
            <SearchBar
              query={search.query}
              suggestions={search.suggestions}
              isSearching={search.isSearching}
              onSearch={actions.search}
              onClear={() => actions.search('')}
              placeholder="Buscar por título, conteúdo ou tags..."
            />

            <FilterBar
              tags={allTags}
              collections={collections.data}
              selectedTags={state.selectedTags}
              selectedCollection={state.selectedCollectionFilter}
              sortBy={state.sortBy}
              sortOrder={state.sortOrder}
              onTagFilter={actions.filterByTags}
              onCollectionFilter={actions.filterByCollection}
              onSort={actions.sortDocuments}
              onClearFilters={() => {
                actions.filterByTags([]);
                actions.filterByCollection(null);
                actions.search('');
              }}
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {documentStats.filtered} de {documentStats.total} documentos
              </span>
              {state.searchQuery && (
                <Badge variant="outline">
                  Filtrado: "{state.searchQuery}"
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={state.viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => actions.setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={state.viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => actions.setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar - Collections */}
          {showCollections && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Folder className="h-5 w-5" />
                    Coleções
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CollectionList
                    collections={collections.data}
                    isLoading={collections.isLoading}
                    selectedCollection={state.selectedCollection}
                    onCollectionSelect={actions.selectCollection}
                    onCollectionEdit={(collection) => {
                      actions.selectCollection(collection);
                      setShowCollectionForm(true);
                    }}
                    onCollectionDelete={actions.deleteCollection}
                    readOnly={readOnly}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Content Area */}
          <div className={showCollections ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <Card>
              <CardContent className="p-6">
                {documents.isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <span className="ml-3 text-gray-600">Carregando documentos...</span>
                  </div>
                ) : documents.filteredData.length === 0 ? (
                  <div className="text-center py-12">
                    {state.searchQuery || state.selectedTags.length > 0 || state.selectedCollectionFilter ? (
                      <div>
                        <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Nenhum documento encontrado
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Ajuste os filtros ou tente uma busca diferente.
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            actions.search('');
                            actions.filterByTags([]);
                            actions.filterByCollection(null);
                          }}
                        >
                          Limpar Filtros
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Nenhum documento na base
                        </h3>
                        <p className="text-gray-600 mb-4">
                          Comece criando um documento ou fazendo upload de arquivos.
                        </p>
                        {!readOnly && (
                          <div className="flex justify-center gap-2">
                            {allowUpload && (
                              <Button
                                onClick={() => setShowUploadForm(true)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Upload className="h-4 w-4 mr-2" />
                                Fazer Upload
                              </Button>
                            )}
                            <Button
                              onClick={() => setShowDocumentForm(true)}
                              variant="outline"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Criar Documento
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <DocumentList
                    documents={documents.filteredData}
                    isLoading={documents.isLoading}
                    viewMode={state.viewMode}
                    selectedDoc={state.selectedDoc}
                    onDocumentSelect={actions.selectDocument}
                    onDocumentEdit={(doc) => {
                      actions.selectDocument(doc);
                      setShowDocumentForm(true);
                    }}
                    onDocumentDelete={actions.deleteDocument}
                    onDocumentDuplicate={actions.duplicateDocument}
                    readOnly={readOnly}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modals/Forms */}
        {showDocumentForm && (
          <DocumentForm
            document={state.selectedDoc || undefined}
            collections={collections.data}
            onSave={handleDocumentSave}
            onCancel={() => {
              setShowDocumentForm(false);
              actions.selectDocument(null);
            }}
            isLoading={state.isSaving}
          />
        )}

        {showUploadForm && allowUpload && (
          <FileUploadForm
            collections={collections.data}
            onUpload={handleFileUpload}
            onCancel={() => setShowUploadForm(false)}
            isUploading={upload.isUploading}
            progress={upload.progress}
          />
        )}

        {showCollectionForm && showCollections && (
          <CollectionForm
            collection={state.selectedCollection || undefined}
            onSave={handleCollectionSave}
            onCancel={() => {
              setShowCollectionForm(false);
              actions.selectCollection(null);
            }}
            isLoading={state.isSaving}
          />
        )}
      </div>
    </>
  );
};