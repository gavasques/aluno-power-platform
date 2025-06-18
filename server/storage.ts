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
  materialCategories,
  toolTypes,
  templateCategories,
  promptCategories,
  departments,
  partnerTypes,
  partnerContacts,
  partnerFiles,
  partnerReviews,
  partnerReviewReplies,
  toolReviews,
  toolReviewReplies,
  toolDiscounts,
  toolVideos,
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
  type Department,
  type InsertDepartment,
  type TemplateCategory,
  type InsertTemplateCategory,
  type PromptCategory,
  type InsertPromptCategory,
  type ToolType,
  type InsertToolType,
  type MaterialType,
  type InsertMaterialType,
  type PartnerType,
  type InsertPartnerType,
  type PartnerContact,
  type InsertPartnerContact,
  type PartnerFile,
  type InsertPartnerFile,
  type PartnerReview,
  type InsertPartnerReview,
  type PartnerReviewReply,
  type InsertPartnerReviewReply,
  type PartnerReviewWithUser,
  type ToolReview,
  type InsertToolReview,
  type ToolReviewReply,
  type InsertToolReviewReply,
  type ToolReviewWithUser,
  type ToolDiscount,
  type InsertToolDiscount,
  type ToolVideo,
  type InsertToolVideo,
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
import { eq, ilike, and, or, desc, asc, sql } from "drizzle-orm";

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
  getPartnersWithReviewStats(): Promise<Partner[]>;
  getPartner(id: number): Promise<Partner | undefined>;
  getPartnerWithReviewStats(id: number): Promise<Partner | undefined>;
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
  incrementMaterialViewCount(id: number): Promise<void>;
  incrementMaterialDownloadCount(id: number): Promise<void>;

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

  // Departments
  getDepartments(): Promise<Department[]>;
  getDepartment(id: number): Promise<Department | undefined>;
  createDepartment(department: InsertDepartment): Promise<Department>;
  updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department>;
  deleteDepartment(id: number): Promise<void>;

  // Template Categories
  getTemplateCategories(): Promise<TemplateCategory[]>;
  getTemplateCategory(id: number): Promise<TemplateCategory | undefined>;
  createTemplateCategory(category: InsertTemplateCategory): Promise<TemplateCategory>;
  updateTemplateCategory(id: number, category: Partial<InsertTemplateCategory>): Promise<TemplateCategory>;
  deleteTemplateCategory(id: number): Promise<void>;

  // Prompt Categories
  getPromptCategories(): Promise<PromptCategory[]>;
  getPromptCategory(id: number): Promise<PromptCategory | undefined>;
  createPromptCategory(category: InsertPromptCategory): Promise<PromptCategory>;
  updatePromptCategory(id: number, category: Partial<InsertPromptCategory>): Promise<PromptCategory>;
  deletePromptCategory(id: number): Promise<void>;

  // Tool Types
  getToolTypes(): Promise<ToolType[]>;
  getToolType(id: number): Promise<ToolType | undefined>;
  createToolType(toolType: InsertToolType): Promise<ToolType>;
  updateToolType(id: number, toolType: Partial<InsertToolType>): Promise<ToolType>;
  deleteToolType(id: number): Promise<void>;

  // Material Types
  getMaterialTypes(): Promise<MaterialType[]>;
  getMaterialType(id: number): Promise<MaterialType | undefined>;
  createMaterialType(materialType: InsertMaterialType): Promise<MaterialType>;
  updateMaterialType(id: number, materialType: Partial<InsertMaterialType>): Promise<MaterialType>;
  deleteMaterialType(id: number): Promise<void>;

  // Partner Types
  getPartnerTypes(): Promise<PartnerType[]>;
  getPartnerType(id: number): Promise<PartnerType | undefined>;
  createPartnerType(partnerType: InsertPartnerType): Promise<PartnerType>;
  updatePartnerType(id: number, partnerType: Partial<InsertPartnerType>): Promise<PartnerType>;
  deletePartnerType(id: number): Promise<void>;

  // Partner Contacts
  getPartnerContacts(partnerId: number): Promise<PartnerContact[]>;
  getPartnerContact(id: number): Promise<PartnerContact | undefined>;
  createPartnerContact(contact: InsertPartnerContact): Promise<PartnerContact>;
  updatePartnerContact(id: number, contact: Partial<InsertPartnerContact>): Promise<PartnerContact>;
  deletePartnerContact(id: number): Promise<void>;

  // Partner Files
  getPartnerFiles(partnerId: number): Promise<PartnerFile[]>;
  getPartnerFile(id: number): Promise<PartnerFile | undefined>;
  createPartnerFile(file: InsertPartnerFile): Promise<PartnerFile>;
  updatePartnerFile(id: number, file: Partial<InsertPartnerFile>): Promise<PartnerFile>;
  deletePartnerFile(id: number): Promise<void>;

  // Tool Reviews
  getToolReviews(toolId: number): Promise<ToolReviewWithUser[]>;
  createToolReview(review: InsertToolReview): Promise<ToolReview>;
  deleteToolReview(id: number): Promise<void>;

  // Tool Review Replies
  createToolReviewReply(reply: InsertToolReviewReply): Promise<ToolReviewReply>;

  // Tool Discounts
  getToolDiscounts(toolId: number): Promise<ToolDiscount[]>;
  createToolDiscount(discount: InsertToolDiscount): Promise<ToolDiscount>;
  updateToolDiscount(id: number, discount: Partial<InsertToolDiscount>): Promise<ToolDiscount>;
  deleteToolDiscount(id: number): Promise<void>;

  // Tool Videos
  getToolVideos(toolId: number): Promise<ToolVideo[]>;
  createToolVideo(video: InsertToolVideo): Promise<ToolVideo>;
  updateToolVideo(id: number, video: Partial<InsertToolVideo>): Promise<ToolVideo>;
  deleteToolVideo(id: number): Promise<void>;

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

  async getPartnersWithReviewStats(): Promise<Partner[]> {
    try {
      const allPartners = await db.select().from(partners);
      
      const partnersWithStats = await Promise.all(
        allPartners.map(async (partner) => {
          const reviews = await db
            .select()
            .from(partnerReviews)
            .where(and(eq(partnerReviews.partnerId, partner.id), eq(partnerReviews.isApproved, true)));
          
          const totalReviews = reviews.length;
          let averageRating = '0';
          
          if (totalReviews > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = (totalRating / totalReviews).toFixed(1);
          }
          
          return {
            ...partner,
            averageRating,
            totalReviews
          };
        })
      );
      
      return partnersWithStats;
    } catch (error) {
      console.error('Error calculating review stats:', error);
      return await this.getPartners();
    }
  }

  async getPartner(id: number): Promise<Partner | undefined> {
    const [partner] = await db.select().from(partners).where(eq(partners.id, id));
    return partner || undefined;
  }

  async getPartnerWithReviewStats(id: number): Promise<Partner | undefined> {
    try {
      const [partner] = await db.select().from(partners).where(eq(partners.id, id));
      if (!partner) return undefined;
      
      const reviews = await db
        .select({ rating: partnerReviews.rating })
        .from(partnerReviews)
        .where(and(eq(partnerReviews.partnerId, id), eq(partnerReviews.isApproved, true)));
      
      const totalReviews = reviews.length;
      let averageRating = '0.0';
      
      if (totalReviews > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = (totalRating / totalReviews).toFixed(1);
      }
      
      return {
        ...partner,
        averageRating,
        totalReviews
      };
    } catch (error) {
      console.error('Error calculating partner review stats:', error);
      return await this.getPartner(id);
    }
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
        fileName: materials.fileName,
        fileSize: materials.fileSize,
        fileType: materials.fileType,
        externalUrl: materials.externalUrl,
        embedCode: materials.embedCode,
        embedUrl: materials.embedUrl,
        videoUrl: materials.videoUrl,
        videoDuration: materials.videoDuration,
        videoThumbnail: materials.videoThumbnail,
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
        typeContentType: materialTypes.contentType,
        typeAllowsUpload: materialTypes.allowsUpload,
        typeAllowsUrl: materialTypes.allowsUrl,
        typeAllowsEmbed: materialTypes.allowsEmbed,
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
      fileName: row.fileName,
      fileSize: row.fileSize,
      fileType: row.fileType,
      externalUrl: row.externalUrl,
      embedCode: row.embedCode,
      embedUrl: row.embedUrl,
      videoUrl: row.videoUrl,
      videoDuration: row.videoDuration,
      videoThumbnail: row.videoThumbnail,
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
        contentType: row.typeContentType || 'pdf',
        allowsUpload: row.typeAllowsUpload || true,
        allowsUrl: row.typeAllowsUrl || true,
        allowsEmbed: row.typeAllowsEmbed || false,
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
        fileName: materials.fileName,
        fileSize: materials.fileSize,
        fileType: materials.fileType,
        externalUrl: materials.externalUrl,
        embedCode: materials.embedCode,
        embedUrl: materials.embedUrl,
        videoUrl: materials.videoUrl,
        videoDuration: materials.videoDuration,
        videoThumbnail: materials.videoThumbnail,
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
        typeContentType: materialTypes.contentType,
        typeAllowsUpload: materialTypes.allowsUpload,
        typeAllowsUrl: materialTypes.allowsUrl,
        typeAllowsEmbed: materialTypes.allowsEmbed,
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
      fileName: row.fileName,
      fileSize: row.fileSize,
      fileType: row.fileType,
      externalUrl: row.externalUrl,
      embedCode: row.embedCode,
      embedUrl: row.embedUrl,
      videoUrl: row.videoUrl,
      videoDuration: row.videoDuration,
      videoThumbnail: row.videoThumbnail,
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
        contentType: row.typeContentType || 'pdf',
        allowsUpload: row.typeAllowsUpload || true,
        allowsUrl: row.typeAllowsUrl || true,
        allowsEmbed: row.typeAllowsEmbed || false,
        viewerType: row.typeViewerType || 'inline',
        createdAt: row.typeCreatedAt || new Date(),
      }
    }));
  }

  async incrementMaterialViewCount(id: number): Promise<void> {
    await db
      .update(materials)
      .set({
        viewCount: sql`${materials.viewCount} + 1`,
        lastModified: new Date(),
      })
      .where(eq(materials.id, id));
  }

  async incrementMaterialDownloadCount(id: number): Promise<void> {
    await db
      .update(materials)
      .set({
        downloadCount: sql`${materials.downloadCount} + 1`,
        lastModified: new Date(),
      })
      .where(eq(materials.id, id));
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

  // Departments
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments).orderBy(desc(departments.createdAt));
  }

  async getDepartment(id: number): Promise<Department | undefined> {
    const [department] = await db.select().from(departments).where(eq(departments.id, id));
    return department || undefined;
  }

  async createDepartment(department: InsertDepartment): Promise<Department> {
    const [created] = await db
      .insert(departments)
      .values(department)
      .returning();
    return created;
  }

  async updateDepartment(id: number, department: Partial<InsertDepartment>): Promise<Department> {
    const [updated] = await db
      .update(departments)
      .set(department)
      .where(eq(departments.id, id))
      .returning();
    return updated;
  }

  async deleteDepartment(id: number): Promise<void> {
    await db.delete(departments).where(eq(departments.id, id));
  }

  // Template Categories
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    return await db.select().from(templateCategories).orderBy(desc(templateCategories.createdAt));
  }

  async getTemplateCategory(id: number): Promise<TemplateCategory | undefined> {
    const [category] = await db.select().from(templateCategories).where(eq(templateCategories.id, id));
    return category || undefined;
  }

  async createTemplateCategory(category: InsertTemplateCategory): Promise<TemplateCategory> {
    const [created] = await db
      .insert(templateCategories)
      .values(category)
      .returning();
    return created;
  }

  async updateTemplateCategory(id: number, category: Partial<InsertTemplateCategory>): Promise<TemplateCategory> {
    const [updated] = await db
      .update(templateCategories)
      .set(category)
      .where(eq(templateCategories.id, id))
      .returning();
    return updated;
  }

  async deleteTemplateCategory(id: number): Promise<void> {
    await db.delete(templateCategories).where(eq(templateCategories.id, id));
  }

  // Prompt Categories
  async getPromptCategories(): Promise<PromptCategory[]> {
    return await db.select().from(promptCategories).orderBy(desc(promptCategories.createdAt));
  }

  async getPromptCategory(id: number): Promise<PromptCategory | undefined> {
    const [category] = await db.select().from(promptCategories).where(eq(promptCategories.id, id));
    return category || undefined;
  }

  async createPromptCategory(category: InsertPromptCategory): Promise<PromptCategory> {
    const [created] = await db
      .insert(promptCategories)
      .values(category)
      .returning();
    return created;
  }

  async updatePromptCategory(id: number, category: Partial<InsertPromptCategory>): Promise<PromptCategory> {
    const [updated] = await db
      .update(promptCategories)
      .set(category)
      .where(eq(promptCategories.id, id))
      .returning();
    return updated;
  }

  async deletePromptCategory(id: number): Promise<void> {
    await db.delete(promptCategories).where(eq(promptCategories.id, id));
  }

  // Tool Types
  async getToolTypes(): Promise<ToolType[]> {
    return await db.select().from(toolTypes).orderBy(desc(toolTypes.createdAt));
  }

  async getToolType(id: number): Promise<ToolType | undefined> {
    const [toolType] = await db.select().from(toolTypes).where(eq(toolTypes.id, id));
    return toolType || undefined;
  }

  async createToolType(toolType: InsertToolType): Promise<ToolType> {
    const [created] = await db
      .insert(toolTypes)
      .values(toolType)
      .returning();
    return created;
  }

  async updateToolType(id: number, toolType: Partial<InsertToolType>): Promise<ToolType> {
    const [updated] = await db
      .update(toolTypes)
      .set(toolType)
      .where(eq(toolTypes.id, id))
      .returning();
    return updated;
  }

  async deleteToolType(id: number): Promise<void> {
    await db.delete(toolTypes).where(eq(toolTypes.id, id));
  }

  // Material Types
  async getMaterialTypes(): Promise<MaterialType[]> {
    return await db.select().from(materialTypes).orderBy(desc(materialTypes.createdAt));
  }

  async getMaterialType(id: number): Promise<MaterialType | undefined> {
    const [materialType] = await db.select().from(materialTypes).where(eq(materialTypes.id, id));
    return materialType || undefined;
  }

  async createMaterialType(materialType: InsertMaterialType): Promise<MaterialType> {
    const [created] = await db
      .insert(materialTypes)
      .values(materialType)
      .returning();
    return created;
  }

  async updateMaterialType(id: number, materialType: Partial<InsertMaterialType>): Promise<MaterialType> {
    const [updated] = await db
      .update(materialTypes)
      .set(materialType)
      .where(eq(materialTypes.id, id))
      .returning();
    return updated;
  }

  async deleteMaterialType(id: number): Promise<void> {
    await db.delete(materialTypes).where(eq(materialTypes.id, id));
  }

  // Partner Types
  async getPartnerTypes(): Promise<PartnerType[]> {
    return await db.select().from(partnerTypes).orderBy(desc(partnerTypes.createdAt));
  }

  async getPartnerType(id: number): Promise<PartnerType | undefined> {
    const [partnerType] = await db.select().from(partnerTypes).where(eq(partnerTypes.id, id));
    return partnerType || undefined;
  }

  async createPartnerType(partnerType: InsertPartnerType): Promise<PartnerType> {
    const [created] = await db
      .insert(partnerTypes)
      .values(partnerType)
      .returning();
    return created;
  }

  async updatePartnerType(id: number, partnerType: Partial<InsertPartnerType>): Promise<PartnerType> {
    const [updated] = await db
      .update(partnerTypes)
      .set(partnerType)
      .where(eq(partnerTypes.id, id))
      .returning();
    return updated;
  }

  async deletePartnerType(id: number): Promise<void> {
    await db.delete(partnerTypes).where(eq(partnerTypes.id, id));
  }

  // Partner Contacts
  async getPartnerContacts(partnerId: number): Promise<PartnerContact[]> {
    return await db.select().from(partnerContacts).where(eq(partnerContacts.partnerId, partnerId));
  }

  async getPartnerContact(id: number): Promise<PartnerContact | undefined> {
    const [contact] = await db.select().from(partnerContacts).where(eq(partnerContacts.id, id));
    return contact || undefined;
  }

  async createPartnerContact(contact: InsertPartnerContact): Promise<PartnerContact> {
    const [created] = await db
      .insert(partnerContacts)
      .values(contact)
      .returning();
    return created;
  }

  async updatePartnerContact(id: number, contact: Partial<InsertPartnerContact>): Promise<PartnerContact> {
    const [updated] = await db
      .update(partnerContacts)
      .set(contact)
      .where(eq(partnerContacts.id, id))
      .returning();
    return updated;
  }

  async deletePartnerContact(id: number): Promise<void> {
    await db.delete(partnerContacts).where(eq(partnerContacts.id, id));
  }

  // Partner Files
  async getPartnerFiles(partnerId: number): Promise<PartnerFile[]> {
    return await db.select().from(partnerFiles).where(eq(partnerFiles.partnerId, partnerId));
  }

  async getPartnerFile(id: number): Promise<PartnerFile | undefined> {
    const [file] = await db.select().from(partnerFiles).where(eq(partnerFiles.id, id));
    return file || undefined;
  }

  async createPartnerFile(file: InsertPartnerFile): Promise<PartnerFile> {
    const [created] = await db
      .insert(partnerFiles)
      .values(file)
      .returning();
    return created;
  }

  async updatePartnerFile(id: number, file: Partial<InsertPartnerFile>): Promise<PartnerFile> {
    const [updated] = await db
      .update(partnerFiles)
      .set(file)
      .where(eq(partnerFiles.id, id))
      .returning();
    return updated;
  }

  async deletePartnerFile(id: number): Promise<void> {
    await db.delete(partnerFiles).where(eq(partnerFiles.id, id));
  }

  // Partner Reviews
  async getPartnerReviews(partnerId: number): Promise<PartnerReviewWithUser[]> {
    try {
      // Fetch all reviews with users in one query
      const reviews = await db
        .select({
          review: partnerReviews,
          user: users
        })
        .from(partnerReviews)
        .leftJoin(users, eq(partnerReviews.userId, users.id))
        .where(and(eq(partnerReviews.partnerId, partnerId), eq(partnerReviews.isApproved, true)))
        .orderBy(desc(partnerReviews.createdAt));

      if (reviews.length === 0) {
        return [];
      }

      // Get all review IDs
      const reviewIds = reviews.map(row => row.review.id);

      // Fetch all replies for all reviews
      const allReplies: (PartnerReviewReply & { user: User })[] = [];
      for (const reviewId of reviewIds) {
        const replies = await this.getPartnerReviewReplies(reviewId);
        allReplies.push(...replies);
      }

      // Group replies by review ID
      const repliesByReview = allReplies.reduce((acc, reply) => {
        if (!acc[reply.reviewId]) {
          acc[reply.reviewId] = [];
        }
        acc[reply.reviewId].push(reply as PartnerReviewReply & { user: User });
        return acc;
      }, {} as Record<number, (PartnerReviewReply & { user: User })[]>);

      // Build result with replies
      const result: PartnerReviewWithUser[] = reviews.map(row => ({
        ...row.review,
        user: row.user || {
          id: 0,
          username: 'Usuário Desconhecido',
          name: 'Usuário Desconhecido',
          email: '',
          password: '',
          role: 'user',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        replies: repliesByReview[row.review.id] || [],
      }));
      
      return result;
    } catch (error) {
      console.error('Error fetching partner reviews:', error);
      throw error;
    }
  }

  async createPartnerReview(review: InsertPartnerReview): Promise<PartnerReview> {
    const [created] = await db
      .insert(partnerReviews)
      .values({
        ...review,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updatePartnerReview(id: number, review: Partial<InsertPartnerReview>): Promise<PartnerReview> {
    const [updated] = await db
      .update(partnerReviews)
      .set({
        ...review,
        updatedAt: new Date(),
      })
      .where(eq(partnerReviews.id, id))
      .returning();
    return updated;
  }

  async deletePartnerReview(id: number): Promise<void> {
    await db.delete(partnerReviews).where(eq(partnerReviews.id, id));
  }

  // Partner Review Replies
  async getPartnerReviewReplies(reviewId: number): Promise<(PartnerReviewReply & { user: User })[]> {
    return await db
      .select({
        id: partnerReviewReplies.id,
        reviewId: partnerReviewReplies.reviewId,
        userId: partnerReviewReplies.userId,
        content: partnerReviewReplies.content,
        createdAt: partnerReviewReplies.createdAt,
        updatedAt: partnerReviewReplies.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          username: users.username,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          password: users.password,
        },
      })
      .from(partnerReviewReplies)
      .leftJoin(users, eq(partnerReviewReplies.userId, users.id))
      .where(eq(partnerReviewReplies.reviewId, reviewId))
      .orderBy(asc(partnerReviewReplies.createdAt)) as (PartnerReviewReply & { user: User })[];
  }

  async createPartnerReviewReply(reply: InsertPartnerReviewReply): Promise<PartnerReviewReply> {
    const [created] = await db
      .insert(partnerReviewReplies)
      .values({
        ...reply,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updatePartnerReviewReply(id: number, reply: Partial<InsertPartnerReviewReply>): Promise<PartnerReviewReply> {
    const [updated] = await db
      .update(partnerReviewReplies)
      .set({
        ...reply,
        updatedAt: new Date(),
      })
      .where(eq(partnerReviewReplies.id, id))
      .returning();
    return updated;
  }

  async deletePartnerReviewReply(id: number): Promise<void> {
    await db.delete(partnerReviewReplies).where(eq(partnerReviewReplies.id, id));
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

  // Tool Reviews
  async getToolReviews(toolId: number): Promise<ToolReviewWithUser[]> {
    const reviewsWithUsers = await db
      .select({
        id: toolReviews.id,
        toolId: toolReviews.toolId,
        userId: toolReviews.userId,
        rating: toolReviews.rating,
        comment: toolReviews.comment,
        photos: toolReviews.photos,
        createdAt: toolReviews.createdAt,
        user: {
          id: users.id,
          name: users.name,
          username: users.username,
          email: users.email,
          role: users.role,
          isActive: users.isActive,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
        }
      })
      .from(toolReviews)
      .innerJoin(users, eq(toolReviews.userId, users.id))
      .where(eq(toolReviews.toolId, toolId))
      .orderBy(desc(toolReviews.createdAt));

    // Get replies for each review
    const reviewsWithReplies = await Promise.all(
      reviewsWithUsers.map(async (review) => {
        const replies = await db
          .select({
            id: toolReviewReplies.id,
            reviewId: toolReviewReplies.reviewId,
            userId: toolReviewReplies.userId,
            comment: toolReviewReplies.comment,
            createdAt: toolReviewReplies.createdAt,
            user: {
              id: users.id,
              name: users.name,
              username: users.username,
              email: users.email,
              role: users.role,
              isActive: users.isActive,
              createdAt: users.createdAt,
              updatedAt: users.updatedAt,
            }
          })
          .from(toolReviewReplies)
          .innerJoin(users, eq(toolReviewReplies.userId, users.id))
          .where(eq(toolReviewReplies.reviewId, review.id))
          .orderBy(toolReviewReplies.createdAt);

        return {
          ...review,
          replies
        };
      })
    );

    return reviewsWithReplies;
  }

  async createToolReview(review: InsertToolReview): Promise<ToolReview> {
    const [created] = await db
      .insert(toolReviews)
      .values(review)
      .returning();
    return created;
  }

  async deleteToolReview(id: number): Promise<void> {
    await db.delete(toolReviews).where(eq(toolReviews.id, id));
  }

  // Tool Review Replies
  async createToolReviewReply(reply: InsertToolReviewReply): Promise<ToolReviewReply> {
    const [created] = await db
      .insert(toolReviewReplies)
      .values(reply)
      .returning();
    return created;
  }

  // Tool Discounts
  async getToolDiscounts(toolId: number): Promise<ToolDiscount[]> {
    return await db
      .select()
      .from(toolDiscounts)
      .where(eq(toolDiscounts.toolId, toolId))
      .orderBy(desc(toolDiscounts.createdAt));
  }

  async createToolDiscount(discount: InsertToolDiscount): Promise<ToolDiscount> {
    const [created] = await db
      .insert(toolDiscounts)
      .values(discount)
      .returning();
    return created;
  }

  async updateToolDiscount(id: number, discount: Partial<InsertToolDiscount>): Promise<ToolDiscount> {
    const [updated] = await db
      .update(toolDiscounts)
      .set(discount)
      .where(eq(toolDiscounts.id, id))
      .returning();
    return updated;
  }

  async deleteToolDiscount(id: number): Promise<void> {
    await db.delete(toolDiscounts).where(eq(toolDiscounts.id, id));
  }

  // Tool Videos
  async getToolVideos(toolId: number): Promise<ToolVideo[]> {
    return await db
      .select()
      .from(toolVideos)
      .where(eq(toolVideos.toolId, toolId))
      .orderBy(desc(toolVideos.createdAt));
  }

  async createToolVideo(video: InsertToolVideo): Promise<ToolVideo> {
    const [created] = await db
      .insert(toolVideos)
      .values(video)
      .returning();
    return created;
  }

  async updateToolVideo(id: number, video: Partial<InsertToolVideo>): Promise<ToolVideo> {
    const [updated] = await db
      .update(toolVideos)
      .set(video)
      .where(eq(toolVideos.id, id))
      .returning();
    return updated;
  }

  async deleteToolVideo(id: number): Promise<void> {
    await db.delete(toolVideos).where(eq(toolVideos.id, id));
  }
}

export const storage = new DatabaseStorage();
