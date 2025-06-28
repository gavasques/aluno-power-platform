import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, index } from "drizzle-orm/pg-core";
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
  role: text("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'supplier', 'material', etc. (NOT partner)
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

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
  tradeName: text("trade_name").notNull(),
  corporateName: text("corporate_name").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Supplier Contacts
export const supplierContacts = pgTable("supplier_contacts", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  type: text("type").notNull(), // 'phone', 'email', 'whatsapp', 'website'
  value: text("value").notNull(),
  extension: text("extension"), // Campo de ramal
  label: text("label"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Supplier Files
export const supplierFiles = pgTable("supplier_files", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
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
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
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

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  photo: text("photo"),
  sku: text("sku"),
  internalCode: text("internal_code"),
  ean: text("ean"),
  dimensions: jsonb("dimensions"), // {length, width, height}
  weight: decimal("weight", { precision: 10, scale: 3 }),
  brand: text("brand"),
  category: text("category"),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  ncm: text("ncm"),
  costItem: decimal("cost_item", { precision: 10, scale: 2 }),
  packCost: decimal("pack_cost", { precision: 10, scale: 2 }),
  taxPercent: decimal("tax_percent", { precision: 5, scale: 2 }),
  observations: text("observations"),
  descriptions: jsonb("descriptions"), // {description, htmlDescription, bulletPoints, technicalSpecs}
  channels: jsonb("channels"), // Channel configuration object
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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

// Webhook configurations
export const webhookConfigs = pgTable("webhook_configs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  secret: text("secret"),
  isActive: boolean("is_active").notNull().default(true),
  type: text("type").notNull(), // 'news', 'updates'
  lastUsed: timestamp("last_used"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  supplierReviews: many(supplierReviews),
  partnerReviews: many(partnerReviews),
  toolReviews: many(toolReviews),
  materials: many(materials),
  news: many(news),
  updates: many(updates),
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

export const productsRelations = relations(products, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
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

// Insert schemas for generated images
export const insertGeneratedImageSchema = createInsertSchema(generatedImages);
export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type GeneratedImage = typeof generatedImages.$inferSelect;

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  name: true,
  role: true,
});

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

export const insertWebhookConfigSchema = createInsertSchema(webhookConfigs).omit({
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

export type InsertYoutubeVideo = z.infer<typeof insertYoutubeVideoSchema>;
export type YoutubeVideo = typeof youtubeVideos.$inferSelect;

export type InsertNews = z.infer<typeof insertNewsSchema>;
export type News = typeof news.$inferSelect;

export type InsertUpdate = z.infer<typeof insertUpdateSchema>;
export type Update = typeof updates.$inferSelect;

export type InsertWebhookConfig = z.infer<typeof insertWebhookConfigSchema>;
export type WebhookConfig = typeof webhookConfigs.$inferSelect;

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

// Agent with prompts type
export type AgentWithPrompts = Agent & {
  prompts: AgentPrompt[];
};

// Agent usage with generations type
export type AgentUsageWithGenerations = AgentUsage & {
  generations: AgentGeneration[];
};
