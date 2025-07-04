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
  role: text("role").notNull().default("user"), // admin, support, user
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  resetToken: text("reset_token"),
  resetTokenExpiry: timestamp("reset_token_expiry"),
  magicLinkToken: text("magic_link_token"),
  magicLinkExpiresAt: timestamp("magic_link_expires_at"),
  emailVerified: boolean("email_verified").notNull().default(false),
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
  userId: integer("user_id").notNull(),
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
  
  // Additional supplier information
  cnpj: text("cnpj"),
  country: text("country").default("Brasil"),
  state: text("state"),
  city: text("city"),
  cep: text("cep"),
  address: text("address"),
  stateRegistration: text("state_registration"),
  municipalRegistration: text("municipal_registration"),
  supplierType: text("supplier_type"), // 'distribuidora', 'importadora', 'fabricante', 'industria', 'representante'
  
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

// ===== SISTEMA DE GESTÃO DE PRODUTOS =====

// Produtos do usuário para gestão e simulação de preços
export const userProducts = pgTable("user_products", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  image: text("image"),
  ean: text("ean"),
  length: decimal("length", { precision: 8, scale: 2 }), // cm
  width: decimal("width", { precision: 8, scale: 2 }),   // cm
  height: decimal("height", { precision: 8, scale: 2 }), // cm
  weight: decimal("weight", { precision: 8, scale: 3 }), // kg
  brand: text("brand"),
  categoryId: integer("category_id").references(() => departments.id),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  ncm: text("ncm"),
  baseCost: decimal("base_cost", { precision: 10, scale: 2 }).notNull(),
  packagingCost: decimal("packaging_cost", { precision: 10, scale: 2 }).default("0"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("user_products_user_idx").on(table.userId),
  categoryIdx: index("user_products_category_idx").on(table.categoryId),
  supplierIdx: index("user_products_supplier_idx").on(table.supplierId),
  activeIdx: index("user_products_active_idx").on(table.isActive),
}));

// Configurações de canais por produto
export const productChannels = pgTable("product_channels", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => userProducts.id, { onDelete: "cascade" }).notNull(),
  channelType: text("channel_type").notNull(), // 'amazon_fba', 'amazon_fbm', 'amazon_dba', 'mercadolivre_me1', 'mercadolivre_flex', 'site_proprio'
  isActive: boolean("is_active").default(true),
  salePrice: decimal("sale_price", { precision: 10, scale: 2 }).default("0"),
  customCosts: jsonb("custom_costs"), // Custos específicos do canal
  lastCalculation: jsonb("last_calculation"), // Cache do último cálculo
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  productIdx: index("product_channels_product_idx").on(table.productId),
  channelIdx: index("product_channels_channel_idx").on(table.channelType),
  activeIdx: index("product_channels_active_idx").on(table.isActive),
}));

// Configurações de preços do usuário
export const userPricingSettings = pgTable("user_pricing_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique().notNull(),
  state: text("state").notNull(), // SP, RJ, etc.
  taxPercentage: decimal("tax_percentage", { precision: 5, scale: 2 }).default("0"),
  activeChannels: jsonb("active_channels"), // Lista de canais que o usuário usa
  adSpendPercentage: decimal("ad_spend_percentage", { precision: 5, scale: 2 }).default("10"), // % gasto em anúncios
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => ({
  userIdx: index("user_pricing_settings_user_idx").on(table.userId),
}));

// Tabelas de frete Amazon por estado (admin)
export const amazonFreightRates = pgTable("amazon_freight_rates", {
  id: serial("id").primaryKey(),
  state: text("state").notNull(), // SP, RJ, etc.
  serviceType: text("service_type").notNull(), // 'fba', 'fbm', 'dba'
  weightFrom: decimal("weight_from", { precision: 8, scale: 3 }).notNull(),
  weightTo: decimal("weight_to", { precision: 8, scale: 3 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  stateServiceIdx: index("amazon_freight_state_service_idx").on(table.state, table.serviceType),
  weightIdx: index("amazon_freight_weight_idx").on(table.weightFrom, table.weightTo),
  activeIdx: index("amazon_freight_active_idx").on(table.isActive),
}));

// Comissões por categoria e canal (admin)
export const categoryCommissions = pgTable("category_commissions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").references(() => departments.id).notNull(),
  channelType: text("channel_type").notNull(), // 'amazon', 'mercadolivre', 'site_proprio'
  priceFrom: decimal("price_from", { precision: 10, scale: 2 }).default("0"),
  priceTo: decimal("price_to", { precision: 10, scale: 2 }),
  commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  categoryChannelIdx: index("category_commissions_cat_channel_idx").on(table.categoryId, table.channelType),
  priceRangeIdx: index("category_commissions_price_range_idx").on(table.priceFrom, table.priceTo),
  activeIdx: index("category_commissions_active_idx").on(table.isActive),
}));

// Estados brasileiros para frete
export const brazilStates = pgTable("brazil_states", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // SP, RJ, etc.
  name: text("name").notNull(), // São Paulo, Rio de Janeiro, etc.
  region: text("region").notNull(), // Sudeste, Sul, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Tabelas de frete Mercado Livre
export const mercadolivreFreightRates = pgTable("mercadolivre_freight_rates", {
  id: serial("id").primaryKey(),
  state: text("state").notNull(),
  serviceType: text("service_type").notNull(), // 'me1', 'flex', 'envios'
  weightFrom: decimal("weight_from", { precision: 8, scale: 3 }).notNull(),
  weightTo: decimal("weight_to", { precision: 8, scale: 3 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => ({
  stateServiceIdx: index("ml_freight_state_service_idx").on(table.state, table.serviceType),
  weightIdx: index("ml_freight_weight_idx").on(table.weightFrom, table.weightTo),
  activeIdx: index("ml_freight_active_idx").on(table.isActive),
}));

// Relations para as novas tabelas
export const userProductsRelations = relations(userProducts, ({ one, many }) => ({
  user: one(users, {
    fields: [userProducts.userId],
    references: [users.id],
  }),
  category: one(departments, {
    fields: [userProducts.categoryId],
    references: [departments.id],
  }),
  supplier: one(suppliers, {
    fields: [userProducts.supplierId],
    references: [suppliers.id],
  }),
  channels: many(productChannels),
}));

export const productChannelsRelations = relations(productChannels, ({ one }) => ({
  product: one(userProducts, {
    fields: [productChannels.productId],
    references: [userProducts.id],
  }),
}));

export const userPricingSettingsRelations = relations(userPricingSettings, ({ one }) => ({
  user: one(users, {
    fields: [userPricingSettings.userId],
    references: [users.id],
  }),
}));

export const categoryCommissionsRelations = relations(categoryCommissions, ({ one }) => ({
  category: one(departments, {
    fields: [categoryCommissions.categoryId],
    references: [departments.id],
  }),
}));

// Schemas de inserção com Zod
export const insertUserProductSchema = createInsertSchema(userProducts);
export const insertProductChannelSchema = createInsertSchema(productChannels);
export const insertUserPricingSettingsSchema = createInsertSchema(userPricingSettings);
export const insertAmazonFreightRateSchema = createInsertSchema(amazonFreightRates);
export const insertCategoryCommissionSchema = createInsertSchema(categoryCommissions);
export const insertBrazilStateSchema = createInsertSchema(brazilStates);
export const insertMercadolivreFreightRateSchema = createInsertSchema(mercadolivreFreightRates);

// Tipos TypeScript
export type UserProduct = typeof userProducts.$inferSelect;
export type InsertUserProduct = typeof userProducts.$inferInsert;
export type ProductChannel = typeof productChannels.$inferSelect;
export type InsertProductChannel = typeof productChannels.$inferInsert;
export type UserPricingSettings = typeof userPricingSettings.$inferSelect;
export type InsertUserPricingSettings = typeof userPricingSettings.$inferInsert;
export type AmazonFreightRate = typeof amazonFreightRates.$inferSelect;
export type InsertAmazonFreightRate = typeof amazonFreightRates.$inferInsert;
export type CategoryCommission = typeof categoryCommissions.$inferSelect;
export type InsertCategoryCommission = typeof categoryCommissions.$inferInsert;
export type BrazilState = typeof brazilStates.$inferSelect;
export type InsertBrazilState = typeof brazilStates.$inferInsert;
export type MercadolivreFreightRate = typeof mercadolivreFreightRates.$inferSelect;
export type InsertMercadolivreFreightRate = typeof mercadolivreFreightRates.$inferInsert;

// Tipos específicos para cálculos
export type ChannelCalculation = {
  channelType: string;
  salePrice: number;
  freightCost: number;
  commissionCost: number;
  taxCost: number;
  adCost: number;
  totalCost: number;
  profit: number;
  margin: number;
  roi: number;
  isActive: boolean;
};

export type ProductWithChannels = UserProduct & {
  category?: Department;
  supplier?: Supplier;
  channels: ProductChannel[];
  calculations?: ChannelCalculation[];
};

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
  cost: decimal("cost", { precision: 10, scale: 6 }).notNull().default("0"), // processing cost
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

// Insert schemas for generated images
export const insertGeneratedImageSchema = createInsertSchema(generatedImages);
export type InsertGeneratedImage = z.infer<typeof insertGeneratedImageSchema>;
export type GeneratedImage = typeof generatedImages.$inferSelect;

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

// Amazon Listing Session schemas
export const insertAmazonListingSessionSchema = createInsertSchema(amazonListingSessions).omit({
  id: true,
  sessionHash: true,
  dataHoraCreated: true,
  dataHoraUpdated: true,
});

export type InsertAmazonListingSession = z.infer<typeof insertAmazonListingSessionSchema>;
export type AmazonListingSession = typeof amazonListingSessions.$inferSelect;

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
