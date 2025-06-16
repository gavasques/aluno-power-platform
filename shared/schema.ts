import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
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
  role: text("role").notNull().default("student"),
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
  type: text("type").notNull(), // 'supplier', 'partner', 'material', etc.
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
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Supplier Contacts
export const supplierContacts = pgTable("supplier_contacts", {
  id: serial("id").primaryKey(),
  supplierId: integer("supplier_id").references(() => suppliers.id).notNull(),
  type: text("type").notNull(), // 'phone', 'email', 'whatsapp', 'website'
  value: text("value").notNull(),
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
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  specialties: text("specialties"),
  description: text("description"),
  about: text("about"),
  services: text("services"),
  address: jsonb("address"), // {street, city, state, zipCode}
  website: text("website"),
  instagram: text("instagram"),
  linkedin: text("linkedin"),
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
  type: text("type").notNull(), // 'phone', 'email', 'whatsapp', 'website'
  value: text("value").notNull(),
  label: text("label"),
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
});

// Material Types
export const materialTypes = pgTable("material_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull(),
  description: text("description"),
  allowsUpload: boolean("allows_upload").notNull().default(true),
  allowsUrl: boolean("allows_url").notNull().default(true),
  viewerType: text("viewer_type").notNull().default("inline"), // 'inline', 'download', 'external'
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Materials
export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  typeId: integer("type_id").references(() => materialTypes.id).notNull(),
  accessLevel: text("access_level").notNull().default("public"), // 'public', 'restricted'
  fileUrl: text("file_url"),
  externalUrl: text("external_url"),
  embedCode: text("embed_code"),
  fileSize: integer("file_size"),
  fileType: text("file_type"),
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

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  supplierReviews: many(supplierReviews),
  partnerReviews: many(partnerReviews),
  toolReviews: many(toolReviews),
  materials: many(materials),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  suppliers: many(suppliers),
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
  category: one(categories, {
    fields: [partners.categoryId],
    references: [categories.id],
  }),
  contacts: many(partnerContacts),
  materials: many(partnerMaterials),
  reviews: many(partnerReviews),
}));

export const partnerContactsRelations = relations(partnerContacts, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerContacts.partnerId],
    references: [partners.id],
  }),
}));

export const partnerMaterialsRelations = relations(partnerMaterials, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerMaterials.partnerId],
    references: [partners.id],
  }),
}));

export const partnerReviewsRelations = relations(partnerReviews, ({ one }) => ({
  partner: one(partners, {
    fields: [partnerReviews.partnerId],
    references: [partners.id],
  }),
  user: one(users, {
    fields: [partnerReviews.userId],
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
}));

export const toolReviewsRelations = relations(toolReviews, ({ one }) => ({
  tool: one(tools, {
    fields: [toolReviews.toolId],
    references: [tools.id],
  }),
  user: one(users, {
    fields: [toolReviews.userId],
    references: [users.id],
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

export const insertYoutubeVideoSchema = createInsertSchema(youtubeVideos).omit({
  id: true,
  createdAt: true,
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

export type MaterialType = typeof materialTypes.$inferSelect;

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
