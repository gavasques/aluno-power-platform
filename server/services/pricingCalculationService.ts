import { db } from "../db";
import { 
  userPricingSettings,
  amazonFreightRates,
  mercadolivreFreightRates,
  categoryCommissions,
  type UserProduct,
  type ChannelCalculation
} from "@shared/schema";
import { eq, and, gte, lte, or, isNull } from "drizzle-orm";

export class PricingCalculationService {
  
  // Calcular peso cubado
  private calculateCubicWeight(length: number, width: number, height: number): number {
    return (length * width * height) / 6000; // cm³ para kg
  }

  // Calcular peso cobrável (maior entre peso real e peso cubado)
  private calculateBillableWeight(weight: number, length: number, width: number, height: number): number {
    const cubicWeight = this.calculateCubicWeight(length, width, height);
    return Math.max(weight, cubicWeight);
  }

  // Buscar configurações do usuário
  private async getUserSettings(userId: number) {
    const settings = await db.query.userPricingSettings.findFirst({
      where: eq(userPricingSettings.userId, userId)
    });

    // Configurações padrão se não existir
    if (!settings) {
      return {
        state: 'SP',
        taxPercentage: 0,
        adSpendPercentage: 10,
        activeChannels: ['amazon_fba', 'amazon_fbm', 'mercadolivre_me1']
      };
    }

    return settings;
  }

  // Calcular frete Amazon
  private async calculateAmazonFreight(
    product: UserProduct, 
    state: string, 
    serviceType: 'fba' | 'fbm' | 'dba'
  ): Promise<number> {
    if (!product.weight || !product.length || !product.width || !product.height) {
      return 0;
    }

    const billableWeight = this.calculateBillableWeight(
      parseFloat(product.weight.toString()),
      parseFloat(product.length.toString()),
      parseFloat(product.width.toString()),
      parseFloat(product.height.toString())
    );

    const freightRate = await db.query.amazonFreightRates.findFirst({
      where: and(
        eq(amazonFreightRates.state, state),
        eq(amazonFreightRates.serviceType, serviceType),
        gte(amazonFreightRates.weightTo, billableWeight),
        lte(amazonFreightRates.weightFrom, billableWeight),
        eq(amazonFreightRates.isActive, true)
      )
    });

    return freightRate ? parseFloat(freightRate.price.toString()) : 0;
  }

  // Calcular frete Mercado Livre
  private async calculateMercadolivreFreight(
    product: UserProduct, 
    state: string, 
    serviceType: 'me1' | 'flex' | 'envios'
  ): Promise<number> {
    if (!product.weight || !product.length || !product.width || !product.height) {
      return 0;
    }

    const billableWeight = this.calculateBillableWeight(
      parseFloat(product.weight.toString()),
      parseFloat(product.length.toString()),
      parseFloat(product.width.toString()),
      parseFloat(product.height.toString())
    );

    const freightRate = await db.query.mercadolivreFreightRates.findFirst({
      where: and(
        eq(mercadolivreFreightRates.state, state),
        eq(mercadolivreFreightRates.serviceType, serviceType),
        gte(mercadolivreFreightRates.weightTo, billableWeight),
        lte(mercadolivreFreightRates.weightFrom, billableWeight),
        eq(mercadolivreFreightRates.isActive, true)
      )
    });

    return freightRate ? parseFloat(freightRate.price.toString()) : 0;
  }

  // Calcular comissão por categoria
  private async calculateCommission(
    categoryId: number | null, 
    channelType: string, 
    salePrice: number
  ): Promise<number> {
    if (!categoryId) return 0;

    const commission = await db.query.categoryCommissions.findFirst({
      where: and(
        eq(categoryCommissions.categoryId, categoryId),
        eq(categoryCommissions.channelType, channelType),
        or(
          and(
            gte(categoryCommissions.priceTo, salePrice),
            lte(categoryCommissions.priceFrom, salePrice)
          ),
          isNull(categoryCommissions.priceTo)
        ),
        eq(categoryCommissions.isActive, true)
      )
    });

    if (!commission) return 0;

    const percentage = parseFloat(commission.commissionPercentage.toString());
    return (salePrice * percentage) / 100;
  }

  // Calcular para um canal específico
  async calculateChannelPricing(
    product: UserProduct,
    channelType: string,
    salePrice: number,
    userId: number
  ): Promise<ChannelCalculation> {
    try {
      const userSettings = await this.getUserSettings(userId);
      
      // Custos base
      const baseCost = parseFloat(product.baseCost.toString());
      const packagingCost = product.packagingCost ? parseFloat(product.packagingCost.toString()) : 0;

      // Calcular frete baseado no canal
      let freightCost = 0;
      let commissionChannelType = '';

      switch (channelType) {
        case 'amazon_fba':
          freightCost = await this.calculateAmazonFreight(product, userSettings.state, 'fba');
          commissionChannelType = 'amazon';
          break;
        case 'amazon_fbm':
          freightCost = 0; // FBM não tem frete
          commissionChannelType = 'amazon';
          break;
        case 'amazon_dba':
          freightCost = await this.calculateAmazonFreight(product, userSettings.state, 'dba');
          commissionChannelType = 'amazon';
          break;
        case 'mercadolivre_me1':
          freightCost = await this.calculateMercadolivreFreight(product, userSettings.state, 'me1');
          commissionChannelType = 'mercadolivre';
          break;
        case 'mercadolivre_flex':
          freightCost = await this.calculateMercadolivreFreight(product, userSettings.state, 'flex');
          commissionChannelType = 'mercadolivre';
          break;
        case 'site_proprio':
          freightCost = 0; // Site próprio sem frete ou calculado separadamente
          commissionChannelType = 'site_proprio';
          break;
        default:
          freightCost = 0;
          commissionChannelType = 'other';
      }

      // Calcular comissão
      const commissionCost = await this.calculateCommission(
        product.categoryId,
        commissionChannelType,
        salePrice
      );

      // Calcular impostos
      const taxPercentage = userSettings.taxPercentage || 0;
      const taxCost = (salePrice * taxPercentage) / 100;

      // Calcular custo de anúncios
      const adSpendPercentage = userSettings.adSpendPercentage || 10;
      const adCost = (salePrice * adSpendPercentage) / 100;

      // Custo total
      const totalCost = baseCost + packagingCost + freightCost + commissionCost + taxCost + adCost;

      // Lucro
      const profit = salePrice - totalCost;

      // Margem (%)
      const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

      // ROI (%)
      const investment = baseCost + freightCost;
      const roi = investment > 0 ? (profit / investment) * 100 : 0;

      // Verificar se o canal está ativo
      const activeChannels = userSettings.activeChannels || [];
      const isActive = Array.isArray(activeChannels) ? activeChannels.includes(channelType) : true;

      return {
        channelType,
        salePrice,
        freightCost,
        commissionCost,
        taxCost,
        adCost,
        totalCost,
        profit,
        margin: Math.round(margin * 100) / 100, // 2 casas decimais
        roi: Math.round(roi * 100) / 100, // 2 casas decimais
        isActive
      };

    } catch (error) {
      console.error(`Error calculating pricing for channel ${channelType}:`, error);
      throw new Error(`Failed to calculate pricing for channel ${channelType}`);
    }
  }

  // Calcular para todos os canais disponíveis
  async calculateAllChannelsPricing(
    product: UserProduct,
    salePrices: Record<string, number>,
    userId: number
  ): Promise<ChannelCalculation[]> {
    const channels = [
      'amazon_fba',
      'amazon_fbm', 
      'amazon_dba',
      'mercadolivre_me1',
      'mercadolivre_flex',
      'site_proprio'
    ];

    const calculations: ChannelCalculation[] = [];

    for (const channel of channels) {
      const salePrice = salePrices[channel] || 0;
      if (salePrice > 0) {
        try {
          const calculation = await this.calculateChannelPricing(
            product,
            channel,
            salePrice,
            userId
          );
          calculations.push(calculation);
        } catch (error) {
          console.error(`Error calculating ${channel}:`, error);
          // Continue com outros canais mesmo se um falhar
        }
      }
    }

    return calculations;
  }

  // Salvar configurações do usuário
  async saveUserPricingSettings(userId: number, settings: {
    state: string;
    taxPercentage: number;
    adSpendPercentage: number;
    activeChannels: string[];
  }) {
    try {
      await db
        .insert(userPricingSettings)
        .values({
          userId,
          ...settings,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: userPricingSettings.userId,
          set: {
            ...settings,
            updatedAt: new Date()
          }
        });

      return true;
    } catch (error) {
      console.error("Error saving user pricing settings:", error);
      throw new Error("Failed to save pricing settings");
    }
  }
}

export const pricingCalculationService = new PricingCalculationService();