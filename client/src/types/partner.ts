
export interface Partner {
  id: string;
  name: string;
  email?: string;
  phone: string;
  logo?: string;
  category: PartnerCategory;
  specialties: string;
  description: string;
  about: string;
  services: string;
  contacts: PartnerContact[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  website?: string;
  instagram?: string;
  linkedin?: string;
  materials: PartnerMaterial[];
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  reviews: Review[];
  createdAt: string;
  updatedAt: string;
}

export interface PartnerCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface PartnerContact {
  id: string;
  type: 'phone' | 'email' | 'whatsapp' | 'website';
  value: string;
  label?: string;
}

export interface PartnerMaterial {
  id: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface Review {
  id: string;
  partnerId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isApproved: boolean;
}

export const PARTNER_CATEGORIES: PartnerCategory[] = [
  { id: '1', name: 'Contadores', icon: 'Calculator', description: 'Serviços de contabilidade e consultoria fiscal' },
  { id: '2', name: 'Advogados', icon: 'Scales', description: 'Consultoria jurídica empresarial' },
  { id: '3', name: 'Fotógrafos', icon: 'Camera', description: 'Fotografia de produtos e institucional' },
  { id: '4', name: 'Prep Centers', icon: 'Package', description: 'Centros de preparação e distribuição' },
  { id: '5', name: 'Designers', icon: 'Palette', description: 'Design gráfico e identidade visual' },
  { id: '6', name: 'Consultores', icon: 'Users', description: 'Consultoria empresarial especializada' },
];
