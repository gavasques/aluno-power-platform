
export interface Partner {
  id: string;
  name: string;
  email: string;
  phone: string;
  category: PartnerCategory;
  specialties: string[];
  description: string;
  about: string;
  services: PartnerService[];
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  website?: string;
  instagram?: string;
  linkedin?: string;
  portfolio: PortfolioItem[];
  certifications: string[];
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

export interface PartnerService {
  id: string;
  name: string;
  description: string;
  price?: string;
  duration?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
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
