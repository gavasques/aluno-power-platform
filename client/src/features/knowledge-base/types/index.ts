/**
 * TYPES: Knowledge Base System
 * Tipos centralizados para sistema de base de conhecimento
 * Extraído de KnowledgeBaseManager.tsx (843 linhas) para modularização
 * Data: Janeiro 29, 2025
 */

// ===== CORE TYPES =====
export interface KnowledgeBaseDoc {
  id: number;
  title: string;
  content: string;
  tags: string[];
  collectionId?: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
  fileType?: 'pdf' | 'txt' | 'docx' | 'md';
  fileSize?: number;
  isIndexed?: boolean;
  vectorCount?: number;
  summary?: string;
  metadata?: Record<string, any>;
}

export interface KnowledgeBaseCollection {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  documentCount?: number;
  totalSize?: number;
  isPublic?: boolean;
  ownerId?: number;
  permissions?: CollectionPermission[];
}

export interface CollectionPermission {
  userId: number;
  role: 'viewer' | 'editor' | 'admin';
  grantedBy: number;
  grantedAt: string;
}

// ===== FORM TYPES =====
export interface FileUploadData {
  title: string;
  tags: string[];
  file: File;
  collectionId?: number | null;
  extractText?: boolean;
  autoSummary?: boolean;
  processVectors?: boolean;
}

export interface DocFormData {
  title: string;
  content: string;
  tags: string[];
  collectionId?: number | null;
  summary?: string;
  metadata?: Record<string, any>;
}

export interface CollectionFormData {
  name: string;
  description?: string;
  isPublic?: boolean;
  permissions?: Omit<CollectionPermission, 'grantedBy' | 'grantedAt'>[];
}

// ===== STATE TYPES =====
export interface KnowledgeBaseState {
  documents: KnowledgeBaseDoc[];
  collections: KnowledgeBaseCollection[];
  selectedDoc: KnowledgeBaseDoc | null;
  selectedCollection: KnowledgeBaseCollection | null;
  isLoading: boolean;
  isSaving: boolean;
  isUploading: boolean;
  searchQuery: string;
  selectedTags: string[];
  selectedCollectionFilter: number | null;
  sortBy: 'title' | 'createdAt' | 'updatedAt' | 'fileSize';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'table';
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
}

// ===== HOOK RETURN TYPES =====
export interface UseKnowledgeBaseReturn {
  state: KnowledgeBaseState;
  documents: {
    data: KnowledgeBaseDoc[];
    filteredData: KnowledgeBaseDoc[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  collections: {
    data: KnowledgeBaseCollection[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
  };
  actions: {
    // Document actions
    createDocument: (data: DocFormData) => Promise<KnowledgeBaseDoc>;
    updateDocument: (id: number, data: Partial<DocFormData>) => Promise<KnowledgeBaseDoc>;
    deleteDocument: (id: number) => Promise<void>;
    duplicateDocument: (id: number) => Promise<KnowledgeBaseDoc>;
    
    // File actions
    uploadFile: (data: FileUploadData) => Promise<KnowledgeBaseDoc>;
    downloadDocument: (id: number) => Promise<void>;
    extractText: (id: number) => Promise<string>;
    
    // Collection actions
    createCollection: (data: CollectionFormData) => Promise<KnowledgeBaseCollection>;
    updateCollection: (id: number, data: Partial<CollectionFormData>) => Promise<KnowledgeBaseCollection>;
    deleteCollection: (id: number) => Promise<void>;
    
    // Search and filter actions
    search: (query: string) => void;
    filterByTags: (tags: string[]) => void;
    filterByCollection: (collectionId: number | null) => void;
    sortDocuments: (field: KnowledgeBaseState['sortBy'], order: KnowledgeBaseState['sortOrder']) => void;
    
    // View actions
    setViewMode: (mode: KnowledgeBaseState['viewMode']) => void;
    selectDocument: (doc: KnowledgeBaseDoc | null) => void;
    selectCollection: (collection: KnowledgeBaseCollection | null) => void;
    
    // Pagination
    goToPage: (page: number) => void;
    setItemsPerPage: (items: number) => void;
    
    // Bulk actions
    bulkDelete: (ids: number[]) => Promise<void>;
    bulkMove: (ids: number[], collectionId: number) => Promise<void>;
    bulkTag: (ids: number[], tags: string[]) => Promise<void>;
  };
  search: {
    query: string;
    results: KnowledgeBaseDoc[];
    isSearching: boolean;
    suggestions: string[];
    filters: {
      tags: string[];
      collections: KnowledgeBaseCollection[];
      dateRange: { start?: Date; end?: Date };
      fileTypes: string[];
    };
  };
  upload: {
    isUploading: boolean;
    progress: number;
    queue: FileUploadData[];
    errors: UploadError[];
    completed: number;
    total: number;
  };
}

export interface UseDocumentFormReturn {
  formData: DocFormData;
  errors: Record<string, string>;
  isValid: boolean;
  isDirty: boolean;
  updateField: (field: keyof DocFormData, value: any) => void;
  updateTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  validate: () => boolean;
  reset: () => void;
  loadDocument: (doc: KnowledgeBaseDoc) => void;
}

export interface UseFileUploadReturn {
  uploadData: FileUploadData;
  errors: Record<string, string>;
  isValid: boolean;
  progress: number;
  isUploading: boolean;
  updateField: (field: keyof FileUploadData, value: any) => void;
  updateTags: (tags: string[]) => void;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  setFile: (file: File) => void;
  validateFile: (file: File) => string | null;
  upload: () => Promise<KnowledgeBaseDoc>;
  reset: () => void;
}

export interface UseSearchReturn {
  query: string;
  results: KnowledgeBaseDoc[];
  isSearching: boolean;
  suggestions: string[];
  filters: SearchFilters;
  setQuery: (query: string) => void;
  search: () => Promise<void>;
  clearSearch: () => void;
  addFilter: (key: keyof SearchFilters, value: any) => void;
  removeFilter: (key: keyof SearchFilters) => void;
  clearAllFilters: () => void;
}

// ===== COMPONENT PROPS TYPES =====
export interface KnowledgeBaseManagerContainerProps {
  initialCollectionId?: number;
  readOnly?: boolean;
  showCollections?: boolean;
  allowUpload?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  onDocumentSelect?: (doc: KnowledgeBaseDoc) => void;
  onCollectionSelect?: (collection: KnowledgeBaseCollection) => void;
}

export interface KnowledgeBaseManagerPresentationProps {
  state: KnowledgeBaseState;
  documents: UseKnowledgeBaseReturn['documents'];
  collections: UseKnowledgeBaseReturn['collections'];
  actions: UseKnowledgeBaseReturn['actions'];
  search: UseKnowledgeBaseReturn['search'];
  upload: UseKnowledgeBaseReturn['upload'];
  readOnly?: boolean;
  showCollections?: boolean;
  allowUpload?: boolean;
}

export interface DocumentListProps {
  documents: KnowledgeBaseDoc[];
  isLoading: boolean;
  viewMode: KnowledgeBaseState['viewMode'];
  selectedDoc: KnowledgeBaseDoc | null;
  onDocumentSelect: (doc: KnowledgeBaseDoc) => void;
  onDocumentEdit: (doc: KnowledgeBaseDoc) => void;
  onDocumentDelete: (id: number) => void;
  onDocumentDuplicate: (id: number) => void;
  readOnly?: boolean;
}

export interface DocumentCardProps {
  document: KnowledgeBaseDoc;
  isSelected: boolean;
  onSelect: (doc: KnowledgeBaseDoc) => void;
  onEdit: (doc: KnowledgeBaseDoc) => void;
  onDelete: (id: number) => void;
  onDuplicate: (id: number) => void;
  readOnly?: boolean;
}

export interface DocumentFormProps {
  document?: KnowledgeBaseDoc;
  collections: KnowledgeBaseCollection[];
  onSave: (data: DocFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface FileUploadFormProps {
  collections: KnowledgeBaseCollection[];
  onUpload: (data: FileUploadData) => Promise<void>;
  onCancel: () => void;
  isUploading?: boolean;
  progress?: number;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export interface CollectionListProps {
  collections: KnowledgeBaseCollection[];
  isLoading: boolean;
  selectedCollection: KnowledgeBaseCollection | null;
  onCollectionSelect: (collection: KnowledgeBaseCollection) => void;
  onCollectionEdit: (collection: KnowledgeBaseCollection) => void;
  onCollectionDelete: (id: number) => void;
  readOnly?: boolean;
}

export interface CollectionFormProps {
  collection?: KnowledgeBaseCollection;
  onSave: (data: CollectionFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface SearchBarProps {
  query: string;
  suggestions: string[];
  isSearching: boolean;
  onSearch: (query: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export interface FilterBarProps {
  tags: string[];
  collections: KnowledgeBaseCollection[];
  selectedTags: string[];
  selectedCollection: number | null;
  sortBy: KnowledgeBaseState['sortBy'];
  sortOrder: KnowledgeBaseState['sortOrder'];
  onTagFilter: (tags: string[]) => void;
  onCollectionFilter: (collectionId: number | null) => void;
  onSort: (field: KnowledgeBaseState['sortBy'], order: KnowledgeBaseState['sortOrder']) => void;
  onClearFilters: () => void;
}

// ===== UTILITY TYPES =====
export interface SearchFilters {
  tags: string[];
  collections: number[];
  dateRange: { start?: Date; end?: Date };
  fileTypes: string[];
  minSize?: number;
  maxSize?: number;
  hasVectors?: boolean;
  isIndexed?: boolean;
}

export interface UploadError {
  file: string;
  message: string;
  code: string;
}

export interface BulkAction {
  type: 'delete' | 'move' | 'tag' | 'export';
  label: string;
  icon: React.ReactNode;
  color: string;
  requiresConfirmation: boolean;
}

export interface DocumentMetrics {
  totalDocuments: number;
  totalSize: number;
  documentsToday: number;
  averageSize: number;
  topTags: { tag: string; count: number }[];
  topCollections: { collection: string; count: number }[];
  fileTypeDistribution: { type: string; count: number }[];
}

// ===== CONSTANTS =====
export const SUPPORTED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/markdown',
  'application/json',
  'text/csv'
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_CONTENT_LENGTH = 50000; // 50k characters
export const DEFAULT_ITEMS_PER_PAGE = 20;

export const SORT_OPTIONS = [
  { value: 'title', label: 'Título' },
  { value: 'createdAt', label: 'Data de Criação' },
  { value: 'updatedAt', label: 'Última Atualização' },
  { value: 'fileSize', label: 'Tamanho' }
] as const;

export const VIEW_MODES = [
  { value: 'grid', label: 'Grade', icon: 'Grid' },
  { value: 'list', label: 'Lista', icon: 'List' },
  { value: 'table', label: 'Tabela', icon: 'Table' }
] as const;

// ===== ERROR TYPES =====
export type KnowledgeBaseErrorType = 
  | 'UPLOAD_ERROR'
  | 'VALIDATION_ERROR'
  | 'SAVE_ERROR'
  | 'DELETE_ERROR'
  | 'SEARCH_ERROR'
  | 'PERMISSION_ERROR'
  | 'NETWORK_ERROR'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'CONTENT_TOO_LONG'
  | 'COLLECTION_NOT_FOUND'
  | 'DOCUMENT_NOT_FOUND';

export interface KnowledgeBaseError {
  type: KnowledgeBaseErrorType;
  message: string;
  field?: string;
  details?: any;
}

// ===== API TYPES =====
export interface CreateDocumentRequest {
  title: string;
  content: string;
  tags: string[];
  collectionId?: number;
  summary?: string;
  metadata?: Record<string, any>;
}

export interface UpdateDocumentRequest extends Partial<CreateDocumentRequest> {
  id: number;
}

export interface UploadFileRequest extends FormData {
  // FormData with: file, title, tags, collectionId, extractText, autoSummary, processVectors
}

export interface SearchDocumentsRequest {
  query?: string;
  tags?: string[];
  collectionId?: number;
  dateRange?: { start: string; end: string };
  fileTypes?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchDocumentsResponse {
  documents: KnowledgeBaseDoc[];
  total: number;
  page: number;
  limit: number;
  suggestions?: string[];
}

export interface CreateCollectionRequest {
  name: string;
  description?: string;
  isPublic?: boolean;
  permissions?: Omit<CollectionPermission, 'grantedBy' | 'grantedAt'>[];
}

export interface UpdateCollectionRequest extends Partial<CreateCollectionRequest> {
  id: number;
}

// ===== EXPORT AGGREGATED TYPES =====
export type {
  KnowledgeBaseDoc as Document,
  KnowledgeBaseCollection as Collection,
  FileUploadData as UploadData,
  DocFormData as DocumentForm,
  CollectionFormData as CollectionForm
};