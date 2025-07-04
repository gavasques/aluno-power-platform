import { db } from "../db";
import { 
  productChannels,
  userSettings,
  amazonFreightRates,
  categoryCommissions,
  departments,
  products,
  type Product,
  type ProductChannel,
  type UserSettings,
  type CalculationResult,
  type CostBreakdown,
  type ChannelCosts,
  type ChannelType,
  CHANNEL_TYPES
} from "@shared/schema";
import { eq, and, lte, gte, or, isNull } from "drizzle-orm";

export class ProductPricingService {
  
  /**
   * Calcula o preço e margem para um produto em um canal específico
   */
  async calculatePricing(
    productId: number,
    channelType: ChannelType,
    salePrice: number,
    userId: number,
    customCosts?: ChannelCosts
  ): Promise<CalculationResult> {
    
    // Buscar dados do produto
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, productId));
    
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // Buscar configurações do usuário
    const [userConfig] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    // Calcular custos base
    const baseCost = parseFloat(product.costItem || '0');
    const packagingCost = parseFloat(product.packCost || '0');
    const taxPercentage = parseFloat(product.taxPercent || userConfig?.taxPercentage || '0');

    // Calcular frete (se aplicável para canais Amazon)
    let freightCost = 0;
    if (channelType.startsWith('amazon_') && userConfig?.state) {
      freightCost = await this.calculateFreightCost(
        channelType,
        parseFloat(product.weight || '0'),
        userConfig.state
      );
    }

    // Usar custo customizado de frete se fornecido
    if (customCosts?.freightCost !== undefined) {
      freightCost = customCosts.freightCost;
    }

    // Calcular comissão do marketplace
    let commissionCost = 0;
    if (customCosts?.commissionOverride !== undefined) {
      commissionCost = (salePrice * customCosts.commissionOverride) / 100;
    } else {
      const commissionRate = await this.getCommissionRate(channelType, salePrice, product.category);
      commissionCost = (salePrice * commissionRate) / 100;
    }

    // Calcular custo de ads
    const adsPercentage = customCosts?.adsPercentage || 0;
    const adsCost = (salePrice * adsPercentage) / 100;

    // Prep center (para Amazon FBA)
    const prepCenterCost = customCosts?.prepCenterCost || 0;

    // Outros custos
    let otherCosts = 0;
    if (customCosts?.otherCostPercentage) {
      otherCosts = (salePrice * customCosts.otherCostPercentage) / 100;
    } else if (customCosts?.otherCostValue) {
      otherCosts = customCosts.otherCostValue;
    }

    // Calcular impostos
    const taxCost = (salePrice * taxPercentage) / 100;

    // Calcular totais
    const totalCost = baseCost + packagingCost + freightCost + commissionCost + 
                     adsCost + prepCenterCost + otherCosts + taxCost;
    
    const profit = salePrice - totalCost;
    const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    const roi = baseCost > 0 ? (profit / baseCost) * 100 : 0;

    const breakdown: CostBreakdown = {
      baseCost,
      packagingCost,
      freightCost,
      commissionCost,
      adsCost,
      prepCenterCost,
      otherCosts,
      taxCost,
      totalCost
    };

    return {
      profit,
      margin,
      roi,
      totalCost,
      breakdown
    };
  }

  /**
   * Calcula o custo de frete baseado no peso e estado
   */
  private async calculateFreightCost(
    channelType: ChannelType,
    weight: number,
    state: string
  ): Promise<number> {
    
    // Mapear tipo de canal para tipo de serviço
    let serviceType: string;
    switch (channelType) {
      case 'amazon_fba':
        serviceType = 'FBA';
        break;
      case 'amazon_dba':
        serviceType = 'DBA';
        break;
      default:
        return 0; // Sem frete para outros canais
    }

    const [freightRate] = await db
      .select()
      .from(amazonFreightRates)
      .where(
        and(
          eq(amazonFreightRates.state, state),
          eq(amazonFreightRates.serviceType, serviceType),
          lte(amazonFreightRates.weightFrom, weight),
          or(
            gte(amazonFreightRates.weightTo, weight),
            isNull(amazonFreightRates.weightTo)
          ),
          eq(amazonFreightRates.isActive, true)
        )
      );

    return freightRate ? parseFloat(freightRate.price) : 0;
  }

  /**
   * Busca a taxa de comissão para o canal e categoria
   */
  private async getCommissionRate(
    channelType: ChannelType,
    salePrice: number,
    category?: string | null
  ): Promise<number> {
    
    // Buscar categoria por nome se fornecida
    let categoryId: number | undefined;
    if (category) {
      const [dept] = await db
        .select()
        .from(departments)
        .where(eq(departments.name, category));
      categoryId = dept?.id;
    }

    if (!categoryId) {
      // Taxas padrão por canal se categoria não encontrada
      const defaultRates: Record<ChannelType, number> = {
        amazon_fba: 15,
        amazon_fbm: 15,
        amazon_dba: 8,
        mercadolivre_me1: 16,
        mercadolivre_flex: 12,
        site_proprio: 0
      };
      return defaultRates[channelType] || 0;
    }

    const [commission] = await db
      .select()
      .from(categoryCommissions)
      .where(
        and(
          eq(categoryCommissions.categoryId, categoryId),
          eq(categoryCommissions.channelType, channelType),
          lte(categoryCommissions.priceFrom, salePrice),
          or(
            gte(categoryCommissions.priceTo, salePrice),
            isNull(categoryCommissions.priceTo)
          ),
          eq(categoryCommissions.isActive, true)
        )
      );

    return commission ? parseFloat(commission.commissionPercentage) : 0;
  }

  /**
   * Salva uma configuração de canal para um produto
   */
  async saveProductChannel(
    productId: number,
    userId: number,
    channelType: ChannelType,
    salePrice: number,
    customCosts?: ChannelCosts
  ): Promise<ProductChannel> {
    
    // Calcular o resultado para cache
    const calculation = await this.calculatePricing(
      productId,
      channelType,
      salePrice,
      userId,
      customCosts
    );

    // Verificar se já existe configuração para este canal
    const [existing] = await db
      .select()
      .from(productChannels)
      .where(
        and(
          eq(productChannels.productId, productId),
          eq(productChannels.userId, userId),
          eq(productChannels.channelType, channelType)
        )
      );

    if (existing) {
      // Atualizar existente
      const [updated] = await db
        .update(productChannels)
        .set({
          salePrice: salePrice.toString(),
          customCosts: customCosts || null,
          lastCalculation: calculation,
          updatedAt: new Date()
        })
        .where(eq(productChannels.id, existing.id))
        .returning();
      
      return updated;
    } else {
      // Criar novo
      const [created] = await db
        .insert(productChannels)
        .values({
          productId,
          userId,
          channelType,
          salePrice: salePrice.toString(),
          customCosts: customCosts || null,
          lastCalculation: calculation
        })
        .returning();
      
      return created;
    }
  }

  /**
   * Busca todas as configurações de canal de um produto
   */
  async getProductChannels(
    productId: number,
    userId: number
  ): Promise<ProductChannel[]> {
    
    return await db
      .select()
      .from(productChannels)
      .where(
        and(
          eq(productChannels.productId, productId),
          eq(productChannels.userId, userId),
          eq(productChannels.isActive, true)
        )
      );
  }

  /**
   * Remove uma configuração de canal
   */
  async removeProductChannel(
    productId: number,
    userId: number,
    channelType: ChannelType
  ): Promise<void> {
    
    await db
      .update(productChannels)
      .set({
        isActive: false,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(productChannels.productId, productId),
          eq(productChannels.userId, userId),
          eq(productChannels.channelType, channelType)
        )
      );
  }

  /**
   * Busca ou cria configurações do usuário
   */
  async getUserSettings(userId: number): Promise<UserSettings | null> {
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));
    
    return settings || null;
  }

  /**
   * Atualiza configurações do usuário
   */
  async updateUserSettings(
    userId: number,
    settings: Partial<UserSettings>
  ): Promise<UserSettings> {
    
    const existing = await this.getUserSettings(userId);
    
    if (existing) {
      const [updated] = await db
        .update(userSettings)
        .set({
          ...settings,
          updatedAt: new Date()
        })
        .where(eq(userSettings.userId, userId))
        .returning();
      
      return updated;
    } else {
      const [created] = await db
        .insert(userSettings)
        .values({
          userId,
          ...settings
        })
        .returning();
      
      return created;
    }
  }

  /**
   * Lista todos os tipos de canal disponíveis
   */
  getAvailableChannelTypes(): Array<{type: ChannelType, name: string}> {
    return Object.entries(CHANNEL_TYPES).map(([type, name]) => ({
      type: type as ChannelType,
      name
    }));
  }
}

export const productPricingService = new ProductPricingService();