import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, index, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  phoneVerificationCode: text("phone_verification_code"),
  phoneVerificationExpiry: timestamp("phone_verification_expiry"),
  role: text("role").notNull().default("user"), // admin, support, user
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  passwordResetCode: text("password_reset_code"),
  passwordResetCodeExpiry: timestamp("password_reset_code_expiry"),
  magicLinkToken: text("magic_link_token"),
  magicLinkExpiresAt: timestamp("magic_link_expires_at"),
  emailVerified: boolean("email_verified").notNull().default(false),
  stripeCustomerId: text("stripe_customer_id"),
  credits: decimal("credits", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User Groups table
export const userGroups = pgTable("user_groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User Group Members table
export const userGroupMembers = pgTable("user_group_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  groupId: integer("group_id").references(() => userGroups.id).notNull(),
  addedAt: timestamp("added_at").notNull().defaultNow(),
});

// User Sessions table
export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  sessionToken: text("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Companies table - Minhas Empresas
export const userCompanies = pgTable("user_companies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  corporateName: text("corporate_name").notNull(), // Razão Social
  tradeName: text("trade_name").notNull(), // Nome Fantasia
  cnpj: text("cnpj"), // CNPJ
  address: text("address"), // Endereço
  neighborhood: text("neighborhood"), // Bairro
  postalCode: text("postal_code"), // CEP
  city: text("city"), // Cidade
  state: text("state"), // Estado
  country: text("country").notNull().default("Brasil"), // País
  email: text("email"), // Email
  website: text("website"), // Website
  phone: text("phone"), // Telefone
  fax: text("fax"), // Fax
  mobile: text("mobile"), // Celular
  stateRegistration: text("state_registration"), // Inscrição Estadual
  municipalRegistration: text("municipal_registration"), // Inscrição Municipal
  logoUrl: text("logo_url"), // URL da logomarca da empresa
  notes: text("notes"), // Observações
  isActive: boolean("is_active").notNull().default(true), // Status ativo/inativo
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("user_companies_user_idx").on(table.userId),
  nameIdx: index("user_companies_name_idx").on(table.tradeName),
  activeIdx: index("user_companies_active_idx").on(table.isActive),
  userActiveIdx: index("user_companies_user_active_idx").on(table.userId, table.isActive),
}));

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'supplier', 'material', etc. (NOT partner)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// International Supplier Contracts table
export const internationalSupplierContracts = pgTable("international_supplier_contracts", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").notNull(), // Foreign key to supplier
  userId: integer("user_id").references(() => users.id).notNull(),
  contractNumber: text("contract_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  contractType: text("contract_type").notNull(), // purchase, supply, service, etc.
  status: text("status").notNull().default("draft"), // draft, active, expired, terminated
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  value: decimal("value", { precision: 15, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  paymentTerms: text("payment_terms"),
  deliveryTerms: text("delivery_terms"),
  incoterms: text("incoterms"), // FOB, CIF, EXW, etc.
  documents: jsonb("documents").notNull().default([]), // Array of document objects
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("international_contracts_user_idx").on(table.userId),
  supplierIdx: index("international_contracts_supplier_idx").on(table.supplierId),
  statusIdx: index("international_contracts_status_idx").on(table.status),
}));

// Partner Types - Separate table for partner types
export const partnerTypes = pgTable("partner_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("Users"),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Departments
export const departments = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Suppliers
export const suppliers = pgTable("suppliers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  tradeName: text("trade_name").notNull(),
  corporateName: text("corporate_name").notNull(),
  categoryId: integer("category_id").references(() => departments.id),
  logo: text("logo"),
  description: text("description"),
  notes: text("notes"),
  isVerified: boolean("is_verified").notNull().default(false),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").notNull().default(0),
  website: text("website"),
  linkedin: text("linkedin"),
  instagram: text("instagram"),
  youtube: text("youtube"),
  commercialEmail: text("commercial_email"),
  supportEmail: text("support_email"),
  phone0800Sales: text("phone_0800_sales"),
  phone0800Support: text("phone_0800_support"),
  fax: text("fax"),
  mobile: text("mobile"),
  
  // Additional supplier information
  cnpj: text("cnpj"),
  country: text("country").default("Brasil"),
  state: text("state"),
  city: text("city"),
  neighborhood: text("neighborhood"),
  cep: text("cep"),
  address: text("address"),
  stateRegistration: text("state_registration"),
  municipalRegistration: text("municipal_registration"),
  supplierType: text("supplier_type"), // 'distribuidora', 'importadora', 'fabricante', 'industria', 'representante'
  additionalInfo: text("additional_info"), // Informações Adicionais - campo de texto livre
  paymentTerm: text("payment_term"), // Prazo de Pagamento
  deliveryTerm: text("delivery_term"), // Prazo de Entrega
  bankingData: text("banking_data"), // Dados Bancários - campo longo de texto
  status: text("status").default("ativo"), // 'ativo', 'inativo'
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Supplier Contacts
export const supplierContacts = pgTable("supplier_contacts", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  position: text("position"), // cargo
  notes: text("notes"), // observação
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Supplier Files
export const supplierFiles = pgTable("supplier_files", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  type: text("type").notNull(), // 'catalog', 'price_sheet', 'presentation', 'certificate', 'other'
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Supplier Brands
export const supplierBrands = pgTable("supplier_brands", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Supplier Reviews
export const supplierReviews = pgTable("supplier_reviews", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Supplier Conversations (CRM)
export const supplierConversations = pgTable("supplier_conversations", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(), // Assunto da conversa
  content: text("content").notNull(), // O que foi falado
  channel: text("channel").notNull(), // whatsapp, telefone, email, pessoalmente, call, outro
  contactPerson: text("contact_person"), // Pessoa de contato
  attachedFileId: integer("attached_file_id").references(() => supplierFiles.id), // Arquivo anexo opcional
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Partners
export const partners = pgTable("partners", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"), // Made optional
  phone: text("phone").notNull(),
  logo: text("logo"), // Added logo field
  partnerTypeId: integer("partner_type_id").references(() => partnerTypes.id),
  specialties: text("specialties").array(),
  description: text("description"),
  address: jsonb("address"), // {street, city, state, zipCode}
  website: text("website"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
  youtubeChannel: text("youtube_channel"), // YouTube channel URL
  presentationVideoUrl: text("presentation_video_url"), // YouTube URL for presentation video
  guilhermeVideoUrl: text("guilherme_video_url"), // YouTube URL for Guilherme video
  isVerified: boolean("is_verified").notNull().default(false),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Partner Contacts
export const partnerContacts = pgTable("partner_contacts", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  area: text("area").notNull(), // Area/Departamento
  name: text("name").notNull(), // Nome do contato
  email: text("email"), // Email do contato
  phone: text("phone"), // Telefone
  whatsapp: text("whatsapp"), // WhatsApp
  notes: text("notes"), // Observações
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Partner Files
export const partnerFiles = pgTable("partner_files", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  name: text("name").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(), // 'presentation', 'catalog', 'pricing', 'services', 'other'
  fileName: text("file_name").notNull(),
  fileSize: text("file_size"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Partner Materials
export const partnerMaterials = pgTable("partner_materials", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  name: text("name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

// Partner Reviews
export const partnerReviews = pgTable("partner_reviews", {
  id: serial("id").primaryKey(),
  partnerId: integer("partner_id").references(() => partners.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Partner Review Replies
export const partnerReviewReplies = pgTable("partner_review_replies", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => partnerReviews.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Material Categories
export const materialCategories = pgTable("material_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").notNull().default("#3B82F6"), // Hex color for UI
  icon: text("icon").notNull().default("Folder"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Material Types
export const materialTypes = pgTable("material_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description"),
  contentType: text("content_type").notNull(), // 'embed', 'video', 'pdf', 'download'
  allowsUpload: boolean("allows_upload").notNull().default(true),
  allowsUrl: boolean("allows_url").notNull().default(true),
  allowsEmbed: boolean("allows_embed").notNull().default(false),
  viewerType: text("viewer_type").notNull().default("inline"), // 'inline', 'download', 'external'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Materials
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  typeId: integer("type_id").references(() => materialTypes.id).notNull(),
  categoryId: integer("category_id").references(() => materialCategories.id),
  accessLevel: text("access_level").notNull().default("public"), // 'public', 'restricted'
  
  // File content
  fileUrl: text("file_url"),
  fileName: text("file_name"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
  
  // External/URL content
  externalUrl: text("external_url"),
  
  // Embed content
  embedCode: text("embed_code"),
  embedUrl: text("embed_url"),
  
  // Video content
  videoUrl: text("video_url"),
  videoDuration: integer("video_duration"), // in seconds
  videoThumbnail: text("video_thumbnail"),
  
  tags: text("tags").array(),
  downloadCount: integer("download_count").notNull().default(0),
  viewCount: integer("view_count").notNull().default(0),
  uploadedBy: integer("uploaded_by").references(() => users.id).notNull(),
  technicalInfo: jsonb("technical_info"), // {duration, dimensions, format, quality}
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  lastModified: timestamp("last_modified").notNull().defaultNow(),
});

// Tool Types
export const toolTypes = pgTable("tool_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tools
export const tools = pgTable("tools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  typeId: integer("type_id").references(() => toolTypes.id).notNull(),
  logo: text("logo").notNull(),
  website: text("website"),
  pricing: text("pricing"),
  features: text("features").array(),
  pros: text("pros").array(),
  cons: text("cons").array(),
  brazilSupport: text("brazil_support").notNull(), // 'works', 'partial', 'no'
  verified: boolean("verified").notNull().default(false),
  averageRating: decimal("average_rating", { precision: 3, scale: 2 }).default("0"),
  totalReviews: integer("total_reviews").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Tool Reviews
export const toolReviews = pgTable("tool_reviews", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").references(() => tools.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  photos: text("photos").array(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tool Review Replies
export const toolReviewReplies = pgTable("tool_review_replies", {
  id: serial("id").primaryKey(),
  reviewId: integer("review_id").references(() => toolReviews.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tool Discounts
export const toolDiscounts = pgTable("tool_discounts", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").references(() => tools.id).notNull(),
  title: text("title").notNull(),
  linkOrCoupon: text("link_or_coupon").notNull(),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Template Categories
export const templateCategories = pgTable("template_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Templates
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => templateCategories.id).notNull(),
  variables: text("variables").array(),
  usageInstructions: text("usage_instructions"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Prompt Categories
export const promptCategories = pgTable("prompt_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Prompts
export const prompts = pgTable("prompts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  categoryId: integer("category_id").references(() => promptCategories.id).notNull(),
  tags: text("tags").array(),
  usageExamples: text("usage_examples").array(),
  steps: jsonb("steps"), // Array of step objects
  images: text("images").array(),
  files: jsonb("files"), // Array of file objects
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Brands
export const brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").references(() => users.id), // null for global brands
  isGlobal: boolean("is_global").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(), // Critical: User ownership
  name: text("name").notNull(),
  photo: text("photo"),
  sku: text("sku").notNull(), // Made required
  freeCode: text("free_code"), // Código Livre
  supplierCode: text("supplier_code"), // Código no Fornecedor
  internalCode: text("internal_code"),
  ean: text("ean"),
  dimensions: jsonb("dimensions"), // {length, width, height}
  weight: decimal("weight", { precision: 10, scale: 3 }),
  brand: text("brand"), // Legacy field for text brand name
  brandId: integer("brand_id").references(() => brands.id), // Changed from text to reference
  category: text("category"),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  ncm: text("ncm"),
  costItem: decimal("cost_item", { precision: 10, scale: 2 }),
  packCost: decimal("pack_cost", { precision: 10, scale: 2 }),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }),
  observations: text("observations"),
  bulletPoints: text("bullet_points"), // Added
  description: text("description"), // Added
  descriptions: jsonb("descriptions"), // {description, htmlDescription, bulletPoints, technicalSpecs}
  channels: jsonb("channels"), // Channel configuration object
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // PHASE 1 PERFORMANCE INDEXES - 70-80% speed improvement
  userActiveIdx: index("products_user_active_idx").on(table.userId, table.active),
  userNameIdx: index("products_user_name_idx").on(table.userId, table.name),
  userBrandIdx: index("products_user_brand_idx").on(table.userId, table.brandId),
  userSupplierIdx: index("products_user_supplier_idx").on(table.userId, table.supplierId),
  skuSearchIdx: index("products_sku_search_idx").on(table.sku),
  costRangeIdx: index("products_cost_range_idx").on(table.costItem),
  createdDescIdx: index("products_created_desc_idx").on(table.createdAt),
  updatedDescIdx: index("products_updated_desc_idx").on(table.updatedAt),
  // Compound indexes for common query patterns
  userNameActiveIdx: index("products_user_name_active_idx").on(table.userId, table.name, table.active),
  userBrandActiveIdx: index("products_user_brand_active_idx").on(table.userId, table.brandId, table.active),
}));

// Product Suppliers - Tabela de relacionamento Produto x Fornecedor (many-to-many)
export const productSuppliers = pgTable("product_suppliers", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id, { onDelete: "cascade" }).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "cascade" }).notNull(),
  supplierCode: text("supplier_code"), // Código do produto no fornecedor
  cost: decimal("cost", { precision: 10, scale: 2 }), // Custo específico deste produto com este fornecedor
  isPrimary: boolean("is_primary").notNull().default(false), // Indica se é o fornecedor principal

  notes: text("notes"), // Observações específicas desta relação
  active: boolean("active").notNull().default(true), // Status ativo/inativo
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Garante que não há duplicatas produto-fornecedor
  productSupplierUnique: unique("product_supplier_unique").on(table.productId, table.supplierId),
  productIdx: index("product_suppliers_product_idx").on(table.productId),
  supplierIdx: index("product_suppliers_supplier_idx").on(table.supplierId),
  primaryIdx: index("product_suppliers_primary_idx").on(table.isPrimary),
  activeIdx: index("product_suppliers_active_idx").on(table.active),
}));

// Supplier Products - Tabela para produtos do fornecedor (existam ou não no sistema)
export const supplierProducts = pgTable("supplier_products", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Dados do produto no fornecedor (campos simplificados conforme solicitado)
  supplierSku: text("supplier_sku").notNull(), // SKU no fornecedor
  productName: text("product_name").notNull(), // Nome do produto
  cost: decimal("cost", { precision: 10, scale: 2 }), // Custo
  leadTime: integer("lead_time"), // Tempo de entrega (dias)
  minimumOrderQuantity: integer("minimum_order_quantity"), // Quantidade mínima de pedido
  masterBox: integer("master_box"), // Caixa master - quantidade por caixa
  stock: integer("stock"), // Estoque disponível no fornecedor
  
  // Status de vinculação
  productId: integer("product_id").references(() => products.id, { onDelete: "set null" }), // NULL se não existir no sistema
  linkStatus: text("link_status").notNull().default("pending"), // 'linked', 'pending', 'not_found'
  
  // Metadados
  active: boolean("active").notNull().default(true), // Status ativo/inativo
  
  // Auditoria
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  // Índices para performance
  supplierIdx: index("supplier_products_supplier_idx").on(table.supplierId),
  userIdx: index("supplier_products_user_idx").on(table.userId),
  productIdx: index("supplier_products_product_idx").on(table.productId),
  statusIdx: index("supplier_products_status_idx").on(table.linkStatus),
  skuIdx: index("supplier_products_sku_idx").on(table.supplierSku),
  
  // Constraint único para evitar duplicatas
  supplierSkuUnique: unique("supplier_sku_unique").on(table.supplierId, table.supplierSku),
}));

// Product Cost History
export const productCostHistory = pgTable("product_cost_history", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id).notNull(),
  previousCost: decimal("previous_cost", { precision: 10, scale: 2 }),
  newCost: decimal("new_cost", { precision: 10, scale: 2 }).notNull(),
  observations: text("observations"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  productIdx: index("cost_history_product_idx").on(table.productId),
  createdIdx: index("cost_history_created_idx").on(table.createdAt),
}));

// YouTube Videos Cache
export const youtubeVideos = pgTable("youtube_videos", {
  id: serial("id").primaryKey(),
  videoId: text("video_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  channelTitle: text("channel_title").notNull(),
  channelId: text("channel_id").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  duration: text("duration"),
  viewCount: integer("view_count"),
  likeCount: integer("like_count"),
  tags: text("tags").array(),
  category: text("category"),
  isActive: boolean("is_active").notNull().default(true),
  fetchedAt: timestamp("fetched_at").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// News table
export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  imageUrl: text("image_url"),
  category: text("category"), // 'amazon', 'market', 'tools', etc.
  tags: text("tags").array(),
  isPublished: boolean("is_published").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  publishedAt: timestamp("published_at"),
  authorId: integer("author_id").references(() => users.id),
  source: text("source"), // 'manual', 'webhook'
  webhookData: text("webhook_data"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  createdAtIdx: index("news_created_at_idx").on(table.createdAt),
  publishedIdx: index("news_published_idx").on(table.isPublished),
  categoryIdx: index("news_category_idx").on(table.category),
  publishedCreatedIdx: index("news_published_created_idx").on(table.isPublished, table.createdAt),
  featuredIdx: index("news_featured_idx").on(table.isFeatured),
}));

// Updates table
export const updates = pgTable("updates", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"),
  version: text("version"),
  type: text("type").notNull(), // 'feature', 'bugfix', 'improvement', 'announcement'
  priority: text("priority").notNull().default("normal"), // 'low', 'normal', 'high', 'critical'
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  authorId: integer("author_id").references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  createdAtIdx: index("updates_created_at_idx").on(table.createdAt),
  publishedIdx: index("updates_published_idx").on(table.isPublished),
  typeIdx: index("updates_type_idx").on(table.type),
  priorityIdx: index("updates_priority_idx").on(table.priority),
  publishedCreatedIdx: index("updates_published_created_idx").on(table.isPublished, table.createdAt),
  publishedPriorityIdx: index("updates_published_priority_idx").on(table.isPublished, table.priority),
  typeCreatedIdx: index("updates_type_created_idx").on(table.type, table.createdAt),
}));

// Tool videos
export const toolVideos = pgTable("tool_videos", {
  id: serial("id").primaryKey(),
  toolId: integer("tool_id").references(() => tools.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  videoId: text("video_id").notNull(), // YouTube video ID
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  toolIdx: index("tool_videos_tool_idx").on(table.toolId),
  videoIdx: index("tool_videos_video_idx").on(table.videoId),
}));



// Agents table
export const agents = pgTable("agents", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  icon: text("icon"),
  isActive: boolean("is_active").notNull().default(true),
  provider: text("provider").notNull().default("openai"), // 'openai', 'anthropic', 'gemini', 'deepseek'
  model: text("model").notNull(),
  temperature: decimal("temperature", { precision: 3, scale: 2 }).notNull().default("0.7"),
  maxTokens: integer("max_tokens").notNull().default(2000),
  costPer1kTokens: decimal("cost_per_1k_tokens", { precision: 8, scale: 6 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  activeIdx: index("agents_active_idx").on(table.isActive),
  providerIdx: index("agents_provider_idx").on(table.provider),
}));

// Agent Prompts table
export const agentPrompts = pgTable("agent_prompts", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").references(() => agents.id, { onDelete: "cascade" }).notNull(),
  promptType: text("prompt_type").notNull(), // 'system', 'analysis', 'title', 'bulletPoints', 'description'
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  agentTypeIdx: index("agent_prompts_agent_type_idx").on(table.agentId, table.promptType, table.isActive),
}));

// Agent Usage table
export const agentUsage = pgTable("agent_usage", {
  id: text("id").primaryKey(),
  agentId: text("agent_id").references(() => agents.id).notNull(),
  userId: text("user_id").notNull(),
  userName: text("user_name"),
  inputTokens: integer("input_tokens"),
  outputTokens: integer("output_tokens"),
  totalTokens: integer("total_tokens"),
  costUsd: decimal("cost_usd", { precision: 10, scale: 6 }),
  processingTimeMs: integer("processing_time_ms"),
  status: text("status").notNull().default("success"), // 'success', 'error'
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userDateIdx: index("agent_usage_user_date_idx").on(table.userId, table.createdAt),
}));

// Agent Generations table
export const agentGenerations = pgTable("agent_generations", {
  id: text("id").primaryKey(),
  usageId: text("usage_id").references(() => agentUsage.id).notNull(),
  productName: text("product_name"),
  productInfo: jsonb("product_info"),
  reviewsData: jsonb("reviews_data"),
  analysisResult: jsonb("analysis_result"),
  titles: jsonb("titles"),
  bulletPoints: jsonb("bullet_points"),
  description: text("description"),
  
  // Prompt 1 - Analysis Request/Response
  prompt1Input: jsonb("prompt1_input"), // JSON data sent to AI provider for analysis
  prompt1Output: jsonb("prompt1_output"), // JSON response from AI provider for analysis
  prompt1Provider: text("prompt1_provider"), // AI provider used (openai, claude, gemini, etc)
  prompt1Model: text("prompt1_model"), // Model used (gpt-4o, claude-3-sonnet, etc)
  prompt1Tokens: jsonb("prompt1_tokens"), // Token usage {input, output, total}
  prompt1Cost: decimal("prompt1_cost", { precision: 10, scale: 6 }), // Cost in USD
  prompt1Duration: integer("prompt1_duration"), // Processing time in ms
  
  // Prompt 2 - Titles Generation Request/Response  
  prompt2Input: jsonb("prompt2_input"), // JSON data sent to AI provider for titles
  prompt2Output: jsonb("prompt2_output"), // JSON response from AI provider for titles
  prompt2Provider: text("prompt2_provider"), // AI provider used
  prompt2Model: text("prompt2_model"), // Model used
  prompt2Tokens: jsonb("prompt2_tokens"), // Token usage {input, output, total}
  prompt2Cost: decimal("prompt2_cost", { precision: 10, scale: 6 }), // Cost in USD
  prompt2Duration: integer("prompt2_duration"), // Processing time in ms
  
  // Additional prompts can be added (prompt3, prompt4, etc) for future expansions
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Agent Sessions - Sistema de sessões para processamento
export const agentSessions = pgTable("agent_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionHash: text("session_hash").notNull().unique(),
  userId: text("user_id").notNull(),
  agentType: text("agent_type").notNull(), // 'amazon-listing-optimizer'
  status: text("status").notNull().default("active"), // 'active', 'completed', 'archived'
  inputData: jsonb("input_data"), // Dados de entrada: {productName, category, keywords, etc}
  tags: jsonb("tags"), // Tags geradas: {KEYWORDS: "...", TITLE: "...", etc}
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("agent_sessions_user_idx").on(table.userId),
  typeIdx: index("agent_sessions_type_idx").on(table.agentType),
  hashIdx: index("agent_sessions_hash_idx").on(table.sessionHash),
}));

// Agent Session Files - Arquivos de uma sessão
export const agentSessionFiles = pgTable("agent_session_files", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").references(() => agentSessions.id, { onDelete: "cascade" }).notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size").notNull(),
  processedContent: text("processed_content"), // Conteúdo interpretado
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
}, (table) => ({
  sessionIdx: index("agent_session_files_session_idx").on(table.sessionId),
}));

// Amazon Listing Optimizer Sessions - Tabela específica conforme especificação
export const amazonListingSessions = pgTable("amazon_listing_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionHash: text("session_hash").notNull().unique().$defaultFn(() => Math.random().toString(36).substring(2, 10).toUpperCase()),
  idUsuario: text("id_usuario").notNull(),
  nomeProduto: text("nome_produto"),
  marca: text("marca"),
  categoria: text("categoria"),
  keywords: text("keywords"),
  longTailKeywords: text("long_tail_keywords"),
  principaisCaracteristicas: text("principais_caracteristicas"),
  publicoAlvo: text("publico_alvo"),
  reviewsData: text("reviews_data"),
  reviewsInsight: text("reviews_insight"), // Resultado da Etapa 1
  titulos: text("titulos"), // Resultado da Etapa 2
  bulletPoints: text("bullet_points"), // Para futuras etapas
  descricao: text("descricao"), // Para futuras etapas
  providerAI: text("provider_ai"),
  modelAI: text("model_ai"),
  status: text("status").notNull().default("active"), // 'active', 'processing', 'completed', 'aborted'
  currentStep: integer("current_step").notNull().default(0), // 0=inicio, 1=analise, 2=titulos
  dataHoraCreated: timestamp("data_hora_created").notNull().defaultNow(),
  dataHoraUpdated: timestamp("data_hora_updated").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("amazon_listing_sessions_user_idx").on(table.idUsuario),
  statusIdx: index("amazon_listing_sessions_status_idx").on(table.status),
  hashIdx: index("amazon_listing_sessions_hash_idx").on(table.sessionHash),
  createdIdx: index("amazon_listing_sessions_created_idx").on(table.dataHoraCreated),
}));

// Investment ROI Simulations
export const investmentSimulations = pgTable("investment_simulations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull().default("Nova Simulação"),
  initialInvestment: integer("initial_investment").notNull().default(10000),
  cycleDuration: integer("cycle_duration").notNull().default(45), // days
  cycleUnit: text("cycle_unit").notNull().default("Dias"),
  numberOfCycles: integer("number_of_cycles").notNull().default(12),
  cycles: jsonb("cycles").notNull().default([]), // Array of cycle data with ROI, aporte, retirada
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("investment_simulations_user_idx").on(table.userId),
  createdIdx: index("investment_simulations_created_idx").on(table.createdAt),
}));

// Contract schemas
export const contractInsertSchema = createInsertSchema(internationalSupplierContracts);
export const contractSelectSchema = internationalSupplierContracts;

export type InsertContract = z.infer<typeof contractInsertSchema>;
export type SelectContract = typeof internationalSupplierContracts.$inferSelect;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  supplierReviews: many(supplierReviews),
  partnerReviews: many(partnerReviews),
  toolReviews: many(toolReviews),
  materials: many(materials),
  news: many(news),
  updates: many(updates),
  investmentSimulations: many(investmentSimulations),
}));

export const newsRelations = relations(news, ({ one }) => ({
  author: one(users, {
    fields: [news.authorId],
    references: [users.id],
  }),
}));

export const updatesRelations = relations(updates, ({ one }) => ({
  author: one(users, {
    fields: [updates.authorId],
    references: [users.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  suppliers: many(suppliers),
}));

export const partnerTypesRelations = relations(partnerTypes, ({ many }) => ({
  partners: many(partners),
}));

export const suppliersRelations = relations(suppliers, ({ one, many }) => ({
  category: one(categories, {
    fields: [suppliers.categoryId],
    references: [categories.id],
  }),
  contacts: many(supplierContacts),
  files: many(supplierFiles),
  brands: many(supplierBrands),
  reviews: many(supplierReviews),
  conversations: many(supplierConversations),
  products: many(products),
}));

export const supplierContactsRelations = relations(supplierContacts, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierContacts.supplierId],
    references: [suppliers.id],
  }),
}));

export const supplierFilesRelations = relations(supplierFiles, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierFiles.supplierId],
    references: [suppliers.id],
  }),
}));

export const supplierBrandsRelations = relations(supplierBrands, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierBrands.supplierId],
    references: [suppliers.id],
  }),
}));

export const supplierConversationsRelations = relations(supplierConversations, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierConversations.supplierId],
    references: [suppliers.id],
  }),
}));

export const supplierReviewsRelations = relations(supplierReviews, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierReviews.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [supplierReviews.userId],
    references: [users.id],
  }),
}));

export const partnersRelations = relations(partners, ({ one, many }) => ({
  partnerType: one(partnerTypes, {
    fields: [partners.partnerTypeId],
    references: [partnerTypes.id],
  }),
  contacts: many(partnerContacts),
  files: many(partnerFiles),
  materials: many(partnerMaterials),
  reviews: many(partnerReviews),
}));

export const partnerContactsRelations = relations(partnerContacts, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerContacts.partnerId],
    references: [partners.id],
  }),
}));

export const partnerFilesRelations = relations(partnerFiles, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerFiles.partnerId],
    references: [partners.id],
  }),
}));

export const partnerMaterialsRelations = relations(partnerMaterials, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerMaterials.partnerId],
    references: [partners.id],
  }),
}));

export const partnerReviewsRelations = relations(partnerReviews, ({ one, many }) => ({
  partner: one(partners, {
    fields: [partnerReviews.partnerId],
    references: [partners.id],
  }),
  user: one(users, {
    fields: [partnerReviews.userId],
    references: [users.id],
  }),
  replies: many(partnerReviewReplies),
}));

export const partnerReviewRepliesRelations = relations(partnerReviewReplies, ({ one }) => ({
  review: one(partnerReviews, {
    fields: [partnerReviewReplies.reviewId],
    references: [partnerReviews.id],
  }),
  user: one(users, {
    fields: [partnerReviewReplies.userId],
    references: [users.id],
  }),
}));

export const materialTypesRelations = relations(materialTypes, ({ many }) => ({
  materials: many(materials),
}));

export const materialsRelations = relations(materials, ({ one }) => ({
  type: one(materialTypes, {
    fields: [materials.typeId],
    references: [materialTypes.id],
  }),
  uploadedByUser: one(users, {
    fields: [materials.uploadedBy],
    references: [users.id],
  }),
}));

export const toolTypesRelations = relations(toolTypes, ({ many }) => ({
  tools: many(tools),
}));

export const toolsRelations = relations(tools, ({ one, many }) => ({
  type: one(toolTypes, {
    fields: [tools.typeId],
    references: [toolTypes.id],
  }),
  reviews: many(toolReviews),
  discounts: many(toolDiscounts),
  videos: many(toolVideos),
}));

export const toolReviewsRelations = relations(toolReviews, ({ one, many }) => ({
  tool: one(tools, {
    fields: [toolReviews.toolId],
    references: [tools.id],
  }),
  user: one(users, {
    fields: [toolReviews.userId],
    references: [users.id],
  }),
  replies: many(toolReviewReplies),
}));

export const toolReviewRepliesRelations = relations(toolReviewReplies, ({ one }) => ({
  review: one(toolReviews, {
    fields: [toolReviewReplies.reviewId],
    references: [toolReviews.id],
  }),
  user: one(users, {
    fields: [toolReviewReplies.userId],
    references: [users.id],
  }),
}));

export const toolDiscountsRelations = relations(toolDiscounts, ({ one }) => ({
  tool: one(tools, {
    fields: [toolDiscounts.toolId],
    references: [tools.id],
  }),
}));

export const toolVideosRelations = relations(toolVideos, ({ one }) => ({
  tool: one(tools, {
    fields: [toolVideos.toolId],
    references: [tools.id],
  }),
}));

export const templateCategoriesRelations = relations(templateCategories, ({ many }) => ({
  templates: many(templates),
}));

export const templatesRelations = relations(templates, ({ one }) => ({
  category: one(templateCategories, {
    fields: [templates.categoryId],
    references: [templateCategories.id],
  }),
}));

export const promptCategoriesRelations = relations(promptCategories, ({ many }) => ({
  prompts: many(prompts),
}));

export const promptsRelations = relations(prompts, ({ one }) => ({
  category: one(promptCategories, {
    fields: [prompts.categoryId],
    references: [promptCategories.id],
  }),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  user: one(users, {
    fields: [brands.userId],
    references: [users.id],
  }),
  products: many(products),
}));

export const productsRelations = relations(products, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
}));

// Agent relations
export const agentsRelations = relations(agents, ({ many }) => ({
  prompts: many(agentPrompts),
  usage: many(agentUsage),
}));

export const agentPromptsRelations = relations(agentPrompts, ({ one }) => ({
  agent: one(agents, {
    fields: [agentPrompts.agentId],
    references: [agents.id],
  }),
}));

export const agentUsageRelations = relations(agentUsage, ({ one, many }) => ({
  agent: one(agents, {
    fields: [agentUsage.agentId],
    references: [agents.id],
  }),
  generations: many(agentGenerations),
}));

export const agentGenerationsRelations = relations(agentGenerations, ({ one }) => ({
  usage: one(agentUsage, {
    fields: [agentGenerations.usageId],
    references: [agentUsage.id],
  }),
}));

export const agentSessionsRelations = relations(agentSessions, ({ many }) => ({
  files: many(agentSessionFiles),
}));

export const agentSessionFilesRelations = relations(agentSessionFiles, ({ one }) => ({
  session: one(agentSessions, {
    fields: [agentSessionFiles.sessionId],
    references: [agentSessions.id],
  }),
}));

export const amazonListingSessionsRelations = relations(amazonListingSessions, ({ many }) => ({
  // Future relations if needed
}));

export const investmentSimulationsRelations = relations(investmentSimulations, ({ one }) => ({
  user: one(users, {
    fields: [investmentSimulations.userId],
    references: [users.id],
  }),
}));

// Generated Images Storage
export const generatedImages = pgTable("generated_images", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  agentId: text("agent_id"),
  sessionId: text("session_id"),
  model: text("model").notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url").notNull(),
  size: text("size").notNull().default("1024x1024"),
  quality: text("quality").notNull().default("high"),
  format: text("format").notNull().default("png"),
  cost: decimal("cost", { precision: 10, scale: 6 }).notNull().default("0"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  modelIdx: index("generated_images_model_idx").on(table.model),
  createdIdx: index("generated_images_created_idx").on(table.createdAt),
  agentIdx: index("generated_images_agent_idx").on(table.agentId),
}));

// AI Generation Logs
export const aiGenerationLogs = pgTable("ai_generation_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  provider: text("provider").notNull(), // openai, anthropic, etc
  model: text("model").notNull(),
  prompt: text("prompt").notNull(),
  response: text("response").notNull(),
  promptCharacters: integer("prompt_characters").notNull(),
  responseCharacters: integer("response_characters").notNull(),
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  cost: decimal("cost", { precision: 10, scale: 6 }).notNull().default("0"),
  creditsUsed: decimal("credits_used", { precision: 10, scale: 2 }).notNull().default("0"),
  duration: integer("duration").notNull().default(0), // milliseconds
  feature: text("feature").notNull().default("html-description"), // feature that used the AI
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("ai_logs_user_idx").on(table.userId),
  createdIdx: index("ai_logs_created_idx").on(table.createdAt),
  modelIdx: index("ai_logs_model_idx").on(table.model),
  featureIdx: index("ai_logs_feature_idx").on(table.feature),
}));

// Tool Usage Logs
export const toolUsageLogs = pgTable("tool_usage_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  userName: text("user_name").notNull(),
  userEmail: text("user_email").notNull(),
  toolName: text("tool_name").notNull(), // "Extrator de Reviews Amazon", "Relatório de Busca por Keywords", etc
  asin: text("asin"), // For Amazon tools
  keyword: text("keyword"), // For keyword-based tools
  country: text("country"), // For Amazon tools
  additionalData: jsonb("additional_data"), // Flexible data for different tools
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("tool_usage_user_idx").on(table.userId),
  createdIdx: index("tool_usage_created_idx").on(table.createdAt),
  toolIdx: index("tool_usage_tool_idx").on(table.toolName),
  asinIdx: index("tool_usage_asin_idx").on(table.asin),
  keywordIdx: index("tool_usage_keyword_idx").on(table.keyword),
}));

// Upscaled Images table for PixelCut API
export const upscaledImages = pgTable("upscaled_images", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: integer("user_id").references(() => users.id).notNull(),
  originalImageUrl: text("original_image_url").notNull(),
  upscaledImageUrl: text("upscaled_image_url").notNull(),
  scale: integer("scale").notNull(), // 2 or 4
  originalSize: jsonb("original_size").notNull(), // {width, height}
  upscaledSize: jsonb("upscaled_size").notNull(), // {width, height}
  processingTime: integer("processing_time"), // in milliseconds
  cost: decimal("cost", { precision: 10, scale: 6 }).notNull().default("0"),
  status: text("status").notNull().default("completed"), // 'processing', 'completed', 'failed'
  metadata: jsonb("metadata"), // Additional processing info
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("upscaled_images_user_idx").on(table.userId),
  statusIdx: index("upscaled_images_status_idx").on(table.status),
  createdIdx: index("upscaled_images_created_idx").on(table.createdAt),
}));

// Knowledge Base Documents table
export const knowledgeBaseDocs = pgTable("knowledge_base_docs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  filename: text("filename").notNull(),
  originalFilename: text("original_filename").notNull(),
  fileType: text("file_type").notNull(), // pdf, txt, md, docx
  fileSize: integer("file_size").notNull(), // in bytes
  filePath: text("file_path").notNull(), // path to uploaded file
  content: text("content").notNull(), // extracted text content
  summary: text("summary"), // AI-generated summary
  tags: jsonb("tags").default([]), // user-defined tags
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("knowledge_base_docs_user_id_idx").on(table.userId),
  titleIdx: index("knowledge_base_docs_title_idx").on(table.title),
  contentIdx: index("knowledge_base_docs_content_idx").on(table.content),
}));

// Knowledge Base Collections table (organize docs into collections)
export const knowledgeBaseCollections = pgTable("knowledge_base_collections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdIdx: index("knowledge_base_collections_user_id_idx").on(table.userId),
}));

// Junction table for docs and collections
export const knowledgeBaseDocCollections = pgTable("knowledge_base_doc_collections", {
  id: serial("id").primaryKey(),
  docId: integer("doc_id").notNull().references(() => knowledgeBaseDocs.id),
  collectionId: integer("collection_id").notNull().references(() => knowledgeBaseCollections.id),
  addedAt: timestamp("added_at").notNull().defaultNow(),
}, (table) => ({
  uniqueDocCollection: unique().on(table.docId, table.collectionId),
}));

// AI Image Generation Logs - Specialized table for AI image generation tracking
export const aiImgGenerationLogs = pgTable("ai_img_generation_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  provider: text("provider").notNull(), // pixelcut, openai, etc
  model: text("model").notNull(), // specific model/endpoint used
  feature: text("feature").notNull(), // upscale, generate, edit, etc
  originalImageName: text("original_image_name"), // name of uploaded image
  originalImageSize: jsonb("original_image_size"), // {width, height, fileSize}
  generatedImageUrl: text("generated_image_url"), // URL of generated/processed image
  generatedImageSize: jsonb("generated_image_size"), // {width, height, fileSize}
  prompt: text("prompt"), // prompt used (if applicable)
  scale: integer("scale"), // upscale factor (2x, 4x, etc)
  quality: text("quality"), // high, medium, low
  apiResponse: jsonb("api_response"), // full API response for debugging
  status: text("status").notNull().default("success"), // success, failed, timeout
  errorMessage: text("error_message"), // error details if failed
  inputTokens: integer("input_tokens").notNull().default(0),
  outputTokens: integer("output_tokens").notNull().default(0),
  totalTokens: integer("total_tokens").notNull().default(0),
  cost: decimal("cost", { precision: 10, scale: 6 }).notNull().default("0"), // processing cost
  creditsUsed: decimal("credits_used", { precision: 10, scale: 2 }).notNull().default("0"),
  duration: integer("duration").notNull().default(0), // processing time in milliseconds
  requestId: text("request_id"), // unique request identifier
  sessionId: text("session_id"), // user session tracking
  userAgent: text("user_agent"), // browser/client info
  ipAddress: text("ip_address"), // client IP
  metadata: jsonb("metadata"), // additional tracking data
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("ai_img_logs_user_idx").on(table.userId),
  providerIdx: index("ai_img_logs_provider_idx").on(table.provider),
  featureIdx: index("ai_img_logs_feature_idx").on(table.feature),
  statusIdx: index("ai_img_logs_status_idx").on(table.status),
  createdIdx: index("ai_img_logs_created_idx").on(table.createdAt),
  costIdx: index("ai_img_logs_cost_idx").on(table.cost),
}));

// User Plans/Subscriptions
export const userPlans = pgTable("user_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  monthlyPrice: decimal("monthly_price", { precision: 10, scale: 2 }).notNull().default("0"),
  yearlyPrice: decimal("yearly_price", { precision: 10, scale: 2 }).notNull().default("0"),
  credits: integer("credits").notNull().default(0), // Credits included per month
  features: jsonb("features").notNull().default([]), // Array of features
  maxUsers: integer("max_users").notNull().default(1),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Subscriptions
export const userSubscriptions = pgTable("user_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  planId: integer("plan_id").references(() => userPlans.id).notNull(),
  status: text("status").notNull().default("active"), // active, cancelled, expired, suspended
  billingCycle: text("billing_cycle").notNull().default("monthly"), // monthly, yearly
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date"),
  nextBillingDate: timestamp("next_billing_date"),
  cancelledAt: timestamp("cancelled_at"),
  metadata: jsonb("metadata"), // Payment gateway data, etc.
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("user_subscriptions_user_idx").on(table.userId),
  statusIdx: index("user_subscriptions_status_idx").on(table.status),
  nextBillingIdx: index("user_subscriptions_next_billing_idx").on(table.nextBillingDate),
}));

// User Credit Balance
// userCreditBalance table removed - now using users.credits field directly

// Credit Transactions
export const creditTransactions = pgTable("credit_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // purchase, usage, subscription_credit, bonus, refund
  amount: integer("amount").notNull(), // positive for credits added, negative for credits used
  balanceBefore: integer("balance_before").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  description: text("description").notNull(),
  relatedId: text("related_id"), // Reference to related transaction/usage/purchase
  relatedType: text("related_type"), // ai_generation, image_processing, etc.
  metadata: jsonb("metadata"), // Additional transaction data
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("credit_transactions_user_idx").on(table.userId),
  typeIdx: index("credit_transactions_type_idx").on(table.type),
  createdIdx: index("credit_transactions_created_idx").on(table.createdAt),
  relatedIdx: index("credit_transactions_related_idx").on(table.relatedId, table.relatedType),
}));

// Billing History
export const billingHistory = pgTable("billing_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  subscriptionId: integer("subscription_id").references(() => userSubscriptions.id),
  transactionId: text("transaction_id").notNull(), // Payment gateway transaction ID
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("BRL"),
  status: text("status").notNull(), // pending, completed, failed, refunded
  paymentMethod: text("payment_method"), // card, pix, boleto, etc.
  description: text("description").notNull(),
  metadata: jsonb("metadata"), // Payment gateway response, etc.
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("billing_history_user_idx").on(table.userId),
  statusIdx: index("billing_history_status_idx").on(table.status),
  createdIdx: index("billing_history_created_idx").on(table.createdAt),
  transactionIdx: index("billing_history_transaction_idx").on(table.transactionId),
}));

// User Activity Logs for dashboard
export const userActivityLogs = pgTable("user_activity_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  activity: text("activity").notNull(), // login, feature_used, purchase, etc.
  feature: text("feature"), // Specific feature used
  description: text("description").notNull(),
  duration: integer("duration"), // Time spent in milliseconds
  metadata: jsonb("metadata"), // Additional activity data
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("user_activity_user_idx").on(table.userId),
  activityIdx: index("user_activity_activity_idx").on(table.activity),
  featureIdx: index("user_activity_feature_idx").on(table.feature),
  createdIdx: index("user_activity_created_idx").on(table.createdAt),
}));

// =============================================================================
// EXTENDED TABLES FOR CREDITS AND SUBSCRIPTIONS SYSTEM
// =============================================================================

// Feature Costs - Definir custo em créditos de cada funcionalidade
export const featureCosts = pgTable("feature_costs", {
  id: serial("id").primaryKey(),
  featureName: text("feature_name").notNull().unique(),
  costPerUse: integer("cost_per_use").notNull(),
  description: text("description"),
  category: text("category"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  featureNameIdx: index("feature_costs_name_idx").on(table.featureName),
  categoryIdx: index("feature_costs_category_idx").on(table.category),
  activeIdx: index("feature_costs_active_idx").on(table.isActive),
}));

// Subscription Plans - Definir os planos de assinatura disponíveis
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("BRL"),
  creditsIncluded: integer("credits_included").notNull(),
  stripePriceId: text("stripe_price_id").unique(),
  features: jsonb("features"),
  maxUsers: integer("max_users"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  nameIdx: index("subscription_plans_name_idx").on(table.name),
  activeIdx: index("subscription_plans_active_idx").on(table.isActive),
  sortIdx: index("subscription_plans_sort_idx").on(table.sortOrder),
  stripePriceIdx: index("subscription_plans_stripe_price_idx").on(table.stripePriceId),
}));

// Subscriptions - Gerenciar assinaturas dos usuários (Stripe integration)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  stripeCustomerId: text("stripe_customer_id"),
  planId: integer("plan_id").references(() => subscriptionPlans.id).notNull(),
  status: text("status").notNull(), // 'active', 'canceled', 'past_due', 'unpaid', 'trialing'
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  trialEnd: timestamp("trial_end"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("subscriptions_user_idx").on(table.userId),
  statusIdx: index("subscriptions_status_idx").on(table.status),
  stripeSubIdx: index("subscriptions_stripe_sub_idx").on(table.stripeSubscriptionId),
  stripeCustomerIdx: index("subscriptions_stripe_customer_idx").on(table.stripeCustomerId),
  planIdx: index("subscriptions_plan_idx").on(table.planId),
}));

// Credit Packages - Pacotes de créditos avulsos
export const creditPackages = pgTable("credit_packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  creditsAmount: integer("credits_amount").notNull(),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("BRL"),
  stripePriceId: text("stripe_price_id").unique(),
  bonusCredits: integer("bonus_credits").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  nameIdx: index("credit_packages_name_idx").on(table.name),
  activeIdx: index("credit_packages_active_idx").on(table.isActive),
  sortIdx: index("credit_packages_sort_idx").on(table.sortOrder),
  stripePriceIdx: index("credit_packages_stripe_price_idx").on(table.stripePriceId),
}));

// Extended Payment History - Histórico de pagamentos com funcionalidades avançadas
export const extendedPaymentHistory = pgTable("extended_payment_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  stripeInvoiceId: text("stripe_invoice_id"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("BRL"),
  status: text("status").notNull(), // 'succeeded', 'failed', 'pending', 'canceled', 'refunded'
  paymentMethod: text("payment_method"),
  description: text("description"),
  failureReason: text("failure_reason"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("extended_payment_history_user_idx").on(table.userId),
  statusIdx: index("extended_payment_history_status_idx").on(table.status),
  stripePaymentIdx: index("extended_payment_history_stripe_payment_idx").on(table.stripePaymentIntentId),
  stripeInvoiceIdx: index("extended_payment_history_stripe_invoice_idx").on(table.stripeInvoiceId),
  createdIdx: index("extended_payment_history_created_idx").on(table.createdAt),
}));

// Admin Actions - Auditoria de ações administrativas
export const adminActions = pgTable("admin_actions", {
  id: serial("id").primaryKey(),
  adminUserId: integer("admin_user_id").references(() => users.id).notNull(),
  targetUserId: integer("target_user_id").references(() => users.id),
  actionType: text("action_type").notNull(), // 'credit_adjustment', 'user_update', 'permission_change', 'subscription_modify'
  description: text("description").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  adminUserIdx: index("admin_actions_admin_user_idx").on(table.adminUserId),
  targetUserIdx: index("admin_actions_target_user_idx").on(table.targetUserId),
  actionTypeIdx: index("admin_actions_action_type_idx").on(table.actionType),
  createdIdx: index("admin_actions_created_idx").on(table.createdAt),
}));

// Insert schemas for generated images
export const insertGeneratedImageSchema = createInsertSchema(generatedImages);
export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type GeneratedImage = typeof generatedImages.$inferSelect;

// Export Finanças360 tables and types
export * from './schema/financas360';

// Insert schemas for AI image generation logs
export const insertAiImgGenerationLogSchema = createInsertSchema(aiImgGenerationLogs);
export type InsertAiImgGenerationLog = z.infer<typeof insertAiImgGenerationLogSchema>;
export type AiImgGenerationLog = typeof aiImgGenerationLogs.$inferSelect;

// Infographics tables for the new agent system
export const infographics = pgTable("infographics", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: integer("user_id").references(() => users.id).notNull(),
  productName: text("product_name").notNull(),
  productDescription: text("product_description").notNull(),
  category: text("category").notNull(),
  targetAudience: text("target_audience").notNull(),
  effortLevel: text("effort_level").notNull(), // 'normal' or 'high'
  selectedConceptId: text("selected_concept_id"),
  productImageUrl: text("product_image_url"),
  optimizedPrompt: text("optimized_prompt"),
  finalImageUrl: text("final_image_url"),
  status: text("status").notNull().default("created"), // created, concepts_generated, prompt_generated, generating, completed, failed
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("infographics_user_idx").on(table.userId),
  statusIdx: index("infographics_status_idx").on(table.status),
  createdIdx: index("infographics_created_idx").on(table.createdAt),
}));

export const infographicConcepts = pgTable("infographic_concepts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  infographicId: text("infographic_id").references(() => infographics.id).notNull(),
  conceptData: jsonb("concept_data").notNull(),
  recommended: boolean("recommended").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  infographicIdx: index("infographic_concepts_infographic_idx").on(table.infographicId),
  recommendedIdx: index("infographic_concepts_recommended_idx").on(table.recommended),
}));

// Insert schemas for upscaled images
export const insertUpscaledImageSchema = createInsertSchema(upscaledImages).omit({
  id: true,
  createdAt: true,
});
export type InsertUpscaledImage = z.infer<typeof insertUpscaledImageSchema>;
export type UpscaledImage = typeof upscaledImages.$inferSelect;

// Insert schemas for user companies
export const insertUserCompanySchema = createInsertSchema(userCompanies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserCompany = z.infer<typeof insertUserCompanySchema>;
export type UserCompany = typeof userCompanies.$inferSelect;

// Insert schemas for infographics
export const insertInfographicSchema = createInsertSchema(infographics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInfographic = z.infer<typeof insertInfographicSchema>;
export type Infographic = typeof infographics.$inferSelect;

// Insert schemas for infographic concepts
export const insertInfographicConceptSchema = createInsertSchema(infographicConcepts).omit({
  id: true,
  createdAt: true,
});
export type InsertInfographicConcept = z.infer<typeof insertInfographicConceptSchema>;
export type InfographicConcept = typeof infographicConcepts.$inferSelect;

// Insert schemas for brands
export const insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertBrand = z.infer<typeof insertBrandSchema>;
export type Brand = typeof brands.$inferSelect;

// Insert schemas for product suppliers
export const insertProductSupplierSchema = createInsertSchema(productSuppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProductSupplier = z.infer<typeof insertProductSupplierSchema>;
export type ProductSupplier = typeof productSuppliers.$inferSelect;

export const insertSupplierProductSchema = createInsertSchema(supplierProducts).omit({
  id: true,
  productId: true,
  linkStatus: true,
  active: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSupplierProduct = z.infer<typeof insertSupplierProductSchema>;
export type SupplierProduct = typeof supplierProducts.$inferSelect;

// Knowledge Base schemas
export const insertKnowledgeBaseDocSchema = createInsertSchema(knowledgeBaseDocs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeBaseCollectionSchema = createInsertSchema(knowledgeBaseCollections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeBaseDocCollectionSchema = createInsertSchema(knowledgeBaseDocCollections).omit({
  id: true,
  addedAt: true,
});

export type InsertKnowledgeBaseDoc = z.infer<typeof insertKnowledgeBaseDocSchema>;
export type KnowledgeBaseDoc = typeof knowledgeBaseDocs.$inferSelect;

export type InsertKnowledgeBaseCollection = z.infer<typeof insertKnowledgeBaseCollectionSchema>;
export type KnowledgeBaseCollection = typeof knowledgeBaseCollections.$inferSelect;

export type InsertKnowledgeBaseDocCollection = z.infer<typeof insertKnowledgeBaseDocCollectionSchema>;
export type KnowledgeBaseDocCollection = typeof knowledgeBaseDocCollections.$inferSelect;

// Insert schemas for supplier conversations
export const insertSupplierConversationSchema = createInsertSchema(supplierConversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSupplierConversation = z.infer<typeof insertSupplierConversationSchema>;
export type SupplierConversation = typeof supplierConversations.$inferSelect;

// Insert schemas for AI generation logs
export const insertAiGenerationLogSchema = createInsertSchema(aiGenerationLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertAiGenerationLog = z.infer<typeof insertAiGenerationLogSchema>;
export type AiGenerationLog = typeof aiGenerationLogs.$inferSelect;

// Insert schemas for tool usage logs
export const insertToolUsageLogSchema = createInsertSchema(toolUsageLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertToolUsageLog = z.infer<typeof insertToolUsageLogSchema>;
export type ToolUsageLog = typeof toolUsageLogs.$inferSelect;

// Insert schemas for user dashboard tables
export const insertUserPlanSchema = createInsertSchema(userPlans).omit({
  id: true,
  createdAt: true,
});
export type InsertUserPlan = z.infer<typeof insertUserPlanSchema>;
export type UserPlan = typeof userPlans.$inferSelect;

export const insertUserSubscriptionSchema = createInsertSchema(userSubscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserSubscription = z.infer<typeof insertUserSubscriptionSchema>;
export type UserSubscription = typeof userSubscriptions.$inferSelect;

// userCreditBalance schemas removed - now using users.credits field directly

export const insertCreditTransactionSchema = createInsertSchema(creditTransactions).omit({
  id: true,
  createdAt: true,
});
export type InsertCreditTransaction = z.infer<typeof insertCreditTransactionSchema>;
export type CreditTransaction = typeof creditTransactions.$inferSelect;

export const insertBillingHistorySchema = createInsertSchema(billingHistory).omit({
  id: true,
  createdAt: true,
});
export type InsertBillingHistory = z.infer<typeof insertBillingHistorySchema>;
export type BillingHistory = typeof billingHistory.$inferSelect;

export const insertUserActivityLogSchema = createInsertSchema(userActivityLogs).omit({
  id: true,
  createdAt: true,
});
export type InsertUserActivityLog = z.infer<typeof insertUserActivityLogSchema>;
export type UserActivityLog = typeof userActivityLogs.$inferSelect;

// Stripe Products and Prices
export const stripeProducts = pgTable("stripe_products", {
  id: text("id").primaryKey(), // Stripe product ID
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'subscription' or 'credits'
  metadata: jsonb("metadata").default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const stripePrices = pgTable("stripe_prices", {
  id: text("id").primaryKey(), // Stripe price ID
  productId: text("product_id").references(() => stripeProducts.id).notNull(),
  unitAmount: integer("unit_amount").notNull(), // Amount in cents
  currency: text("currency").notNull().default("brl"),
  interval: text("interval"), // 'month', 'year', null for one-time
  intervalCount: integer("interval_count").default(1),
  credits: integer("credits"), // Number of credits for this price
  metadata: jsonb("metadata").default({}),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Stripe Payment Intents
export const stripePaymentIntents = pgTable("stripe_payment_intents", {
  id: text("id").primaryKey(), // Stripe payment intent ID
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: integer("amount").notNull(), // Amount in cents
  currency: text("currency").notNull().default("brl"),
  status: text("status").notNull(),
  clientSecret: text("client_secret"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Stripe Checkout Sessions
export const stripeCheckoutSessions = pgTable("stripe_checkout_sessions", {
  id: text("id").primaryKey(), // Stripe session ID
  userId: integer("user_id").references(() => users.id).notNull(),
  customerId: text("customer_id").notNull(),
  mode: text("mode").notNull(), // 'payment', 'subscription'
  status: text("status").notNull(),
  amountTotal: integer("amount_total"),
  currency: text("currency").notNull().default("brl"),
  successUrl: text("success_url"),
  cancelUrl: text("cancel_url"),
  metadata: jsonb("metadata").default({}),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Stripe Webhook Events
export const stripeWebhookEvents = pgTable("stripe_webhook_events", {
  id: text("id").primaryKey(), // Stripe event ID
  type: text("type").notNull(),
  apiVersion: text("api_version"),
  data: jsonb("data").notNull(),
  processed: boolean("processed").notNull().default(false),
  processingError: text("processing_error"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
}, (table) => ({
  typeIdx: index("stripe_webhook_events_type_idx").on(table.type),
  processedIdx: index("stripe_webhook_events_processed_idx").on(table.processed),
}));

// Packing List Documents
export const packingListDocuments = pgTable("packing_list_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  
  // Document identification
  importNumber: text("import_number").notNull(),
  importYear: text("import_year").notNull(),
  poNumber: text("po_number").notNull(),
  plNumber: text("pl_number").notNull(),
  ciNumber: text("ci_number").notNull(),
  
  // Document metadata
  issueDate: text("issue_date").notNull(),
  status: text("status").notNull().default("draft"), // draft, completed
  
  // Exporter information
  exporterData: jsonb("exporter_data").notNull(), // {name, address, city, country, phone, mobile, fax, email}
  
  // Consignee information (Sold To / Ship To)
  consigneeData: jsonb("consignee_data").notNull(), // {name, address, city, state, cep, cnpj}
  
  // Ordered By information
  orderedByData: jsonb("ordered_by_data").notNull(), // {name, address, city, state, cep, cnpj}
  
  // Document details
  portOfShipment: text("port_of_shipment"),
  portOfDischarge: text("port_of_discharge"),
  countryOfOrigin: text("country_of_origin"),
  countryOfAcquisition: text("country_of_acquisition"),
  countryOfProcedure: text("country_of_procedure"),
  manufacturerInfo: text("manufacturer_info"),
  
  // Items data - Sistema dual: unitários + multi-itens
  unitaryItems: jsonb("unitary_items").notNull().default([]), // Array de itens unitários (sistema atual)
  multiBoxContainers: jsonb("multi_box_containers").notNull().default([]), // Array de caixas multi-itens (novo sistema)
  
  // Compatibilidade com sistema antigo
  items: jsonb("items").notNull().default([]), // Array of item objects (deprecated, usar unitaryItems)
  
  // Creation tracking
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("packing_list_docs_user_idx").on(table.userId),
  importIdx: index("packing_list_docs_import_idx").on(table.importNumber, table.importYear),
  statusIdx: index("packing_list_docs_status_idx").on(table.status),
}));

// Insert schemas for Stripe tables
export const insertStripeProductSchema = createInsertSchema(stripeProducts).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertStripeProduct = z.infer<typeof insertStripeProductSchema>;
export type StripeProduct = typeof stripeProducts.$inferSelect;

export const insertStripePriceSchema = createInsertSchema(stripePrices).omit({
  createdAt: true,
});
export type InsertStripePrice = z.infer<typeof insertStripePriceSchema>;
export type StripePrice = typeof stripePrices.$inferSelect;

export const insertStripePaymentIntentSchema = createInsertSchema(stripePaymentIntents).omit({
  createdAt: true,
  updatedAt: true,
});
export type InsertStripePaymentIntent = z.infer<typeof insertStripePaymentIntentSchema>;
export type StripePaymentIntent = typeof stripePaymentIntents.$inferSelect;

export const insertStripeCheckoutSessionSchema = createInsertSchema(stripeCheckoutSessions).omit({
  createdAt: true,
});
export type InsertStripeCheckoutSession = z.infer<typeof insertStripeCheckoutSessionSchema>;
export type StripeCheckoutSession = typeof stripeCheckoutSessions.$inferSelect;

export const insertStripeWebhookEventSchema = createInsertSchema(stripeWebhookEvents).omit({
  createdAt: true,
});
export type InsertStripeWebhookEvent = z.infer<typeof insertStripeWebhookEventSchema>;
export type StripeWebhookEvent = typeof stripeWebhookEvents.$inferSelect;

// Insert schemas (moved to end of file to avoid conflicts)

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertDepartmentSchema = createInsertSchema(departments).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  averageRating: true,
  totalReviews: true,
});

export const insertSupplierContactSchema = createInsertSchema(supplierContacts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierBrandSchema = createInsertSchema(supplierBrands).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplierFileSchema = createInsertSchema(supplierFiles).omit({
  id: true,
  uploadedAt: true,
});

export const insertPartnerSchema = createInsertSchema(partners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  averageRating: true,
  totalReviews: true,
});

export const insertMaterialSchema = createInsertSchema(materials).omit({
  id: true,
  uploadDate: true,
  lastModified: true,
  downloadCount: true,
  viewCount: true,
});

export const insertToolSchema = createInsertSchema(tools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  averageRating: true,
  totalReviews: true,
});

export const insertTemplateSchema = createInsertSchema(templates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromptSchema = createInsertSchema(prompts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertToolReviewSchema = createInsertSchema(toolReviews).omit({
  id: true,
  createdAt: true,
});

export const insertToolReviewReplySchema = createInsertSchema(toolReviewReplies).omit({
  id: true,
  createdAt: true,
});

export const insertToolDiscountSchema = createInsertSchema(toolDiscounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPartnerReviewSchema = createInsertSchema(partnerReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isApproved: true,
});

export const insertPartnerReviewReplySchema = createInsertSchema(partnerReviewReplies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertYoutubeVideoSchema = createInsertSchema(youtubeVideos).omit({
  id: true,
  createdAt: true,
});

export const insertNewsSchema = createInsertSchema(news).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  publishedAt: z.union([z.date(), z.string(), z.null()]).optional().transform((val) => {
    if (!val) return null;
    if (typeof val === 'string') return new Date(val);
    return val;
  }),
});

export const insertUpdateSchema = createInsertSchema(updates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});



export const insertTemplateCategorySchema = createInsertSchema(templateCategories).omit({
  id: true,
  createdAt: true,
});

export const insertPromptCategorySchema = createInsertSchema(promptCategories).omit({
  id: true,
  createdAt: true,
});

export const insertToolTypeSchema = createInsertSchema(toolTypes).omit({
  id: true,
  createdAt: true,
});

export const insertMaterialTypeSchema = createInsertSchema(materialTypes).omit({
  id: true,
  createdAt: true,
});

export const insertMaterialCategorySchema = createInsertSchema(materialCategories).omit({
  id: true,
  createdAt: true,
});

// Agent schemas
export const insertAgentSchema = createInsertSchema(agents).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertAgentPromptSchema = createInsertSchema(agentPrompts).omit({
  createdAt: true,
});

export const insertAgentUsageSchema = createInsertSchema(agentUsage).omit({
  createdAt: true,
});

export const insertAgentGenerationSchema = createInsertSchema(agentGenerations).omit({
  createdAt: true,
});

export const insertPartnerTypeSchema = createInsertSchema(partnerTypes).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerContactSchema = createInsertSchema(partnerContacts).omit({
  id: true,
  createdAt: true,
});

export const insertPartnerFileSchema = createInsertSchema(partnerFiles).omit({
  id: true,
  createdAt: true,
});

export const insertToolVideoSchema = createInsertSchema(toolVideos).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Department = typeof departments.$inferSelect;

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertSupplierContact = z.infer<typeof insertSupplierContactSchema>;
export type SupplierContact = typeof supplierContacts.$inferSelect;

export type InsertSupplierBrand = z.infer<typeof insertSupplierBrandSchema>;
export type SupplierBrand = typeof supplierBrands.$inferSelect;

export type InsertSupplierFile = z.infer<typeof insertSupplierFileSchema>;
export type SupplierFile = typeof supplierFiles.$inferSelect;

export type InsertPartner = z.infer<typeof insertPartnerSchema>;
export type Partner = typeof partners.$inferSelect;

export type InsertMaterial = z.infer<typeof insertMaterialSchema>;
export type Material = typeof materials.$inferSelect;

export type MaterialWithType = Material & {
  type: MaterialType;
};

export type InsertTool = z.infer<typeof insertToolSchema>;
export type Tool = typeof tools.$inferSelect;

export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type Template = typeof templates.$inferSelect;

export type InsertPrompt = z.infer<typeof insertPromptSchema>;
export type Prompt = typeof prompts.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertProductCostHistory = typeof productCostHistory.$inferInsert;
export type ProductCostHistory = typeof productCostHistory.$inferSelect;

export type InsertYoutubeVideo = z.infer<typeof insertYoutubeVideoSchema>;
export type YoutubeVideo = typeof youtubeVideos.$inferSelect;

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type Update = typeof updates.$inferSelect;



export type InsertTemplateCategory = z.infer<typeof insertTemplateCategorySchema>;
export type TemplateCategory = typeof templateCategories.$inferSelect;

export type InsertPromptCategory = z.infer<typeof insertPromptCategorySchema>;
export type PromptCategory = typeof promptCategories.$inferSelect;

export type InsertToolType = z.infer<typeof insertToolTypeSchema>;
export type ToolType = typeof toolTypes.$inferSelect;

export type InsertMaterialType = z.infer<typeof insertMaterialTypeSchema>;
export type MaterialType = typeof materialTypes.$inferSelect;

export type InsertMaterialCategory = z.infer<typeof insertMaterialCategorySchema>;
export type MaterialCategory = typeof materialCategories.$inferSelect;

export type InsertPartnerType = z.infer<typeof insertPartnerTypeSchema>;
export type PartnerType = typeof partnerTypes.$inferSelect;

export type InsertPartnerContact = z.infer<typeof insertPartnerContactSchema>;
export type PartnerContact = typeof partnerContacts.$inferSelect;

export type InsertPartnerFile = z.infer<typeof insertPartnerFileSchema>;
export type PartnerFile = typeof partnerFiles.$inferSelect;

export type InsertPartnerReview = z.infer<typeof insertPartnerReviewSchema>;
export type PartnerReview = typeof partnerReviews.$inferSelect;

export type InsertPartnerReviewReply = z.infer<typeof insertPartnerReviewReplySchema>;
export type PartnerReviewReply = typeof partnerReviewReplies.$inferSelect;

export type InsertToolReview = z.infer<typeof insertToolReviewSchema>;
export type ToolReview = typeof toolReviews.$inferSelect;

export type InsertToolReviewReply = z.infer<typeof insertToolReviewReplySchema>;
export type ToolReviewReply = typeof toolReviewReplies.$inferSelect;

export type InsertToolDiscount = z.infer<typeof insertToolDiscountSchema>;
export type ToolDiscount = typeof toolDiscounts.$inferSelect;

export type PartnerReviewWithUser = PartnerReview & {
  user: User;
  replies: (PartnerReviewReply & { user: User })[];
};

export type ToolReviewWithUser = ToolReview & {
  user: User;
  replies: (ToolReviewReply & { user: User })[];
};

export type InsertToolVideo = z.infer<typeof insertToolVideoSchema>;
export type ToolVideo = typeof toolVideos.$inferSelect;

// Agent types
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertAgentPrompt = z.infer<typeof insertAgentPromptSchema>;
export type AgentPrompt = typeof agentPrompts.$inferSelect;

export type InsertAgentUsage = z.infer<typeof insertAgentUsageSchema>;
export type AgentUsage = typeof agentUsage.$inferSelect;

export type InsertAgentGeneration = z.infer<typeof insertAgentGenerationSchema>;
export type AgentGeneration = typeof agentGenerations.$inferSelect;

// Amazon Listing Session schemas
export const insertAmazonListingSessionSchema = createInsertSchema(amazonListingSessions).omit({
  id: true,
  sessionHash: true,
  dataHoraCreated: true,
  dataHoraUpdated: true,
});

export type InsertAmazonListingSession = z.infer<typeof insertAmazonListingSessionSchema>;
export type AmazonListingSession = typeof amazonListingSessions.$inferSelect;

// Insert schemas for investment simulations
export const insertInvestmentSimulationSchema = createInsertSchema(investmentSimulations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertInvestmentSimulation = z.infer<typeof insertInvestmentSimulationSchema>;
export type InvestmentSimulation = typeof investmentSimulations.$inferSelect;

// Agent with prompts type
export type AgentWithPrompts = Agent & {
  prompts: AgentPrompt[];
};

// Agent usage with generations type
export type AgentUsageWithGenerations = AgentUsage & {
  generations: AgentGeneration[];
};

// Agent session types
export const insertAgentSessionSchema = createInsertSchema(agentSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAgentSessionFileSchema = createInsertSchema(agentSessionFiles).omit({
  id: true,
  uploadedAt: true,
});

export type InsertAgentSession = z.infer<typeof insertAgentSessionSchema>;
export type AgentSession = typeof agentSessions.$inferSelect;
export type InsertAgentSessionFile = z.infer<typeof insertAgentSessionFileSchema>;
export type AgentSessionFile = typeof agentSessionFiles.$inferSelect;

// Agent session with files type
export type AgentSessionWithFiles = AgentSession & {
  files: AgentSessionFile[];
};

// Auth schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastLogin: true,
  resetToken: true,
  resetTokenExpiry: true,
});

export const insertUserGroupSchema = createInsertSchema(userGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserGroupMemberSchema = createInsertSchema(userGroupMembers).omit({
  id: true,
  addedAt: true,
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({
  id: true,
  createdAt: true,
});

// Auth types
export type InsertUserGroup = z.infer<typeof insertUserGroupSchema>;
export type UserGroup = typeof userGroups.$inferSelect;

export type InsertUserGroupMember = z.infer<typeof insertUserGroupMemberSchema>;
export type UserGroupMember = typeof userGroupMembers.$inferSelect;

export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;

// User with groups type
export type UserWithGroups = User & {
  groups: (UserGroupMember & { group: UserGroup })[];
};

// Support Tickets table
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull().default("general"), // general, technical, billing, feature_request
  priority: text("priority").notNull().default("medium"), // low, medium, high, urgent
  status: text("status").notNull().default("open"), // open, in_progress, waiting_customer, resolved, closed
  assignedToUserId: integer("assigned_to_user_id").references(() => users.id),
  tags: text("tags").array().default([]),
  metadata: jsonb("metadata").default({}),
  adminNotes: text("admin_notes"), // Private notes only visible to admins
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
  closedAt: timestamp("closed_at"),
});

// Support Ticket Messages table
export const supportTicketMessages = pgTable("support_ticket_messages", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  isStaffReply: boolean("is_staff_reply").notNull().default(false),
  attachments: jsonb("attachments").default([]), // array of file objects
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Support Ticket Files table
export const supportTicketFiles = pgTable("support_ticket_files", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").references(() => supportTickets.id).notNull(),
  messageId: integer("message_id").references(() => supportTicketMessages.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(),
  fileType: text("file_type").notNull(),
  uploadedByUserId: integer("uploaded_by_user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Support Categories table
export const supportCategories = pgTable("support_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  color: text("color").notNull().default("#6b7280"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations for support tables
export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  assignedTo: one(users, {
    fields: [supportTickets.assignedToUserId],
    references: [users.id],
  }),
  messages: many(supportTicketMessages),
  files: many(supportTicketFiles),
}));

export const supportTicketMessagesRelations = relations(supportTicketMessages, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [supportTicketMessages.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [supportTicketMessages.userId],
    references: [users.id],
  }),
}));

export const supportTicketFilesRelations = relations(supportTicketFiles, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [supportTicketFiles.ticketId],
    references: [supportTickets.id],
  }),
  message: one(supportTicketMessages, {
    fields: [supportTicketFiles.messageId],
    references: [supportTicketMessages.id],
  }),
  uploadedBy: one(users, {
    fields: [supportTicketFiles.uploadedByUserId],
    references: [users.id],
  }),
}));

export const supportCategoriesRelations = relations(supportCategories, ({ many }) => ({
  tickets: many(supportTickets),
}));

// Support schemas
export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
  closedAt: true,
});

export const insertSupportTicketMessageSchema = createInsertSchema(supportTicketMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupportTicketFileSchema = createInsertSchema(supportTicketFiles).omit({
  id: true,
  createdAt: true,
});

export const insertSupportCategorySchema = createInsertSchema(supportCategories).omit({
  id: true,
  createdAt: true,
});

// Support types
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;

export type InsertSupportTicketMessage = z.infer<typeof insertSupportTicketMessageSchema>;
export type SupportTicketMessage = typeof supportTicketMessages.$inferSelect;

export type InsertSupportTicketFile = z.infer<typeof insertSupportTicketFileSchema>;
export type SupportTicketFile = typeof supportTicketFiles.$inferSelect;

export type InsertSupportCategory = z.infer<typeof insertSupportCategorySchema>;
export type SupportCategory = typeof supportCategories.$inferSelect;

// Support ticket with relations type
export type SupportTicketWithRelations = SupportTicket & {
  user: User;
  assignedTo?: User;
  messages: (SupportTicketMessage & { user: User })[];
  files: (SupportTicketFile & { uploadedBy: User })[];
};

// Infographics relations
export const infographicsRelations = relations(infographics, ({ one, many }) => ({
  user: one(users, {
    fields: [infographics.userId],
    references: [users.id],
  }),
  concepts: many(infographicConcepts),
}));

export const infographicConceptsRelations = relations(infographicConcepts, ({ one }) => ({
  infographic: one(infographics, {
    fields: [infographicConcepts.infographicId],
    references: [infographics.id],
  }),
}));

// ========================================
// PICSART INTEGRATION SYSTEM TABLES
// ========================================

// Picsart Processing Sessions - Sistema de processamento de imagens
export const picsartSessions = pgTable("picsart_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: integer("user_id").references(() => users.id).notNull(),
  tool: text("tool").notNull(), // 'background_removal', 'image_enhance', 'ai_art', etc.
  status: text("status").notNull().default("processing"), // 'processing', 'completed', 'failed'
  originalImageUrl: text("original_image_url").notNull(),
  originalFileName: text("original_file_name").notNull(),
  processedImageUrl: text("processed_image_url"),
  picsartJobId: text("picsart_job_id"),
  parameters: jsonb("parameters").notNull().default({}), // Tool-specific parameters
  cost: decimal("cost", { precision: 10, scale: 6 }).notNull().default("0"),
  creditsUsed: decimal("credits_used", { precision: 10, scale: 2 }).notNull().default("0"),
  duration: integer("duration").default(0), // Processing time in milliseconds
  errorMessage: text("error_message"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("picsart_sessions_user_idx").on(table.userId),
  toolIdx: index("picsart_sessions_tool_idx").on(table.tool),
  statusIdx: index("picsart_sessions_status_idx").on(table.status),
  createdIdx: index("picsart_sessions_created_idx").on(table.createdAt),
}));

// Picsart Tool Configurations - Configurações dos diferentes tools
export const picsartToolConfigs = pgTable("picsart_tool_configs", {
  id: serial("id").primaryKey(),
  toolName: text("tool_name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  endpoint: text("endpoint").notNull(),
  defaultParameters: jsonb("default_parameters").notNull().default({}),
  costPerUse: decimal("cost_per_use", { precision: 10, scale: 2 }).notNull().default("0"),
  isActive: boolean("is_active").notNull().default(true),
  category: text("category").notNull().default("image_editing"), // 'image_editing', 'ai_art', 'enhancement'
  supportedFormats: text("supported_formats").array().default(["PNG", "JPG", "JPEG"]),
  maxFileSize: integer("max_file_size").notNull().default(10485760), // 10MB in bytes
  processingTime: integer("avg_processing_time").default(5000), // Average time in milliseconds
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  toolNameIdx: index("picsart_tool_configs_tool_name_idx").on(table.toolName),
  categoryIdx: index("picsart_tool_configs_category_idx").on(table.category),
  activeIdx: index("picsart_tool_configs_active_idx").on(table.isActive),
}));

// Relations for Picsart tables
export const picsartSessionsRelations = relations(picsartSessions, ({ one }) => ({
  user: one(users, {
    fields: [picsartSessions.userId],
    references: [users.id],
  }),
}));

export const picsartToolConfigsRelations = relations(picsartToolConfigs, ({ many }) => ({
  sessions: many(picsartSessions),
}));

// Picsart schemas
export const insertPicsartSessionSchema = createInsertSchema(picsartSessions).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertPicsartToolConfigSchema = createInsertSchema(picsartToolConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Picsart types
export type InsertPicsartSession = z.infer<typeof insertPicsartSessionSchema>;
export type PicsartSession = typeof picsartSessions.$inferSelect;

export type InsertPicsartToolConfig = z.infer<typeof insertPicsartToolConfigSchema>;
export type PicsartToolConfig = typeof picsartToolConfigs.$inferSelect;

export type PicsartSessionWithUser = PicsartSession & {
  user: User;
};

// ========================================
// ADVANCED FUNCTIONALITIES TABLES
// ========================================

// Coupons Table - Sistema de Cupons e Descontos
export const coupons = pgTable("coupons", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // 'percentage', 'fixed_amount', 'trial_extension'
  value: decimal("value", { precision: 10, scale: 2 }).notNull(), // Percentage or amount
  minPurchaseAmount: decimal("min_purchase_amount", { precision: 10, scale: 2 }),
  maxUses: integer("max_uses"),
  currentUses: integer("current_uses").notNull().default(0),
  usedByUserId: integer("used_by_user_id").array(), // Track which users used it
  validFrom: timestamp("valid_from").notNull().defaultNow(),
  validTo: timestamp("valid_to").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdBy: integer("created_by").references(() => users.id).notNull(),
  metadata: jsonb("metadata"), // Additional coupon data
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  codeIdx: index("coupons_code_idx").on(table.code),
  typeIdx: index("coupons_type_idx").on(table.type),
  validIdx: index("coupons_valid_idx").on(table.validFrom, table.validTo),
  activeIdx: index("coupons_active_idx").on(table.isActive),
}));

// User Trials Table - Sistema de Trial Gratuito
export const userTrials = pgTable("user_trials", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  planId: integer("plan_id").references(() => userPlans.id).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  originalEndDate: timestamp("original_end_date").notNull(), // Track original vs extended end
  status: text("status").notNull().default("active"), // 'active', 'expired', 'converted', 'cancelled'
  creditsUsed: integer("credits_used").notNull().default(0),
  creditsLimit: integer("credits_limit").notNull().default(100),
  remindersSent: integer("reminders_sent").notNull().default(0),
  convertedAt: timestamp("converted_at"),
  conversionDetails: jsonb("conversion_details"),
  couponCode: text("coupon_code"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("user_trials_user_idx").on(table.userId),
  statusIdx: index("user_trials_status_idx").on(table.status),
  endDateIdx: index("user_trials_end_date_idx").on(table.endDate),
  convertedIdx: index("user_trials_converted_idx").on(table.convertedAt),
}));

// Abandoned Carts Table temporarily commented out due to migration conflict
// Will be re-added after imported products system is complete

// Conversion Events Table - Analytics de Conversão
export const conversionEvents = pgTable("conversion_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  sessionId: text("session_id"),
  eventType: text("event_type").notNull(), // 'page_view', 'signup', 'trial_start', 'checkout_start', 'payment_success', etc.
  eventData: jsonb("event_data"),
  url: text("url"),
  referer: text("referer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
  metadata: jsonb("metadata"),
}, (table) => ({
  userIdx: index("conversion_events_user_idx").on(table.userId),
  sessionIdx: index("conversion_events_session_idx").on(table.sessionId),
  eventTypeIdx: index("conversion_events_event_type_idx").on(table.eventType),
  timestampIdx: index("conversion_events_timestamp_idx").on(table.timestamp),
  urlIdx: index("conversion_events_url_idx").on(table.url),
}));

// Insert schemas for new tables
export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCoupon = z.infer<typeof insertCouponSchema>;
export type Coupon = typeof coupons.$inferSelect;

export const insertUserTrialSchema = createInsertSchema(userTrials).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertUserTrial = z.infer<typeof insertUserTrialSchema>;
export type UserTrial = typeof userTrials.$inferSelect;

// AbandonedCart schema temporarily removed due to migration conflict

export const insertConversionEventSchema = createInsertSchema(conversionEvents);
export type InsertConversionEvent = z.infer<typeof insertConversionEventSchema>;
export type ConversionEvent = typeof conversionEvents.$inferSelect;

// Security Tables
export const fraudAlerts = pgTable("fraud_alerts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  riskScore: integer("risk_score").notNull(),
  flags: jsonb("flags").notNull().default([]), // Array of fraud flags
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  reviewerId: integer("reviewer_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("fraud_alerts_user_idx").on(table.userId),
  statusIdx: index("fraud_alerts_status_idx").on(table.status),
  riskScoreIdx: index("fraud_alerts_risk_score_idx").on(table.riskScore),
  createdIdx: index("fraud_alerts_created_idx").on(table.createdAt),
}));

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: text("action").notNull(),
  resource: text("resource").notNull(),
  resourceId: text("resource_id"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent").notNull(),
  metadata: jsonb("metadata"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("audit_logs_user_idx").on(table.userId),
  actionIdx: index("audit_logs_action_idx").on(table.action),
  resourceIdx: index("audit_logs_resource_idx").on(table.resource),
  timestampIdx: index("audit_logs_timestamp_idx").on(table.timestamp),
}));

export const paymentHistory = pgTable("payment_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull().default("brl"),
  status: text("status").notNull(), // succeeded, failed, canceled, processing
  paymentMethod: text("payment_method"),
  description: text("description"),
  metadata: jsonb("metadata"),
  failureReason: text("failure_reason"),
  riskScore: integer("risk_score"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("payment_history_user_idx").on(table.userId),
  statusIdx: index("payment_history_status_idx").on(table.status),
  stripeIdx: index("payment_history_stripe_idx").on(table.stripePaymentIntentId),
  createdIdx: index("payment_history_created_idx").on(table.createdAt),
}));

// Security schemas and types
export const insertFraudAlertSchema = createInsertSchema(fraudAlerts).omit({
  id: true,
  createdAt: true,
});
export type InsertFraudAlert = z.infer<typeof insertFraudAlertSchema>;
export type FraudAlert = typeof fraudAlerts.$inferSelect;

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export const insertPaymentHistorySchema = createInsertSchema(paymentHistory).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPaymentHistory = z.infer<typeof insertPaymentHistorySchema>;
export type PaymentHistory = typeof paymentHistory.$inferSelect;

// Relations for new tables
export const couponsRelations = relations(coupons, ({ one }) => ({
  createdBy: one(users, {
    fields: [coupons.createdBy],
    references: [users.id],
  }),
}));

export const userTrialsRelations = relations(userTrials, ({ one }) => ({
  user: one(users, {
    fields: [userTrials.userId],
    references: [users.id],
  }),
  plan: one(userPlans, {
    fields: [userTrials.planId],
    references: [userPlans.id],
  }),
}));

// AbandonedCarts relations temporarily removed due to migration conflict

export const conversionEventsRelations = relations(conversionEvents, ({ one }) => ({
  user: one(users, {
    fields: [conversionEvents.userId],
    references: [users.id],
  }),
}));

// Security relations
export const fraudAlertsRelations = relations(fraudAlerts, ({ one }) => ({
  user: one(users, {
    fields: [fraudAlerts.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [fraudAlerts.reviewerId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

export const paymentHistoryRelations = relations(paymentHistory, ({ one }) => ({
  user: one(users, {
    fields: [paymentHistory.userId],
    references: [users.id],
  }),
}));

// Extended tables schemas and types
export const insertFeatureCostSchema = createInsertSchema(featureCosts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertFeatureCost = z.infer<typeof insertFeatureCostSchema>;
export type FeatureCost = typeof featureCosts.$inferSelect;

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;

export const insertCreditPackageSchema = createInsertSchema(creditPackages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertCreditPackage = z.infer<typeof insertCreditPackageSchema>;
export type CreditPackage = typeof creditPackages.$inferSelect;

export const insertExtendedPaymentHistorySchema = createInsertSchema(extendedPaymentHistory).omit({
  id: true,
  createdAt: true,
});
export type InsertExtendedPaymentHistory = z.infer<typeof insertExtendedPaymentHistorySchema>;
export type ExtendedPaymentHistory = typeof extendedPaymentHistory.$inferSelect;

export const insertAdminActionSchema = createInsertSchema(adminActions).omit({
  id: true,
  createdAt: true,
});
export type InsertAdminAction = z.infer<typeof insertAdminActionSchema>;
export type AdminAction = typeof adminActions.$inferSelect;

// Extended tables relations
export const featureCostsRelations = relations(featureCosts, ({ many }) => ({
  // Feature costs don't need direct relations, used by reference
}));

export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(subscriptionPlans, {
    fields: [subscriptions.planId],
    references: [subscriptionPlans.id],
  }),
}));

export const creditPackagesRelations = relations(creditPackages, ({ many }) => ({
  // Credit packages don't need direct relations, used by reference
}));

export const adminActionsRelations = relations(adminActions, ({ one }) => ({
  adminUser: one(users, {
    fields: [adminActions.adminUserId],
    references: [users.id],
  }),
  targetUser: one(users, {
    fields: [adminActions.targetUserId],
    references: [users.id],
  }),
}));

// Permission System Tables
export const permissionGroups = pgTable("permission_groups", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // gratuito, pagantes, alunos, mentorados, admin
  name: text("name").notNull().unique(), // Gratuito, Pagantes, Alunos, Mentorados, Admin
  description: text("description"),
  priority: integer("priority").notNull().default(0), // Higher priority = more permissions
  isActive: boolean("is_active").notNull().default(true),
  isSystem: boolean("is_system").notNull().default(false), // System groups cannot be deleted
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  codeIdx: index("permission_groups_code_idx").on(table.code),
  nameIdx: index("permission_groups_name_idx").on(table.name),
  priorityIdx: index("permission_groups_priority_idx").on(table.priority),
  activeIdx: index("permission_groups_active_idx").on(table.isActive),
}));

export const systemFeatures = pgTable("system_features", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g., 'ai.upscale', 'agents.amazon_listing'
  name: text("name").notNull(),
  category: text("category").notNull(), // AI, Agentes, Hub de Recursos, etc
  parentCode: text("parent_code"), // For nested features
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  codeIdx: index("system_features_code_idx").on(table.code),
  categoryIdx: index("system_features_category_idx").on(table.category),
  parentIdx: index("system_features_parent_idx").on(table.parentCode),
  activeIdx: index("system_features_active_idx").on(table.isActive),
}));

export const groupPermissions = pgTable("group_permissions", {
  id: serial("id").primaryKey(),
  groupId: integer("group_id").references(() => permissionGroups.id).notNull(),
  featureId: integer("feature_id").references(() => systemFeatures.id).notNull(),
  hasAccess: boolean("has_access").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  groupFeatureIdx: unique("group_permissions_unique").on(table.groupId, table.featureId),
  groupIdx: index("group_permissions_group_idx").on(table.groupId),
  featureIdx: index("group_permissions_feature_idx").on(table.featureId),
}));

export const userPermissionGroups = pgTable("user_permission_groups", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  groupId: integer("group_id").references(() => permissionGroups.id).notNull(),
  assignedAt: timestamp("assigned_at").notNull().defaultNow(),
  assignedBy: integer("assigned_by").references(() => users.id),
}, (table) => ({
  userIdx: index("user_permission_groups_user_idx").on(table.userId),
  groupIdx: index("user_permission_groups_group_idx").on(table.groupId),
}));

// Import Cost Simulations
export const importSimulations = pgTable("import_simulations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  nomeSimulacao: text("nome_simulacao").notNull(),
  codigoSimulacao: text("codigo_simulacao").notNull(), // Código único de 8 caracteres alfanuméricos
  nomeFornecedor: text("nome_fornecedor"),
  observacoes: text("observacoes"),
  dataCreated: timestamp("data_criacao").notNull().defaultNow(),
  dataLastModified: timestamp("data_ultima_modificacao").notNull().defaultNow(),
  configuracoesGerais: jsonb("configuracoes_gerais").notNull(), // JSON with all general settings
  produtos: jsonb("produtos").notNull(), // JSON array with all products
}, (table) => ({
  userIdx: index("import_simulations_user_idx").on(table.userId),
  codigoIdx: index("import_simulations_codigo_idx").on(table.codigoSimulacao),
}));

// Formal Import Simulations (CBM-based cost allocation)
export const formalImportSimulations = pgTable("formal_import_simulations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  nome: text("nome").notNull(),
  dataCriacao: timestamp("data_criacao").notNull().defaultNow(),
  dataModificacao: timestamp("data_modificacao").notNull().defaultNow(),
  fornecedor: text("fornecedor"),
  despachante: text("despachante"),
  agenteCargas: text("agente_cargas"),
  status: text("status").notNull().default("Em andamento"), // Em andamento, Finalizada, etc.
  
  // Seção 1: Informações Iniciais
  taxaDolar: decimal("taxa_dolar", { precision: 10, scale: 4 }).notNull(),
  valorFobDolar: decimal("valor_fob_dolar", { precision: 15, scale: 2 }).notNull(),
  valorFreteDolar: decimal("valor_frete_dolar", { precision: 15, scale: 2 }).notNull(),
  
  // Seção 2: Seguro
  percentualSeguro: decimal("percentual_seguro", { precision: 5, scale: 2 }).notNull().default("0.5"),
  
  // Seção 3: Impostos de Nacionalização
  impostos: jsonb("impostos").notNull(), // Array of tax objects
  
  // Seção 4: Despesas Adicionais
  despesasAdicionais: jsonb("despesas_adicionais").notNull(), // Array of additional expenses
  
  // Seção 5: Produtos
  produtos: jsonb("produtos").notNull(), // Array of products with CBM calculations
  
  // Seção 6 e 7: Resultados e Total da Importação (calculated fields)
  resultados: jsonb("resultados").notNull(), // Summary results object
  
  codigoSimulacao: text("codigo_simulacao").notNull().unique(), // Código único de 8 caracteres alfanuméricos
}, (table) => ({
  userIdx: index("formal_import_simulations_user_idx").on(table.userId),
  codigoIdx: index("formal_import_simulations_codigo_idx").on(table.codigoSimulacao),
  statusIdx: index("formal_import_simulations_status_idx").on(table.status),
  dataModificacaoIdx: index("formal_import_simulations_data_modificacao_idx").on(table.dataModificacao),
}));



// Permission System Types
export const insertPermissionGroupSchema = createInsertSchema(permissionGroups).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPermissionGroup = z.infer<typeof insertPermissionGroupSchema>;
export type PermissionGroup = typeof permissionGroups.$inferSelect;

export const insertSystemFeatureSchema = createInsertSchema(systemFeatures).omit({
  id: true,
  createdAt: true,
});
export type InsertSystemFeature = z.infer<typeof insertSystemFeatureSchema>;
export type SystemFeature = typeof systemFeatures.$inferSelect;

export const insertGroupPermissionSchema = createInsertSchema(groupPermissions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertGroupPermission = z.infer<typeof insertGroupPermissionSchema>;
export type GroupPermission = typeof groupPermissions.$inferSelect;

export const insertUserPermissionGroupSchema = createInsertSchema(userPermissionGroups).omit({
  id: true,
  assignedAt: true,
});
export type InsertUserPermissionGroup = z.infer<typeof insertUserPermissionGroupSchema>;
export type UserPermissionGroup = typeof userPermissionGroups.$inferSelect;

// Permission System Relations
export const permissionGroupsRelations = relations(permissionGroups, ({ many }) => ({
  permissions: many(groupPermissions),
  users: many(userPermissionGroups),
}));

export const systemFeaturesRelations = relations(systemFeatures, ({ many, one }) => ({
  permissions: many(groupPermissions),
  parent: one(systemFeatures, {
    fields: [systemFeatures.parentCode],
    references: [systemFeatures.code],
  }),
}));

export const groupPermissionsRelations = relations(groupPermissions, ({ one }) => ({
  group: one(permissionGroups, {
    fields: [groupPermissions.groupId],
    references: [permissionGroups.id],
  }),
  feature: one(systemFeatures, {
    fields: [groupPermissions.featureId],
    references: [systemFeatures.id],
  }),
}));

export const userPermissionGroupsRelations = relations(userPermissionGroups, ({ one }) => ({
  user: one(users, {
    fields: [userPermissionGroups.userId],
    references: [users.id],
  }),
  group: one(permissionGroups, {
    fields: [userPermissionGroups.groupId],
    references: [permissionGroups.id],
  }),
  assignedByUser: one(users, {
    fields: [userPermissionGroups.assignedBy],
    references: [users.id],
  }),
}));

// Import Simulations Types
export const insertImportSimulationSchema = createInsertSchema(importSimulations).omit({
  id: true,
  codigoSimulacao: true,
  dataCreated: true,
  dataLastModified: true,
});
export type InsertImportSimulation = z.infer<typeof insertImportSimulationSchema>;
export type ImportSimulation = typeof importSimulations.$inferSelect;

// Import Simulations Relations
export const importSimulationsRelations = relations(importSimulations, ({ one }) => ({
  user: one(users, {
    fields: [importSimulations.userId],
    references: [users.id],
  }),
}));

// Formal Import Simulations Types
export const insertFormalImportSimulationSchema = createInsertSchema(formalImportSimulations).omit({
  id: true,
  codigoSimulacao: true,
  dataCriacao: true,
  dataModificacao: true,
});
export type InsertFormalImportSimulation = z.infer<typeof insertFormalImportSimulationSchema>;
export type FormalImportSimulation = typeof formalImportSimulations.$inferSelect;

// Formal Import Simulations Relations
export const formalImportSimulationsRelations = relations(formalImportSimulations, ({ one }) => ({
  user: one(users, {
    fields: [formalImportSimulations.userId],
    references: [users.id],
  }),
}));



// Simples Nacional Simulations
export const simplesNacionalSimulations = pgTable("simples_nacional_simulations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  nomeSimulacao: text("nome_simulacao").notNull(),
  codigoSimulacao: text("codigo_simulacao").notNull(),
  observacoes: text("observacoes"),
  faturamento12Meses: decimal("faturamento_12_meses", { precision: 15, scale: 2 }).notNull(),
  faturamentoSemST: decimal("faturamento_sem_st", { precision: 15, scale: 2 }).notNull(),
  faturamentoComST: decimal("faturamento_com_st", { precision: 15, scale: 2 }).notNull(),
  faturamentoTotal: decimal("faturamento_total", { precision: 15, scale: 2 }).notNull(),
  aliquotaBase: decimal("aliquota_base", { precision: 8, scale: 6 }).notNull(),
  valorReduzir: decimal("valor_reduzir", { precision: 15, scale: 2 }).notNull(),
  aliquotaEfetiva: decimal("aliquota_efetiva", { precision: 8, scale: 6 }).notNull(),
  percentualICMS: decimal("percentual_icms", { precision: 8, scale: 6 }).notNull(),
  valorSimplesSemST: decimal("valor_simples_sem_st", { precision: 15, scale: 2 }).notNull(),
  valorSimplesComST: decimal("valor_simples_com_st", { precision: 15, scale: 2 }).notNull(),
  valorTotalSimples: decimal("valor_total_simples", { precision: 15, scale: 2 }).notNull(),
  dataCreated: timestamp("data_criacao").notNull().defaultNow(),
  dataLastModified: timestamp("data_ultima_modificacao").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("simples_nacional_simulations_user_idx").on(table.userId),
  codigoIdx: index("simples_nacional_simulations_codigo_idx").on(table.codigoSimulacao),
}));

export const insertSimplesNacionalSimulationSchema = createInsertSchema(simplesNacionalSimulations).omit({
  id: true,
  codigoSimulacao: true,
  dataCreated: true,
  dataLastModified: true,
});
export type InsertSimplesNacionalSimulation = z.infer<typeof insertSimplesNacionalSimulationSchema>;
export type SimplesNacionalSimulation = typeof simplesNacionalSimulations.$inferSelect;

// =============================================================================
// SUPPLIER CRM SYSTEM - COMPLETE IMPORT MANAGEMENT TABLES
// =============================================================================

// Supplier Contracts - Different types of contracts
export const supplierContracts = pgTable("supplier_contracts", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Contract Details
  contractNumber: text("contract_number").notNull(),
  contractType: text("contract_type").notNull(), // exclusive, non_exclusive, framework, oem, distribution
  title: text("title").notNull(),
  description: text("description"),
  
  // Dates and Status
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  renewalDate: timestamp("renewal_date"),
  status: text("status").notNull().default("active"), // active, expired, cancelled, suspended, draft
  
  // Terms
  currency: text("currency").notNull().default("USD"),
  paymentTerms: text("payment_terms"), // Net 30, prepaid, L/C, etc.
  incoterms: text("incoterms"), // FOB, CIF, EXW, etc.
  minimumOrder: decimal("minimum_order", { precision: 15, scale: 2 }),
  maximumOrder: decimal("maximum_order", { precision: 15, scale: 2 }),
  
  // Documents
  fileUrl: text("file_url"), // Uploaded contract file
  signedFileUrl: text("signed_file_url"), // Signed contract
  
  // Additional Terms
  exclusivityRegions: jsonb("exclusivity_regions"), // Array of regions if exclusive
  productCategories: jsonb("product_categories"), // Array of product categories covered
  
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  supplierIdx: index("supplier_contracts_supplier_idx").on(table.supplierId),
  userIdx: index("supplier_contracts_user_idx").on(table.userId),
  statusIdx: index("supplier_contracts_status_idx").on(table.status),
  renewalIdx: index("supplier_contracts_renewal_idx").on(table.renewalDate),
  typeIdx: index("supplier_contracts_type_idx").on(table.contractType),
}));

// Supplier Banking - International transfer information
export const supplierBanking = pgTable("supplier_banking", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Bank Information
  bankName: text("bank_name").notNull(),
  bankAddress: text("bank_address"),
  swiftCode: text("swift_code"), // SWIFT/BIC code for international transfers
  iban: text("iban"), // International Bank Account Number
  accountNumber: text("account_number").notNull(),
  accountName: text("account_name").notNull(), // Beneficiary name
  
  // Routing Information
  routingNumber: text("routing_number"), // For US banks
  sortCode: text("sort_code"), // For UK banks
  
  // Intermediary Bank (if required)
  intermediaryBankName: text("intermediary_bank_name"),
  intermediarySwiftCode: text("intermediary_swift_code"),
  
  // Additional Details
  currency: text("currency").notNull().default("USD"),
  accountType: text("account_type").notNull().default("business"), // business, personal
  isPrimary: boolean("is_primary").notNull().default(false),
  
  // Wire Transfer Information
  wireInstructions: text("wire_instructions"), // Special instructions
  
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  supplierIdx: index("supplier_banking_supplier_idx").on(table.supplierId),
  userIdx: index("supplier_banking_user_idx").on(table.userId),
  primaryIdx: index("supplier_banking_primary_idx").on(table.supplierId, table.isPrimary),
  activeIdx: index("supplier_banking_active_idx").on(table.isActive),
}));

// Supplier Commercial Terms - Payment and commercial conditions
export const supplierTerms = pgTable("supplier_terms", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Payment Terms
  paymentMethod: text("payment_method").notNull().default("wire_transfer"), // wire_transfer, letter_of_credit, tt, paypal, etc.
  paymentTerms: text("payment_terms").notNull().default("net_30"), // prepaid, net_30, net_60, 30_70, etc.
  currency: text("currency").notNull().default("USD"),
  
  // Order Terms
  minimumOrderQty: integer("minimum_order_qty"),
  minimumOrderValue: decimal("minimum_order_value", { precision: 15, scale: 2 }),
  leadTime: integer("lead_time"), // Days
  productionTime: integer("production_time"), // Days
  
  // Shipping Terms
  incoterms: text("incoterms").notNull().default("FOB"), // FOB, CIF, EXW, FCA, etc.
  shippingPort: text("shipping_port"),
  packagingRequirements: text("packaging_requirements"),
  
  // Discounts and Pricing
  volumeDiscounts: jsonb("volume_discounts"), // Array of {qty: number, discount: percentage}
  seasonalPricing: jsonb("seasonal_pricing"), // Special pricing periods
  priceValidityDays: integer("price_validity_days").notNull().default(30),
  
  // Quality and Compliance
  qualityStandards: text("quality_standards"), // ISO, CE, FDA, etc.
  inspectionRequirements: text("inspection_requirements"),
  warrantyTerms: text("warranty_terms"),
  
  // Additional Terms
  returnPolicy: text("return_policy"),
  cancellationPolicy: text("cancellation_policy"),
  
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  supplierIdx: index("supplier_terms_supplier_idx").on(table.supplierId),
  userIdx: index("supplier_terms_user_idx").on(table.userId),
  activeIdx: index("supplier_terms_active_idx").on(table.isActive),
}));

// Supplier Documents - Certificates and compliance documents
export const supplierDocuments = pgTable("supplier_documents", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Document Information
  title: text("title").notNull(),
  documentType: text("document_type").notNull(), // certificate, license, insurance, tax, audit, compliance
  category: text("category").notNull(), // quality, legal, financial, operational, compliance
  
  // File Information
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"), // bytes
  mimeType: text("mime_type"),
  
  // Validity
  issueDate: timestamp("issue_date"),
  expiryDate: timestamp("expiry_date"),
  issuingAuthority: text("issuing_authority"),
  
  // Status and Alerts
  status: text("status").notNull().default("valid"), // valid, expired, pending_renewal, under_review
  alertDaysBefore: integer("alert_days_before").notNull().default(30), // Days before expiry to alert
  
  // Additional Info
  documentNumber: text("document_number"),
  description: text("description"),
  tags: jsonb("tags"), // Array of tags for categorization
  
  isRequired: boolean("is_required").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  supplierIdx: index("supplier_documents_supplier_idx").on(table.supplierId),
  userIdx: index("supplier_documents_user_idx").on(table.userId),
  typeIdx: index("supplier_documents_type_idx").on(table.documentType),
  statusIdx: index("supplier_documents_status_idx").on(table.status),
  expiryIdx: index("supplier_documents_expiry_idx").on(table.expiryDate),
  activeIdx: index("supplier_documents_active_idx").on(table.isActive),
}));

// Supplier Communications - Timeline of messages and notes
export const supplierCommunications = pgTable("supplier_communications", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  contactId: integer("contact_id").references(() => supplierContacts.id),
  
  // Communication Details
  type: text("type").notNull(), // email, phone, meeting, note, whatsapp, wechat, internal_note
  direction: text("direction").notNull(), // inbound, outbound, internal
  subject: text("subject"),
  content: text("content").notNull(),
  
  // Metadata
  communicationDate: timestamp("communication_date").notNull().defaultNow(),
  method: text("method"), // email, phone, in_person, video_call, chat
  priority: text("priority").notNull().default("normal"), // low, normal, high, urgent
  
  // Status and Follow-up
  status: text("status").notNull().default("completed"), // pending, completed, requires_follow_up
  followUpDate: timestamp("follow_up_date"),
  isFollowedUp: boolean("is_followed_up").notNull().default(false),
  
  // Attachments and References
  attachments: jsonb("attachments"), // Array of file URLs
  relatedOrderId: text("related_order_id"), // Reference to order if related
  
  // Classification
  tags: jsonb("tags"), // Array of tags
  category: text("category"), // pricing, quality, shipping, general, complaint, etc.
  
  notes: text("notes"), // Internal notes about the communication
  createdBy: integer("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  supplierIdx: index("supplier_communications_supplier_idx").on(table.supplierId),
  userIdx: index("supplier_communications_user_idx").on(table.userId),
  contactIdx: index("supplier_communications_contact_idx").on(table.contactId),
  typeIdx: index("supplier_communications_type_idx").on(table.type),
  dateIdx: index("supplier_communications_date_idx").on(table.communicationDate),
  statusIdx: index("supplier_communications_status_idx").on(table.status),
  followUpIdx: index("supplier_communications_followup_idx").on(table.followUpDate),
  createdByIdx: index("supplier_communications_created_by_idx").on(table.createdBy),
}));

// Supplier Performance - KPIs and evaluation metrics
export const supplierPerformance = pgTable("supplier_performance", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id, { onDelete: "cascade" }).notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  
  // Evaluation Period
  evaluationPeriod: text("evaluation_period").notNull(), // Q1_2025, monthly_2025_01, yearly_2025
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  
  // Quality Metrics
  qualityScore: decimal("quality_score", { precision: 5, scale: 2 }), // 0-100
  defectRate: decimal("defect_rate", { precision: 8, scale: 4 }), // Percentage
  returnRate: decimal("return_rate", { precision: 8, scale: 4 }), // Percentage
  
  // Delivery Metrics
  onTimeDeliveryRate: decimal("on_time_delivery_rate", { precision: 8, scale: 4 }), // Percentage
  averageLeadTime: integer("average_lead_time"), // Days
  deliveryAccuracy: decimal("delivery_accuracy", { precision: 8, scale: 4 }), // Percentage
  
  // Communication Metrics
  responseTime: decimal("response_time", { precision: 10, scale: 2 }), // Hours
  communicationRating: decimal("communication_rating", { precision: 5, scale: 2 }), // 0-10
  
  // Financial Metrics
  totalOrderValue: decimal("total_order_value", { precision: 15, scale: 2 }),
  averageOrderValue: decimal("average_order_value", { precision: 15, scale: 2 }),
  paymentTermsCompliance: decimal("payment_terms_compliance", { precision: 8, scale: 4 }), // Percentage
  
  // Order Statistics
  totalOrders: integer("total_orders").notNull().default(0),
  completedOrders: integer("completed_orders").notNull().default(0),
  cancelledOrders: integer("cancelled_orders").notNull().default(0),
  
  // Overall Rating
  overallRating: decimal("overall_rating", { precision: 5, scale: 2 }), // 0-10
  ratingCategory: text("rating_category"), // excellent, good, average, poor, unacceptable
  
  // Comments and Actions
  comments: text("comments"),
  improvementActions: jsonb("improvement_actions"), // Array of action items
  strengths: jsonb("strengths"), // Array of strengths
  weaknesses: jsonb("weaknesses"), // Array of areas for improvement
  
  // Review Status
  reviewStatus: text("review_status").notNull().default("draft"), // draft, completed, approved
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  supplierIdx: index("supplier_performance_supplier_idx").on(table.supplierId),
  userIdx: index("supplier_performance_user_idx").on(table.userId),
  periodIdx: index("supplier_performance_period_idx").on(table.evaluationPeriod),
  ratingIdx: index("supplier_performance_rating_idx").on(table.overallRating),
  statusIdx: index("supplier_performance_status_idx").on(table.reviewStatus),
}));

// Simples Nacional Simulations Relations
export const simplesNacionalSimulationsRelations = relations(simplesNacionalSimulations, ({ one }) => ({
  user: one(users, {
    fields: [simplesNacionalSimulations.userId],
    references: [users.id],
  }),
}));

// Supplier CRM Relations

export const supplierContractsRelations = relations(supplierContracts, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierContracts.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [supplierContracts.userId],
    references: [users.id],
  }),
}));

export const supplierBankingRelations = relations(supplierBanking, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierBanking.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [supplierBanking.userId],
    references: [users.id],
  }),
}));

export const supplierTermsRelations = relations(supplierTerms, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierTerms.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [supplierTerms.userId],
    references: [users.id],
  }),
}));

export const supplierDocumentsRelations = relations(supplierDocuments, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierDocuments.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [supplierDocuments.userId],
    references: [users.id],
  }),
}));

export const supplierCommunicationsRelations = relations(supplierCommunications, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierCommunications.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [supplierCommunications.userId],
    references: [users.id],
  }),
  // contact: one(supplierContacts, { // Commented out until we enhance existing supplierContacts table
  //   fields: [supplierCommunications.contactId],
  //   references: [supplierContacts.id],
  // }),
  createdByUser: one(users, {
    fields: [supplierCommunications.createdBy],
    references: [users.id],
  }),
}));

export const supplierPerformanceRelations = relations(supplierPerformance, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [supplierPerformance.supplierId],
    references: [suppliers.id],
  }),
  user: one(users, {
    fields: [supplierPerformance.userId],
    references: [users.id],
  }),
  reviewedByUser: one(users, {
    fields: [supplierPerformance.reviewedBy],
    references: [users.id],
  }),
}));

// Insert Schemas for new CRM tables

export const insertSupplierContractSchema = createInsertSchema(supplierContracts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSupplierContract = z.infer<typeof insertSupplierContractSchema>;
export type SupplierContract = typeof supplierContracts.$inferSelect;

export const insertSupplierBankingSchema = createInsertSchema(supplierBanking).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSupplierBanking = z.infer<typeof insertSupplierBankingSchema>;
export type SupplierBanking = typeof supplierBanking.$inferSelect;

export const insertSupplierTermsSchema = createInsertSchema(supplierTerms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSupplierTerms = z.infer<typeof insertSupplierTermsSchema>;
export type SupplierTerms = typeof supplierTerms.$inferSelect;

export const insertSupplierDocumentSchema = createInsertSchema(supplierDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSupplierDocument = z.infer<typeof insertSupplierDocumentSchema>;
export type SupplierDocument = typeof supplierDocuments.$inferSelect;

export const insertSupplierCommunicationSchema = createInsertSchema(supplierCommunications).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSupplierCommunication = z.infer<typeof insertSupplierCommunicationSchema>;
export type SupplierCommunication = typeof supplierCommunications.$inferSelect;

export const insertSupplierPerformanceSchema = createInsertSchema(supplierPerformance).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertSupplierPerformance = z.infer<typeof insertSupplierPerformanceSchema>;
export type SupplierPerformance = typeof supplierPerformance.$inferSelect;

// =============================================================================
// IMPORTED PRODUCTS MANAGEMENT SYSTEM
// =============================================================================

// Imported Products - Main table for products being imported
export const importedProducts = pgTable("imported_products", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  internalCode: text("internal_code").notNull(),
  status: text("status").notNull().default("research"), // research, analysis, negotiation, ordered, shipped, arrived, cancelled
  description: text("description"),
  detailedDescription: text("detailed_description"),
  category: text("category"),
  brand: text("brand"),
  model: text("model"),
  reference: text("reference"), // Referência
  color: text("color"),
  size: text("size"), // Tamanho
  variation1: text("variation1"), // Variação 1 (campo livre)
  variation2: text("variation2"), // Variação 2 (campo livre)
  material: text("material"),
  technicalSpecifications: text("technical_specifications"),
  hasMultiplePackages: boolean("has_multiple_packages").notNull().default(false),
  totalPackages: integer("total_packages").notNull().default(1),
  hsCode: text("hs_code"), // NCM/HS Code
  ncmCode: text("ncm_code"), // NCM específico
  ipiPercentage: decimal("ipi_percentage", { precision: 5, scale: 2 }),
  productEan: text("product_ean"),
  productUpc: text("product_upc"),
  internalBarcode: text("internal_barcode"),
  customsDescription: text("customs_description"),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  supplierProductCode: text("supplier_product_code"),
  supplierProductName: text("supplier_product_name"),
  supplierDescription: text("supplier_description"),
  moq: integer("moq"), // Minimum Order Quantity
  leadTimeDays: integer("lead_time_days"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("imported_products_user_idx").on(table.userId),
  statusIdx: index("imported_products_status_idx").on(table.status),
  supplierIdx: index("imported_products_supplier_idx").on(table.supplierId),
  nameIdx: index("imported_products_name_idx").on(table.name),
  codeIdx: index("imported_products_code_idx").on(table.internalCode),
  createdIdx: index("imported_products_created_idx").on(table.createdAt),
}));

// Product Packages - System for managing multiple packaging of a product
export const productPackages = pgTable("product_packages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").references(() => importedProducts.id).notNull(),
  packageNumber: integer("package_number").notNull(),
  packageType: text("package_type").notNull(), // caixa, saco, pallet, etc.
  contentsDescription: text("contents_description"),
  packageEan: text("package_ean"),
  dimensionsLength: decimal("dimensions_length", { precision: 10, scale: 2 }), // Comprimento em cm
  dimensionsWidth: decimal("dimensions_width", { precision: 10, scale: 2 }), // Largura em cm
  dimensionsHeight: decimal("dimensions_height", { precision: 10, scale: 2 }), // Altura em cm
  weightGross: decimal("weight_gross", { precision: 10, scale: 3 }), // Peso bruto em kg
  weightNet: decimal("weight_net", { precision: 10, scale: 3 }), // Peso líquido em kg
  volumeCbm: decimal("volume_cbm", { precision: 10, scale: 4 }), // Volume em m³
  unitsInPackage: integer("units_in_package").notNull().default(1),
  packagingMaterial: text("packaging_material"),
  specialHandling: text("special_handling"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  productIdx: index("product_packages_product_idx").on(table.productId),
  packageNumIdx: index("product_packages_number_idx").on(table.packageNumber),
}));

// Product Files - Storage for images, documents and certificates
export const productFiles = pgTable("product_files", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").references(() => importedProducts.id).notNull(),
  fileType: text("file_type").notNull(), // image, document, certificate, manual, other
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(), // bytes
  description: text("description"),
  isMainImage: boolean("is_main_image").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
}, (table) => ({
  productIdx: index("product_files_product_idx").on(table.productId),
  typeIdx: index("product_files_type_idx").on(table.fileType),
  mainImageIdx: index("product_files_main_image_idx").on(table.isMainImage),
}));

// Product Notes - System for annotations and important notes
export const productNotes = pgTable("product_notes", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").references(() => importedProducts.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isImportant: boolean("is_important").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  productIdx: index("product_notes_product_idx").on(table.productId),
  importantIdx: index("product_notes_important_idx").on(table.isImportant),
  createdIdx: index("product_notes_created_idx").on(table.createdAt),
}));

// Product Images - System for managing product photos with ordering
export const productImages = pgTable("product_images", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").references(() => importedProducts.id).notNull(),
  filename: text("filename").notNull(),
  originalName: text("original_name").notNull(),
  url: text("url").notNull(),
  position: integer("position").notNull().default(1),
  size: integer("size").notNull(), // File size in bytes
  mimeType: text("mime_type").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  productIdx: index("product_images_product_idx").on(table.productId),
  positionIdx: index("product_images_position_idx").on(table.productId, table.position),
  createdIdx: index("product_images_created_idx").on(table.createdAt),
}));

// Relations for Imported Products System
export const importedProductsRelations = relations(importedProducts, ({ one, many }) => ({
  user: one(users, {
    fields: [importedProducts.userId],
    references: [users.id],
  }),
  supplier: one(suppliers, {
    fields: [importedProducts.supplierId],
    references: [suppliers.id],
  }),
  packages: many(productPackages),
  files: many(productFiles),
  notes: many(productNotes),
  images: many(productImages),
  productSuppliers: many(importedProductSuppliers),
}));

export const productPackagesRelations = relations(productPackages, ({ one }) => ({
  product: one(importedProducts, {
    fields: [productPackages.productId],
    references: [importedProducts.id],
  }),
}));

export const productFilesRelations = relations(productFiles, ({ one }) => ({
  product: one(importedProducts, {
    fields: [productFiles.productId],
    references: [importedProducts.id],
  }),
}));

export const productNotesRelations = relations(productNotes, ({ one }) => ({
  product: one(importedProducts, {
    fields: [productNotes.productId],
    references: [importedProducts.id],
  }),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(importedProducts, {
    fields: [productImages.productId],
    references: [importedProducts.id],
  }),
}));



// Insert Schemas for Imported Products System
export const insertImportedProductSchema = createInsertSchema(importedProducts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertImportedProduct = z.infer<typeof insertImportedProductSchema>;
export type ImportedProduct = typeof importedProducts.$inferSelect;

export const insertProductPackageSchema = createInsertSchema(productPackages).omit({
  id: true,
  createdAt: true,
});
export type InsertProductPackage = z.infer<typeof insertProductPackageSchema>;
export type ProductPackage = typeof productPackages.$inferSelect;

export const insertProductFileSchema = createInsertSchema(productFiles).omit({
  id: true,
  uploadedAt: true,
});
export type InsertProductFile = z.infer<typeof insertProductFileSchema>;
export type ProductFile = typeof productFiles.$inferSelect;

export const insertProductNoteSchema = createInsertSchema(productNotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProductNote = z.infer<typeof insertProductNoteSchema>;
export type ProductNote = typeof productNotes.$inferSelect;

export const insertProductImageSchema = createInsertSchema(productImages).omit({
  id: true,
  createdAt: true,
});
export type InsertProductImage = z.infer<typeof insertProductImageSchema>;
export type ProductImage = typeof productImages.$inferSelect;

// Imported Product Suppliers - Sistema para múltiplos fornecedores por produto importado
export const importedProductSuppliers = pgTable("imported_product_suppliers", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id").references(() => importedProducts.id).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  supplierProductCode: text("supplier_product_code"), // Código do Produto no Fornecedor
  supplierProductName: text("supplier_product_name"), // Nome do Produto no Fornecedor
  moq: integer("moq"), // MOQ (Quantidade Mínima)
  leadTimeDays: integer("lead_time_days"), // Lead Time (dias)
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  productIdx: index("imported_product_suppliers_product_idx").on(table.productId),
  supplierIdx: index("imported_product_suppliers_supplier_idx").on(table.supplierId),
  uniqueProductSupplier: unique().on(table.productId, table.supplierId),
}));

export const insertImportedProductSupplierSchema = createInsertSchema(importedProductSuppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertImportedProductSupplier = z.infer<typeof insertImportedProductSupplierSchema>;
export type ImportedProductSupplier = typeof importedProductSuppliers.$inferSelect;

export const importedProductSuppliersRelations = relations(importedProductSuppliers, ({ one }) => ({
  product: one(importedProducts, {
    fields: [importedProductSuppliers.productId],
    references: [importedProducts.id],
  }),
  supplier: one(suppliers, {
    fields: [importedProductSuppliers.supplierId],
    references: [suppliers.id],
  }),
}));

// Packing List Documents Relations
export const packingListDocumentsRelations = relations(packingListDocuments, ({ one }) => ({
  user: one(users, {
    fields: [packingListDocuments.userId],
    references: [users.id],
  }),
}));

// Insert Schemas for Packing List Documents
export const insertPackingListDocumentSchema = createInsertSchema(packingListDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertPackingListDocument = z.infer<typeof insertPackingListDocumentSchema>;
export type PackingListDocument = typeof packingListDocuments.$inferSelect;