import { 
  users, 
  suppliers, 
  partners, 
  materials, 
  tools, 
  templates, 
  prompts, 
  products,
  categories,
  materialTypes,
  toolTypes,
  templateCategories,
  promptCategories,
  departments,
  youtubeVideos,
  news,
  updates,
  webhookConfigs,
  type User, 
  type InsertUser,
  type Supplier,
  type InsertSupplier,
  type Partner,
  type InsertPartner,
  type Material,
  type MaterialWithType,
  type InsertMaterial,
  type Tool,
  type InsertTool,
  type Template,
  type InsertTemplate,
  type Prompt,
  type InsertPrompt,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type YoutubeVideo,
  type InsertYoutubeVideo,
  type News,
  type InsertNews,
  type Update,
  type InsertUpdate,
  type WebhookConfig,
  type InsertWebhookConfig
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and, or, desc } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: number): Promise<Supplier | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier>;
  deleteSupplier(id: number): Promise<void>;
  searchSuppliers(query: string): Promise<Supplier[]>;

  // Partners
  getPartners(): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  createPartner(partner: InsertPartner): Promise<Partner>;
  updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner>;
  deletePartner(id: number): Promise<void>;
  searchPartners(query: string): Promise<Partner[]>;

  // Materials
  getMaterials(): Promise<MaterialWithType[]>;
  getMaterial(id: number): Promise<Material | undefined>;
  createMaterial(material: InsertMaterial): Promise<Material>;
  updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material>;
  deleteMaterial(id: number): Promise<void>;
  searchMaterials(query: string): Promise<MaterialWithType[]>;

  // Tools
  getTools(): Promise<Tool[]>;
  getTool(id: number): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool>;
  deleteTool(id: number): Promise<void>;
  searchTools(query: string): Promise<Tool[]>;

  // Templates
  getTemplates(): Promise<Template[]>;
  getTemplate(id: number): Promise<Template | undefined>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template>;
  deleteTemplate(id: number): Promise<void>;
  searchTemplates(query: string): Promise<Template[]>;

  // Prompts
  getPrompts(): Promise<Prompt[]>;
  getPrompt(id: number): Promise<Prompt | undefined>;
  createPrompt(prompt: InsertPrompt): Promise<Prompt>;
  updatePrompt(id: number, prompt: Partial<InsertPrompt>): Promise<Prompt>;
  deletePrompt(id: number): Promise<void>;
  searchPrompts(query: string): Promise<Prompt[]>;

  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: number): Promise<void>;
  searchProducts(query: string): Promise<Product[]>;

  // Categories
  getCategories(type?: string): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number): Promise<void>;

  // YouTube Videos
  getYoutubeVideos(): Promise<YoutubeVideo[]>;
  getYoutubeVideo(id: number): Promise<YoutubeVideo | undefined>;
  getYoutubeVideoByVideoId(videoId: string): Promise<YoutubeVideo | undefined>;
  createYoutubeVideo(video: InsertYoutubeVideo): Promise<YoutubeVideo>;
  updateYoutubeVideo(id: number, video: Partial<InsertYoutubeVideo>): Promise<YoutubeVideo>;
  deleteYoutubeVideo(id: number): Promise<void>;
  getActiveYoutubeVideos(): Promise<YoutubeVideo[]>;
  deactivateOldVideos(): Promise<void>;

  // News
  getNews(): Promise<News[]>;
  getPublishedNews(): Promise<News[]>;
  getNewsById(id: number): Promise<News | undefined>;
  createNews(news: InsertNews): Promise<News>;
  updateNews(id: number, news: Partial<InsertNews>): Promise<News>;
  deleteNews(id: number): Promise<void>;

  // Updates
  getUpdates(): Promise<Update[]>;
  getPublishedUpdates(): Promise<Update[]>;
  getUpdate(id: number): Promise<Update | undefined>;
  createUpdate(update: InsertUpdate): Promise<Update>;
  updateUpdate(id: number, update: Partial<InsertUpdate>): Promise<Update>;
  deleteUpdate(id: number): Promise<void>;

  // Webhook Configs
  getWebhookConfigs(): Promise<WebhookConfig[]>;
  getWebhookConfig(id: number): Promise<WebhookConfig | undefined>;
  createWebhookConfig(config: InsertWebhookConfig): Promise<WebhookConfig>;
  updateWebhookConfig(id: number, config: Partial<InsertWebhookConfig>): Promise<WebhookConfig>;
  deleteWebhookConfig(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: insertUser.role || "student",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async getSupplier(id: number): Promise<Supplier | undefined> {
    const [supplier] = await db.select().from(suppliers).where(eq(suppliers.id, id));
    return supplier || undefined;
  }

  async createSupplier(supplier: InsertSupplier): Promise<Supplier> {
    const [created] = await db
      .insert(suppliers)
      .values({
        ...supplier,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateSupplier(id: number, supplier: Partial<InsertSupplier>): Promise<Supplier> {
    const [updated] = await db
      .update(suppliers)
      .set({
        ...supplier,
        updatedAt: new Date(),
      })
      .where(eq(suppliers.id, id))
      .returning();
    return updated;
  }

  async deleteSupplier(id: number): Promise<void> {
    await db.delete(suppliers).where(eq(suppliers.id, id));
  }

  async searchSuppliers(query: string): Promise<Supplier[]> {
    return await db
      .select()
      .from(suppliers)
      .where(
        or(
          ilike(suppliers.tradeName, `%${query}%`),
          ilike(suppliers.corporateName, `%${query}%`),
          ilike(suppliers.description, `%${query}%`)
        )
      );
  }

  // Partners
  async getPartners(): Promise<Partner[]> {
    return await db.select().from(partners);
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner || undefined;
  }

  async createPartner(partner: InsertPartner): Promise<Partner> {
    const [created] = await db
      .insert(partners)
      .values({
        ...partner,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updatePartner(id: number, partner: Partial<InsertPartner>): Promise<Partner> {
    const [updated] = await db
      .update(partners)
      .set({
        ...partner,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, id))
      .returning();
    return updated;
  }

  async deletePartner(id: number): Promise<void> {
    await db.delete(partners).where(eq(partners.id, id));
  }

  async searchPartners(query: string): Promise<Partner[]> {
    return await db
      .select()
      .from(partners)
      .where(
        or(
          ilike(partners.name, `%${query}%`),
          ilike(partners.specialties, `%${query}%`),
          ilike(partners.description, `%${query}%`)
        )
      );
  }

  // Materials
  async getMaterials(): Promise<MaterialWithType[]> {
    const results = await db
      .select({
        id: materials.id,
        title: materials.title,
        description: materials.description,
        typeId: materials.typeId,
        accessLevel: materials.accessLevel,
        fileUrl: materials.fileUrl,
        externalUrl: materials.externalUrl,
        embedCode: materials.embedCode,
        fileSize: materials.fileSize,
        fileType: materials.fileType,
        tags: materials.tags,
        downloadCount: materials.downloadCount,
        viewCount: materials.viewCount,
        uploadedBy: materials.uploadedBy,
        technicalInfo: materials.technicalInfo,
        uploadDate: materials.uploadDate,
        lastModified: materials.lastModified,
        typeId_join: materialTypes.id,
        typeName: materialTypes.name,
        typeIcon: materialTypes.icon,
        typeDescription: materialTypes.description,
        typeAllowsUpload: materialTypes.allowsUpload,
        typeAllowsUrl: materialTypes.allowsUrl,
        typeViewerType: materialTypes.viewerType,
        typeCreatedAt: materialTypes.createdAt,
      })
      .from(materials)
      .leftJoin(materialTypes, eq(materials.typeId, materialTypes.id));

    return results.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      typeId: row.typeId,
      accessLevel: row.accessLevel,
      fileUrl: row.fileUrl,
      externalUrl: row.externalUrl,
      embedCode: row.embedCode,
      fileSize: row.fileSize,
      fileType: row.fileType,
      tags: row.tags,
      downloadCount: row.downloadCount,
      viewCount: row.viewCount,
      uploadedBy: row.uploadedBy,
      technicalInfo: row.technicalInfo,
      uploadDate: row.uploadDate,
      lastModified: row.lastModified,
      type: {
        id: row.typeId_join || 0,
        name: row.typeName || 'Unknown',
        icon: row.typeIcon || 'FileText',
        description: row.typeDescription,
        allowsUpload: row.typeAllowsUpload || true,
        allowsUrl: row.typeAllowsUrl || true,
        viewerType: row.typeViewerType || 'inline',
        createdAt: row.typeCreatedAt || new Date(),
      }
    }));
  }

  async getMaterial(id: number): Promise<Material | undefined> {
    const [material] = await db.select().from(materials).where(eq(materials.id, id));
    return material || undefined;
  }

  async createMaterial(material: InsertMaterial): Promise<Material> {
    const [created] = await db
      .insert(materials)
      .values({
        ...material,
        uploadDate: new Date(),
        lastModified: new Date(),
      })
      .returning();
    return created;
  }

  async updateMaterial(id: number, material: Partial<InsertMaterial>): Promise<Material> {
    const [updated] = await db
      .update(materials)
      .set({
        ...material,
        lastModified: new Date(),
      })
      .where(eq(materials.id, id))
      .returning();
    return updated;
  }

  async deleteMaterial(id: number): Promise<void> {
    await db.delete(materials).where(eq(materials.id, id));
  }

  async searchMaterials(query: string): Promise<MaterialWithType[]> {
    const results = await db
      .select({
        id: materials.id,
        title: materials.title,
        description: materials.description,
        typeId: materials.typeId,
        accessLevel: materials.accessLevel,
        fileUrl: materials.fileUrl,
        externalUrl: materials.externalUrl,
        embedCode: materials.embedCode,
        fileSize: materials.fileSize,
        fileType: materials.fileType,
        tags: materials.tags,
        downloadCount: materials.downloadCount,
        viewCount: materials.viewCount,
        uploadedBy: materials.uploadedBy,
        technicalInfo: materials.technicalInfo,
        uploadDate: materials.uploadDate,
        lastModified: materials.lastModified,
        typeId_join: materialTypes.id,
        typeName: materialTypes.name,
        typeIcon: materialTypes.icon,
        typeDescription: materialTypes.description,
        typeAllowsUpload: materialTypes.allowsUpload,
        typeAllowsUrl: materialTypes.allowsUrl,
        typeViewerType: materialTypes.viewerType,
        typeCreatedAt: materialTypes.createdAt,
      })
      .from(materials)
      .leftJoin(materialTypes, eq(materials.typeId, materialTypes.id))
      .where(
        or(
          ilike(materials.title, `%${query}%`),
          ilike(materials.description, `%${query}%`)
        )
      );

    return results.map(row => ({
      id: row.id,
      title: row.title,
      description: row.description,
      typeId: row.typeId,
      accessLevel: row.accessLevel,
      fileUrl: row.fileUrl,
      externalUrl: row.externalUrl,
      embedCode: row.embedCode,
      fileSize: row.fileSize,
      fileType: row.fileType,
      tags: row.tags,
      downloadCount: row.downloadCount,
      viewCount: row.viewCount,
      uploadedBy: row.uploadedBy,
      technicalInfo: row.technicalInfo,
      uploadDate: row.uploadDate,
      lastModified: row.lastModified,
      type: {
        id: row.typeId_join || 0,
        name: row.typeName || 'Unknown',
        icon: row.typeIcon || 'FileText',
        description: row.typeDescription,
        allowsUpload: row.typeAllowsUpload || true,
        allowsUrl: row.typeAllowsUrl || true,
        viewerType: row.typeViewerType || 'inline',
        createdAt: row.typeCreatedAt || new Date(),
      }
    }));
  }

  // Tools
  async getTools(): Promise<Tool[]> {
    return await db.select().from(tools);
  }

  async getTool(id: number): Promise<Tool | undefined> {
    const [tool] = await db.select().from(tools).where(eq(tools.id, id));
    return tool || undefined;
  }

  async createTool(tool: InsertTool): Promise<Tool> {
    const [created] = await db
      .insert(tools)
      .values({
        ...tool,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool> {
    const [updated] = await db
      .update(tools)
      .set({
        ...tool,
        updatedAt: new Date(),
      })
      .where(eq(tools.id, id))
      .returning();
    return updated;
  }

  async deleteTool(id: number): Promise<void> {
    await db.delete(tools).where(eq(tools.id, id));
  }

  async searchTools(query: string): Promise<Tool[]> {
    return await db
      .select()
      .from(tools)
      .where(
        or(
          ilike(tools.name, `%${query}%`),
          ilike(tools.description, `%${query}%`)
        )
      );
  }

  // Templates
  async getTemplates(): Promise<Template[]> {
    return await db.select().from(templates);
  }

  async getTemplate(id: number): Promise<Template | undefined> {
    const [template] = await db.select().from(templates).where(eq(templates.id, id));
    return template || undefined;
  }

  async createTemplate(template: InsertTemplate): Promise<Template> {
    const [created] = await db
      .insert(templates)
      .values({
        ...template,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateTemplate(id: number, template: Partial<InsertTemplate>): Promise<Template> {
    const [updated] = await db
      .update(templates)
      .set({
        ...template,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, id))
      .returning();
    return updated;
  }

  async deleteTemplate(id: number): Promise<void> {
    await db.delete(templates).where(eq(templates.id, id));
  }

  async searchTemplates(query: string): Promise<Template[]> {
    return await db
      .select()
      .from(templates)
      .where(
        or(
          ilike(templates.title, `%${query}%`),
          ilike(templates.description, `%${query}%`),
          ilike(templates.content, `%${query}%`)
        )
      );
  }

  // Prompts
  async getPrompts(): Promise<Prompt[]> {
    return await db.select().from(prompts);
  }

  async getPrompt(id: number): Promise<Prompt | undefined> {
    const [prompt] = await db.select().from(prompts).where(eq(prompts.id, id));
    return prompt || undefined;
  }

  async createPrompt(prompt: InsertPrompt): Promise<Prompt> {
    const [created] = await db
      .insert(prompts)
      .values({
        ...prompt,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updatePrompt(id: number, prompt: Partial<InsertPrompt>): Promise<Prompt> {
    const [updated] = await db
      .update(prompts)
      .set({
        ...prompt,
        updatedAt: new Date(),
      })
      .where(eq(prompts.id, id))
      .returning();
    return updated;
  }

  async deletePrompt(id: number): Promise<void> {
    await db.delete(prompts).where(eq(prompts.id, id));
  }

  async searchPrompts(query: string): Promise<Prompt[]> {
    return await db
      .select()
      .from(prompts)
      .where(
        or(
          ilike(prompts.title, `%${query}%`),
          ilike(prompts.description, `%${query}%`),
          ilike(prompts.content, `%${query}%`)
        )
      );
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [created] = await db
      .insert(products)
      .values({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product> {
    const [updated] = await db
      .update(products)
      .set({
        ...product,
        updatedAt: new Date(),
      })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.brand, `%${query}%`),
          ilike(products.category, `%${query}%`)
        )
      );
  }

  // Categories
  async getCategories(type?: string): Promise<Category[]> {
    if (type) {
      return await db.select().from(categories).where(eq(categories.type, type));
    }
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [created] = await db
      .insert(categories)
      .values({
        ...category,
        createdAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updated] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: number): Promise<void> {
    await db.delete(categories).where(eq(categories.id, id));
  }

  // YouTube Videos
  async getYoutubeVideos(): Promise<YoutubeVideo[]> {
    return await db
      .select()
      .from(youtubeVideos)
      .where(eq(youtubeVideos.isActive, true))
      .orderBy(desc(youtubeVideos.publishedAt));
  }

  async getYoutubeVideo(id: number): Promise<YoutubeVideo | undefined> {
    const [video] = await db.select().from(youtubeVideos).where(eq(youtubeVideos.id, id));
    return video || undefined;
  }

  async getYoutubeVideoByVideoId(videoId: string): Promise<YoutubeVideo | undefined> {
    const [video] = await db.select().from(youtubeVideos).where(eq(youtubeVideos.videoId, videoId));
    return video || undefined;
  }

  async createYoutubeVideo(video: InsertYoutubeVideo): Promise<YoutubeVideo> {
    const [created] = await db
      .insert(youtubeVideos)
      .values({
        ...video,
        createdAt: new Date(),
        fetchedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateYoutubeVideo(id: number, video: Partial<InsertYoutubeVideo>): Promise<YoutubeVideo> {
    const [updated] = await db
      .update(youtubeVideos)
      .set({
        ...video,
        fetchedAt: new Date(),
      })
      .where(eq(youtubeVideos.id, id))
      .returning();
    return updated;
  }

  async deleteYoutubeVideo(id: number): Promise<void> {
    await db.delete(youtubeVideos).where(eq(youtubeVideos.id, id));
  }

  async getActiveYoutubeVideos(): Promise<YoutubeVideo[]> {
    return await db
      .select()
      .from(youtubeVideos)
      .where(eq(youtubeVideos.isActive, true))
      .orderBy(desc(youtubeVideos.publishedAt));
  }

  async deactivateOldVideos(): Promise<void> {
    await db
      .update(youtubeVideos)
      .set({ isActive: false })
      .where(eq(youtubeVideos.isActive, true));
  }

  // News methods
  async getNews(): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .orderBy(desc(news.createdAt))
      .limit(50); // Limit to most recent 50 news items for better performance
  }

  async getPublishedNews(): Promise<News[]> {
    return await db
      .select()
      .from(news)
      .where(eq(news.isPublished, true))
      .orderBy(desc(news.createdAt))
      .limit(50);
  }

  // Lightweight dashboard version - only essential fields
  async getPublishedNewsPreview(): Promise<Partial<News>[]> {
    return await db
      .select({
        id: news.id,
        title: news.title,
        summary: news.summary,
        category: news.category,
        isFeatured: news.isFeatured,
        createdAt: news.createdAt,
      })
      .from(news)
      .where(eq(news.isPublished, true))
      .orderBy(desc(news.createdAt))
      .limit(10);
  }

  async getNewsById(id: number): Promise<News | undefined> {
    const [newsItem] = await db.select().from(news).where(eq(news.id, id));
    return newsItem || undefined;
  }

  async createNews(newsData: InsertNews): Promise<News> {
    const [createdNews] = await db
      .insert(news)
      .values(newsData)
      .returning();
    return createdNews;
  }

  async updateNews(id: number, newsData: Partial<InsertNews>): Promise<News> {
    const [updatedNews] = await db
      .update(news)
      .set(newsData)
      .where(eq(news.id, id))
      .returning();
    return updatedNews;
  }

  async deleteNews(id: number): Promise<void> {
    await db.delete(news).where(eq(news.id, id));
  }

  // Updates methods
  async getUpdates(): Promise<Update[]> {
    return await db.select().from(updates).orderBy(desc(updates.createdAt));
  }

  async getPublishedUpdates(): Promise<Update[]> {
    return await db
      .select()
      .from(updates)
      .where(eq(updates.isPublished, true))
      .orderBy(desc(updates.createdAt))
      .limit(50);
  }

  // Lightweight dashboard version - only essential fields
  async getPublishedUpdatesPreview(): Promise<Partial<Update>[]> {
    return await db
      .select({
        id: updates.id,
        title: updates.title,
        summary: updates.summary,
        version: updates.version,
        type: updates.type,
        priority: updates.priority,
        createdAt: updates.createdAt,
      })
      .from(updates)
      .where(eq(updates.isPublished, true))
      .orderBy(desc(updates.createdAt))
      .limit(10);
  }

  async getUpdate(id: number): Promise<Update | undefined> {
    const [update] = await db.select().from(updates).where(eq(updates.id, id));
    return update || undefined;
  }

  async createUpdate(updateData: InsertUpdate): Promise<Update> {
    const [createdUpdate] = await db
      .insert(updates)
      .values(updateData)
      .returning();
    return createdUpdate;
  }

  async updateUpdate(id: number, updateData: Partial<InsertUpdate>): Promise<Update> {
    const [updatedUpdate] = await db
      .update(updates)
      .set(updateData)
      .where(eq(updates.id, id))
      .returning();
    return updatedUpdate;
  }

  async deleteUpdate(id: number): Promise<void> {
    await db.delete(updates).where(eq(updates.id, id));
  }

  // Webhook Config methods
  async getWebhookConfigs(): Promise<WebhookConfig[]> {
    return await db.select().from(webhookConfigs).orderBy(desc(webhookConfigs.createdAt));
  }

  async getWebhookConfig(id: number): Promise<WebhookConfig | undefined> {
    const [config] = await db.select().from(webhookConfigs).where(eq(webhookConfigs.id, id));
    return config || undefined;
  }

  async createWebhookConfig(configData: InsertWebhookConfig): Promise<WebhookConfig> {
    const [createdConfig] = await db
      .insert(webhookConfigs)
      .values(configData)
      .returning();
    return createdConfig;
  }

  async updateWebhookConfig(id: number, configData: Partial<InsertWebhookConfig>): Promise<WebhookConfig> {
    const [updatedConfig] = await db
      .update(webhookConfigs)
      .set(configData)
      .where(eq(webhookConfigs.id, id))
      .returning();
    return updatedConfig;
  }

  async deleteWebhookConfig(id: number): Promise<void> {
    await db.delete(webhookConfigs).where(eq(webhookConfigs.id, id));
  }
}

export const storage = new DatabaseStorage();
