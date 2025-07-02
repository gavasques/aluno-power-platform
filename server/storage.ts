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
  supplierReviews,
  supplierBrands,
  toolReviews,
  toolReviewReplies,
  toolDiscounts,
  toolVideos,
  youtubeVideos,
  news,
  updates,
  webhookConfigs,
  agents,
  agentPrompts,
  agentUsage,
  agentGenerations,
  agentSessions,
  agentSessionFiles,
  generatedImages,
  upscaledImages,
  aiImgGenerationLogs,
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
  type MaterialCategory,
  type InsertMaterialCategory,
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
  type InsertWebhookConfig,
  type Agent,
  type InsertAgent,
  type AgentPrompt,
  type InsertAgentPrompt,
  type AgentUsage,
  type InsertAgentUsage,
  type AgentGeneration,
  type InsertAgentGeneration,
  type AgentWithPrompts,
  type GeneratedImage,
  type InsertGeneratedImage,
  type UpscaledImage,
  type InsertUpscaledImage,
  type AiImgGenerationLog,
  type InsertAiImgGenerationLog,
  type AgentSession,
  type InsertAgentSession,
  type AgentSessionFile,
  type InsertAgentSessionFile,
  type AgentSessionWithFiles
} from "@shared/schema";
import { db } from "./db";

// Define SupplierReview types
export type SupplierReview = {
  id: number;
  supplierId: number;
  userId: number;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
  userName?: string | null;
};

export type InsertSupplierReview = {
  supplierId: number;
  userId: number;
  rating: number;
  comment: string;
  isApproved?: boolean;
};
import { eq, ilike, and, or, desc, asc, sql, count } from "drizzle-orm";

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
  getSuppliersWithPagination(options: {
    limit: number;
    offset: number;
    search?: string;
    categoryId?: number;
    sortBy?: string;
  }): Promise<{
    suppliers: Supplier[];
    total: number;
  }>;
  
  // Supplier Reviews
  getSupplierReviews(supplierId: number): Promise<any[]>;
  createSupplierReview(review: any): Promise<any>;

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

  // Material Categories
  getMaterialCategories(): Promise<MaterialCategory[]>;
  createMaterialCategory(category: InsertMaterialCategory): Promise<MaterialCategory>;
  updateMaterialCategory(id: number, category: Partial<InsertMaterialCategory>): Promise<MaterialCategory>;
  deleteMaterialCategory(id: number): Promise<void>;

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

  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  getAgentWithPrompts(id: string): Promise<AgentWithPrompts | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent>;
  deleteAgent(id: string): Promise<void>;

  // Agent Prompts
  getAgentPrompts(agentId: string): Promise<AgentPrompt[]>;
  getAgentPrompt(id: string): Promise<AgentPrompt | undefined>;
  createAgentPrompt(prompt: InsertAgentPrompt): Promise<AgentPrompt>;
  updateAgentPrompt(id: string, prompt: Partial<InsertAgentPrompt>): Promise<AgentPrompt>;
  deleteAgentPrompt(id: string): Promise<void>;

  // Agent Usage
  getAgentUsage(agentId: string): Promise<AgentUsage[]>;
  createAgentUsage(usage: InsertAgentUsage): Promise<AgentUsage>;

  // Agent Generations
  createAgentGeneration(generation: InsertAgentGeneration): Promise<AgentGeneration>;

  // Agent Sessions
  createAgentSession(session: InsertAgentSession): Promise<AgentSession>;
  getAgentSessionByHash(sessionHash: string): Promise<AgentSessionWithFiles | null>;
  updateAgentSession(id: string, updates: Partial<InsertAgentSession>): Promise<AgentSession>;
  getUserAgentSessions(userId: string, agentType?: string, status?: string): Promise<AgentSession[]>;

  // Agent Session Files
  createAgentSessionFile(file: InsertAgentSessionFile): Promise<AgentSessionFile>;
  getAgentSessionFiles(sessionId: string): Promise<AgentSessionFile[]>;
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
    return await db.query.suppliers.findMany({
      with: {
        category: true,
        brands: true,
        contacts: true,
        files: true,
        reviews: true
      }
    });
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

  async getSuppliersWithPagination(options: {
    limit: number;
    offset: number;
    search?: string;
    categoryId?: number;
    sortBy?: string;
  }): Promise<{
    suppliers: Supplier[];
    total: number;
  }> {
    const { limit, offset, search, categoryId, sortBy = 'name' } = options;
    
    // Build where conditions
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(suppliers.tradeName, `%${search}%`),
          ilike(suppliers.corporateName, `%${search}%`),
          ilike(suppliers.description, `%${search}%`)
        )
      );
    }
    if (categoryId) {
      conditions.push(eq(suppliers.categoryId, categoryId));
    }

    // Build order by
    let orderBy;
    switch (sortBy) {
      case 'name_desc':
        orderBy = desc(suppliers.tradeName);
        break;
      case 'rating':
        // For now, order by tradeName since we don't have ratings in suppliers table
        orderBy = asc(suppliers.tradeName);
        break;
      case 'rating_desc':
        orderBy = desc(suppliers.tradeName);
        break;
      case 'recent':
        orderBy = desc(suppliers.createdAt);
        break;
      default:
        orderBy = asc(suppliers.tradeName);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get suppliers with pagination
    const suppliersQuery = db
      .select()
      .from(suppliers)
      .limit(limit)
      .offset(offset)
      .orderBy(orderBy);

    if (whereClause) {
      suppliersQuery.where(whereClause);
    }

    const suppliersList = await suppliersQuery;

    // Get total count
    const countQuery = db
      .select({ count: count() })
      .from(suppliers);

    if (whereClause) {
      countQuery.where(whereClause);
    }

    const [{ count: total }] = await countQuery;

    // Add category name and review stats to suppliers
    const suppliersWithStats = await Promise.all(
      suppliersList.map(async (supplier) => {
        // Get category name
        let categoryName = undefined;
        if (supplier.categoryId) {
          const [category] = await db
            .select()
            .from(categories)
            .where(eq(categories.id, supplier.categoryId));
          categoryName = category?.name;
        }

        // Get actual rating data from supplier reviews
        const reviews = await this.getSupplierReviews(supplier.id);
        const approvedReviews = reviews.filter(r => r.isApproved);
        const averageRating = approvedReviews.length > 0 
          ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / approvedReviews.length 
          : 0;
        const totalReviews = approvedReviews.length;

        return {
          ...supplier,
          categoryName,
          averageRating: averageRating.toFixed(1),
          totalReviews,
        };
      })
    );

    return {
      suppliers: suppliersWithStats,
      total,
    };
  }

  // Supplier Reviews
  async getSupplierReviews(supplierId: number): Promise<SupplierReview[]> {
    const reviews = await db
      .select({
        id: supplierReviews.id,
        supplierId: supplierReviews.supplierId,
        userId: supplierReviews.userId,
        rating: supplierReviews.rating,
        comment: supplierReviews.comment,
        isApproved: supplierReviews.isApproved,
        createdAt: supplierReviews.createdAt,
        userName: users.name || undefined,
      })
      .from(supplierReviews)
      .leftJoin(users, eq(supplierReviews.userId, users.id))
      .where(eq(supplierReviews.supplierId, supplierId))
      .orderBy(desc(supplierReviews.createdAt));

    return reviews;
  }

  async createSupplierReview(review: InsertSupplierReview): Promise<SupplierReview> {
    const [created] = await db
      .insert(supplierReviews)
      .values({
        ...review,
        createdAt: new Date(),
      })
      .returning();
    return created;
  }

  // Supplier Brands
  async getSupplierBrands(supplierId: number) {
    return await db
      .select()
      .from(supplierBrands)
      .where(eq(supplierBrands.supplierId, supplierId))
      .orderBy(supplierBrands.name);
  }

  async createSupplierBrand(brandData: any) {
    const [created] = await db
      .insert(supplierBrands)
      .values({
        ...brandData,
        createdAt: new Date(),
      })
      .returning();
    return created;
  }

  async deleteSupplierBrand(brandId: number) {
    await db
      .delete(supplierBrands)
      .where(eq(supplierBrands.id, brandId));
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
        categoryId: materials.categoryId,
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
      categoryId: row.categoryId,
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
        categoryId: materials.categoryId,
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
      categoryId: row.categoryId,
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

  // Material Categories
  async getMaterialCategories(): Promise<MaterialCategory[]> {
    const results = await db.select().from(materialCategories).orderBy(materialCategories.name);
    return results;
  }

  async createMaterialCategory(category: InsertMaterialCategory): Promise<MaterialCategory> {
    const [result] = await db.insert(materialCategories).values(category).returning();
    return result;
  }

  async updateMaterialCategory(id: number, category: Partial<InsertMaterialCategory>): Promise<MaterialCategory> {
    const [result] = await db
      .update(materialCategories)
      .set(category)
      .where(eq(materialCategories.id, id))
      .returning();
    return result;
  }

  async deleteMaterialCategory(id: number): Promise<void> {
    await db.delete(materialCategories).where(eq(materialCategories.id, id));
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
          password: users.password || '',
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
              password: users.password || '',
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

  // Agents
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents).where(eq(agents.isActive, true));
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent || undefined;
  }

  async getAgentWithPrompts(id: string): Promise<AgentWithPrompts | undefined> {
    const agent = await this.getAgent(id);
    if (!agent) return undefined;

    const prompts = await this.getAgentPrompts(id);
    return { ...agent, prompts };
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [created] = await db
      .insert(agents)
      .values({
        ...agent,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent> {
    const [updated] = await db
      .update(agents)
      .set({
        ...agent,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, id))
      .returning();
    return updated;
  }

  async deleteAgent(id: string): Promise<void> {
    await db.delete(agents).where(eq(agents.id, id));
  }

  // Agent Prompts
  async getAgentPrompts(agentId: string): Promise<AgentPrompt[]> {
    return await db
      .select()
      .from(agentPrompts)
      .where(and(eq(agentPrompts.agentId, agentId), eq(agentPrompts.isActive, true)))
      .orderBy(agentPrompts.promptType);
  }

  async getAgentPrompt(id: string): Promise<AgentPrompt | undefined> {
    const [prompt] = await db.select().from(agentPrompts).where(eq(agentPrompts.id, id));
    return prompt || undefined;
  }

  async createAgentPrompt(prompt: InsertAgentPrompt): Promise<AgentPrompt> {
    const [created] = await db
      .insert(agentPrompts)
      .values({
        ...prompt,
        createdAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateAgentPrompt(id: string, prompt: Partial<InsertAgentPrompt>): Promise<AgentPrompt> {
    const [updated] = await db
      .update(agentPrompts)
      .set(prompt)
      .where(eq(agentPrompts.id, id))
      .returning();
    return updated;
  }

  async deleteAgentPrompt(id: string): Promise<void> {
    await db.delete(agentPrompts).where(eq(agentPrompts.id, id));
  }

  // Agent Usage
  async getAgentUsage(agentId: string): Promise<AgentUsage[]> {
    return await db
      .select()
      .from(agentUsage)
      .where(eq(agentUsage.agentId, agentId))
      .orderBy(desc(agentUsage.createdAt));
  }

  async createAgentUsage(usage: InsertAgentUsage): Promise<AgentUsage> {
    const [created] = await db
      .insert(agentUsage)
      .values({
        ...usage,
        createdAt: new Date(),
      })
      .returning();
    return created;
  }

  // Agent Generations
  async createAgentGeneration(generation: InsertAgentGeneration): Promise<AgentGeneration> {
    const [created] = await db
      .insert(agentGenerations)
      .values({
        ...generation,
        createdAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateAgentGeneration(id: string, updates: Partial<InsertAgentGeneration>): Promise<AgentGeneration> {
    const [updated] = await db
      .update(agentGenerations)
      .set(updates)
      .where(eq(agentGenerations.id, id))
      .returning();
    return updated;
  }

  async getAgentGeneration(id: string): Promise<AgentGeneration | undefined> {
    const [generation] = await db
      .select()
      .from(agentGenerations)
      .where(eq(agentGenerations.id, id));
    return generation || undefined;
  }

  // Generated Images
  async createGeneratedImage(image: InsertGeneratedImage): Promise<GeneratedImage> {
    const [created] = await db
      .insert(generatedImages)
      .values({
        ...image,
        createdAt: new Date(),
      })
      .returning();
    return created;
  }

  async getGeneratedImageById(id: string): Promise<GeneratedImage | null> {
    const [image] = await db
      .select()
      .from(generatedImages)
      .where(eq(generatedImages.id, id));
    return image || null;
  }

  async deleteGeneratedImage(id: string): Promise<boolean> {
    const result = await db
      .delete(generatedImages)
      .where(eq(generatedImages.id, id));
    return result.rowCount > 0;
  }

  // Upscaled Images
  async createUpscaledImage(image: InsertUpscaledImage): Promise<UpscaledImage> {
    const [created] = await db
      .insert(upscaledImages)
      .values({
        ...image,
        createdAt: new Date(),
      })
      .returning();
    return created;
  }

  async getUserUpscaledImages(userId: number): Promise<UpscaledImage[]> {
    return await db
      .select()
      .from(upscaledImages)
      .where(eq(upscaledImages.userId, userId))
      .orderBy(desc(upscaledImages.createdAt));
  }

  async getUpscaledImageById(id: string): Promise<UpscaledImage | null> {
    const [image] = await db
      .select()
      .from(upscaledImages)
      .where(eq(upscaledImages.id, id));
    return image || null;
  }

  async deleteUpscaledImage(id: string, userId: number): Promise<boolean> {
    const result = await db
      .delete(upscaledImages)
      .where(and(
        eq(upscaledImages.id, id),
        eq(upscaledImages.userId, userId)
      ));
    return result.rowCount > 0;
  }

  // AI Image Generation Logs
  async createAiImgGenerationLog(log: InsertAiImgGenerationLog): Promise<AiImgGenerationLog> {
    const [created] = await db
      .insert(aiImgGenerationLogs)
      .values({
        ...log,
        createdAt: new Date(),
      })
      .returning();
    return created;
  }

  async getAiImgGenerationLogs(options: {
    userId?: number;
    provider?: string;
    feature?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<AiImgGenerationLog[]> {
    const { userId, provider, feature, status, limit = 50, offset = 0 } = options;
    
    const conditions = [];
    if (userId) conditions.push(eq(aiImgGenerationLogs.userId, userId));
    if (provider) conditions.push(eq(aiImgGenerationLogs.provider, provider));
    if (feature) conditions.push(eq(aiImgGenerationLogs.feature, feature));
    if (status) conditions.push(eq(aiImgGenerationLogs.status, status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const query = db
      .select({
        id: aiImgGenerationLogs.id,
        userId: aiImgGenerationLogs.userId,
        provider: aiImgGenerationLogs.provider,
        model: aiImgGenerationLogs.model,
        feature: aiImgGenerationLogs.feature,
        originalImageName: aiImgGenerationLogs.originalImageName,
        quality: aiImgGenerationLogs.quality,
        scale: aiImgGenerationLogs.scale,
        cost: aiImgGenerationLogs.cost,
        duration: aiImgGenerationLogs.duration,
        status: aiImgGenerationLogs.status,
        createdAt: aiImgGenerationLogs.createdAt,
        ipAddress: aiImgGenerationLogs.ipAddress,
        userAgent: aiImgGenerationLogs.userAgent
      })
      .from(aiImgGenerationLogs)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(aiImgGenerationLogs.createdAt));

    if (whereClause) {
      query.where(whereClause);
    }

    return await query;
  }

  async getAiImgGenerationLogById(id: number): Promise<AiImgGenerationLog | null> {
    const [log] = await db
      .select()
      .from(aiImgGenerationLogs)
      .where(eq(aiImgGenerationLogs.id, id));
    return log || null;
  }

  async getAiImgGenerationStats(options: {
    userId?: number;
    provider?: string;
    feature?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<{
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    totalCost: number;
    averageDuration: number;
    topProviders: Array<{ provider: string; count: number; cost: number }>;
    topFeatures: Array<{ feature: string; count: number; cost: number }>;
  }> {
    const { userId, provider, feature, dateFrom, dateTo } = options;
    
    const conditions = [];
    if (userId) conditions.push(eq(aiImgGenerationLogs.userId, userId));
    if (provider) conditions.push(eq(aiImgGenerationLogs.provider, provider));
    if (feature) conditions.push(eq(aiImgGenerationLogs.feature, feature));
    if (dateFrom) conditions.push(sql`${aiImgGenerationLogs.createdAt} >= ${dateFrom}`);
    if (dateTo) conditions.push(sql`${aiImgGenerationLogs.createdAt} <= ${dateTo}`);

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get basic stats
    const baseQuery = db.select({
      totalRequests: count(),
      successfulRequests: sql<number>`count(case when ${aiImgGenerationLogs.status} = 'success' then 1 end)`,
      failedRequests: sql<number>`count(case when ${aiImgGenerationLogs.status} = 'failed' then 1 end)`,
      totalCost: sql<number>`sum(${aiImgGenerationLogs.cost})`,
      averageDuration: sql<number>`avg(${aiImgGenerationLogs.duration})`,
    }).from(aiImgGenerationLogs);

    if (whereClause) {
      baseQuery.where(whereClause);
    }

    const [stats] = await baseQuery;

    // Get top providers
    const providersQuery = db.select({
      provider: aiImgGenerationLogs.provider,
      count: count(),
      cost: sql<number>`sum(${aiImgGenerationLogs.cost})`,
    }).from(aiImgGenerationLogs)
      .groupBy(aiImgGenerationLogs.provider)
      .orderBy(desc(count()));

    if (whereClause) {
      providersQuery.where(whereClause);
    }

    const topProviders = await providersQuery;

    // Get top features
    const featuresQuery = db.select({
      feature: aiImgGenerationLogs.feature,
      count: count(),
      cost: sql<number>`sum(${aiImgGenerationLogs.cost})`,
    }).from(aiImgGenerationLogs)
      .groupBy(aiImgGenerationLogs.feature)
      .orderBy(desc(count()));

    if (whereClause) {
      featuresQuery.where(whereClause);
    }

    const topFeatures = await featuresQuery;

    return {
      totalRequests: stats.totalRequests || 0,
      successfulRequests: stats.successfulRequests || 0,
      failedRequests: stats.failedRequests || 0,
      totalCost: Number(stats.totalCost) || 0,
      averageDuration: Number(stats.averageDuration) || 0,
      topProviders,
      topFeatures,
    };
  }

  // Agent Sessions
  async createAgentSession(session: InsertAgentSession): Promise<AgentSession> {
    const [created] = await db
      .insert(agentSessions)
      .values({
        ...session,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async getAgentSessionByHash(sessionHash: string): Promise<AgentSessionWithFiles | null> {
    const [session] = await db
      .select()
      .from(agentSessions)
      .where(eq(agentSessions.sessionHash, sessionHash));
    
    if (!session) return null;

    const files = await db
      .select()
      .from(agentSessionFiles)
      .where(eq(agentSessionFiles.sessionId, session.id));

    return { ...session, files };
  }

  async updateAgentSession(id: string, updates: Partial<InsertAgentSession>): Promise<AgentSession> {
    const [updated] = await db
      .update(agentSessions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(agentSessions.id, id))
      .returning();
    return updated;
  }

  async getUserAgentSessions(userId: string, agentType?: string, status?: string): Promise<AgentSession[]> {
    const conditions = [eq(agentSessions.userId, userId)];
    
    if (agentType) {
      conditions.push(eq(agentSessions.agentType, agentType));
    }
    
    if (status) {
      conditions.push(eq(agentSessions.status, status));
    }

    return await db
      .select()
      .from(agentSessions)
      .where(and(...conditions))
      .orderBy(desc(agentSessions.createdAt));
  }

  // Agent Session Files
  async createAgentSessionFile(file: InsertAgentSessionFile): Promise<AgentSessionFile> {
    const [created] = await db
      .insert(agentSessionFiles)
      .values({
        ...file,
        uploadedAt: new Date(),
      })
      .returning();
    return created;
  }

  async getAgentSessionFiles(sessionId: string): Promise<AgentSessionFile[]> {
    return await db
      .select()
      .from(agentSessionFiles)
      .where(eq(agentSessionFiles.sessionId, sessionId))
      .orderBy(desc(agentSessionFiles.uploadedAt));
  }
}

export const storage = new DatabaseStorage();
