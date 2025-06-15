
export interface Supplier {
  id: string;
  tradeName: string; // Nome Fantasia
  corporateName: string; // Razão Social
  category: SupplierCategory;
  departments: SupplierDepartment[]; // Departamentos que atende
  notes: string; // Observações
  email: string;
  mainContact: string; // Contato Principal
  phone: string;
  whatsapp: string;
  contacts: SupplierContact[];
  files: SupplierFile[]; // Arquivos do fornecedor
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

export interface SupplierDepartment {
  id: string;
  name: string;
  description: string;
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

export interface SupplierFile {
  id: string;
  name: string;
  description: string;
  type: 'catalog' | 'price_sheet' | 'presentation' | 'certificate' | 'other';
  fileUrl: string;
  uploadedAt: string;
  size: number; // em bytes
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

export const SUPPLIER_DEPARTMENTS: SupplierDepartment[] = [
  { id: '1', name: 'Eletrônicos', description: 'Produtos eletrônicos e tecnologia' },
  { id: '2', name: 'Casa e Jardim', description: 'Produtos para casa e jardim' },
  { id: '3', name: 'Moda e Beleza', description: 'Roupas, calçados e cosméticos' },
  { id: '4', name: 'Automotivo', description: 'Peças e acessórios automotivos' },
  { id: '5', name: 'Esportes', description: 'Artigos esportivos e fitness' },
  { id: '6', name: 'Infantil', description: 'Produtos para bebês e crianças' },
  { id: '7', name: 'Alimentício', description: 'Alimentos e bebidas' },
  { id: '8', name: 'Construção', description: 'Material de construção e ferramentas' },
];

export const FILE_TYPES = [
  { value: 'catalog', label: 'Catálogo de Produtos' },
  { value: 'price_sheet', label: 'Planilha de Preços' },
  { value: 'presentation', label: 'Apresentação' },
  { value: 'certificate', label: 'Certificados' },
  { value: 'other', label: 'Outros' },
];
