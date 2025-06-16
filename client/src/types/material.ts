
export interface MaterialType {
  id: string;
  name: string;
  icon: string;
  description?: string;
  allowsUpload: boolean;
  allowsUrl: boolean;
  viewerType: 'inline' | 'download' | 'external';
}

export interface Material {
  id: string;
  title: string;
  description: string;
  type: MaterialType;
  accessLevel: 'public' | 'restricted';
  fileUrl?: string;
  externalUrl?: string;
  embedCode?: string;
  fileSize?: number;
  fileType?: string;
  uploadDate: string;
  lastModified: string;
  tags: string[];
  downloadCount: number;
  viewCount: number;
  uploadedBy: {
    id: string;
    name: string;
  };
  technicalInfo?: {
    duration?: string;
    dimensions?: string;
    format?: string;
    quality?: string;
  };
}

export interface MaterialFilters {
  search: string;
  typeId: string;
  accessLevel: 'all' | 'public' | 'restricted';
  tags: string[];
}
