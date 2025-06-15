
export interface Supplier {
  id: string;
  tradeName: string; // Nome Fantasia
  corporateName: string; // Razão Social
  category: SupplierCategory;
  notes: string; // Observações
  email: string;
  mainContact: string; // Contato Principal
  phone: string;
  whatsapp: string;
  contacts: SupplierContact[];
  branches: SupplierBranch[];
  commercialTerms: string;
  logo?: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  reviews: SupplierReview[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface SupplierContact {
  id: string;
  name: string;
  role: string; // Função
  phone: string;
  whatsapp: string;
  email: string;
  notes: string; // Observações
}

export interface SupplierBranch {
  id: string;
  name: string; // Nome da Filial
  corporateName: string; // Razão Social
  cnpj: string;
  municipalRegistration: string; // Inscrição Municipal
  stateRegistration: string; // Inscrição Estadual
  address: string;
  notes: string; // Observações
}

export interface SupplierReview {
  id: string;
  supplierId: string;
  userId: string;
  userName: string;
  rating: number; // 1 a 5 estrelas
  comment: string;
  photos: string[]; // URLs das fotos
  createdAt: string;
  isApproved: boolean;
}

export const SUPPLIER_CATEGORIES: SupplierCategory[] = [
  { id: '1', name: 'Fabricantes', icon: 'Factory', description: 'Empresas que fabricam produtos' },
  { id: '2', name: 'Distribuidores', icon: 'Truck', description: 'Empresas que distribuem produtos' },
  { id: '3', name: 'Importadores', icon: 'Globe', description: 'Empresas que importam produtos' },
  { id: '4', name: 'Representantes', icon: 'Users', description: 'Representantes comerciais' },
  { id: '5', name: 'Atacadistas', icon: 'Package', description: 'Vendas em grande quantidade' },
  { id: '6', name: 'Dropshipping', icon: 'Send', description: 'Fornecedores de dropshipping' },
];
