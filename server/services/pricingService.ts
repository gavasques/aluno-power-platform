import { db } from "../db";
import { 
  states, 
  amazonFreightRates, 
  channelCommissions, 
  availableChannels,
  userSettings,
  userActiveChannels,
  productChannelConfigs,
  calculationLogs,
  products,
  departments
} from "@shared/schema";
import { 
  PricingCalculationInput, 
  DetailedCalculationResult, 
  PricingCalculationStep,
  FreightRateQuery,
  CommissionRateQuery 
} from "@shared/types";
import { eq, and, gte, lte, or, isNull } from "drizzle-orm";

export class PricingService {
  
  // Buscar taxa de frete por estado, serviço e peso
  async getFreightRate(query: FreightRateQuery): Promise<number> {
    const rates = await db
      .select()
      .from(amazonFreightRates)
      .where(
        and(
          eq(amazonFreightRates.stateId, query.stateId),
          eq(amazonFreightRates.serviceType, query.serviceType),
          or(
            and(
              gte(query.weight, amazonFreightRates.weightFrom),
              lte(query.weight, amazonFreightRates.weightTo)
            ),
            isNull(amazonFreightRates.weightTo) // Faixa aberta
          ),
          eq(amazonFreightRates.isActive, true)
        )
      )
      .orderBy(amazonFreightRates.weightFrom)
      .limit(1);

    return rates.length > 0 ? parseFloat(rates[0].price || "0") : 0;
  }

  // Buscar taxa de comissão por categoria, canal e preço
  async getCommissionRate(query: CommissionRateQuery): Promise<number> {
    const rates = await db
      .select()
      .from(channelCommissions)
      .where(
        and(
          eq(channelCommissions.categoryId, query.categoryId),
          eq(channelCommissions.channelType, query.channelType),
          eq(channelCommissions.serviceType, query.serviceType),
          gte(query.salePrice, channelCommissions.priceFrom),
          or(
            lte(query.salePrice, channelCommissions.priceTo),
            isNull(channelCommissions.priceTo) // Faixa aberta
          ),
          eq(channelCommissions.isActive, true)
        )
      )
      .orderBy(channelCommissions.priceFrom)
      .limit(1);

    if (rates.length > 0) {
      const baseRate = parseFloat(rates[0].commissionPercentage || "0") / 100;
      const surcharge = parseFloat(rates[0].noInterestSurcharge || "1");
      return baseRate * surcharge;
    }

    return 0;
  }

  // Obter configurações do usuário
  async getUserSettings(userId: number) {
    const settings = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    return settings.length > 0 ? settings[0] : null;
  }

  // Obter dados do produto
  async getProduct(productId: number) {
    const productResult = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    return productResult.length > 0 ? productResult[0] : null;
  }

  // Obter dados do canal
  async getChannel(channelId: number) {
    const channelResult = await db
      .select()
      .from(availableChannels)
      .where(eq(availableChannels.id, channelId))
      .limit(1);

    return channelResult.length > 0 ? channelResult[0] : null;
  }

  // Calcular preço detalhado com todos os passos
  async calculateDetailedPricing(
    userId: number, 
    input: PricingCalculationInput
  ): Promise<DetailedCalculationResult> {
    const steps: PricingCalculationStep[] = [];
    let totalCost = 0;

    // 1. Obter dados básicos
    const userConfig = await this.getUserSettings(userId);
    const product = await this.getProduct(input.productId);
    const channel = await this.getChannel(input.channelId);

    if (!product) {
      throw new Error("Produto não encontrado");
    }
    if (!channel) {
      throw new Error("Canal não encontrado");
    }

    const salePrice = input.salePrice;
    const baseCost = parseFloat(product.costItem || "0");
    const packCost = parseFloat(product.packCost || "0");
    const productWeight = parseFloat(product.weight || "0");
    const userTaxRate = parseFloat(userConfig?.taxPercentage || "0") / 100;

    // 2. Custo Base do Produto
    totalCost += baseCost;
    steps.push({
      step: "1",
      description: "Custo base do produto",
      calculation: `R$ ${baseCost.toFixed(2)}`,
      value: baseCost
    });

    // 3. Custo de Embalagem
    totalCost += packCost;
    steps.push({
      step: "2",
      description: "Custo de embalagem",
      calculation: `R$ ${packCost.toFixed(2)}`,
      value: packCost
    });

    // 4. Frete de Entrada (se customizado ou calculado)
    let inboundFreight = 0;
    if (input.customCosts?.inboundFreight !== undefined) {
      inboundFreight = input.customCosts.inboundFreight;
      steps.push({
        step: "3",
        description: "Frete de entrada (customizado)",
        calculation: `R$ ${inboundFreight.toFixed(2)}`,
        value: inboundFreight
      });
    } else if (userConfig?.stateId && !input.settings?.customFreightCalculation) {
      // Calcular frete automaticamente baseado no estado do usuário
      inboundFreight = await this.getFreightRate({
        stateId: userConfig.stateId,
        serviceType: channel.serviceType || "FBA",
        weight: productWeight
      });
      steps.push({
        step: "3",
        description: "Frete de entrada (calculado)",
        calculation: `${productWeight}kg × Taxa por peso = R$ ${inboundFreight.toFixed(2)}`,
        value: inboundFreight
      });
    }
    totalCost += inboundFreight;

    // 5. Frete de Saída
    let outboundFreight = 0;
    if (input.customCosts?.outboundFreight !== undefined) {
      outboundFreight = input.customCosts.outboundFreight;
      steps.push({
        step: "4",
        description: "Frete de saída (customizado)",
        calculation: `R$ ${outboundFreight.toFixed(2)}`,
        value: outboundFreight
      });
    }
    totalCost += outboundFreight;

    // 6. Centro de Preparação
    const prepCenter = input.customCosts?.prepCenter || 0;
    if (prepCenter > 0) {
      totalCost += prepCenter;
      steps.push({
        step: "5",
        description: "Centro de preparação",
        calculation: `R$ ${prepCenter.toFixed(2)}`,
        value: prepCenter
      });
    }

    // 7. Custos Fixos
    const fixedCost = input.customCosts?.fixedCost || 0;
    if (fixedCost > 0) {
      totalCost += fixedCost;
      steps.push({
        step: "6",
        description: "Custos fixos",
        calculation: `R$ ${fixedCost.toFixed(2)}`,
        value: fixedCost
      });
    }

    // 8. Comissão do Canal
    let commissionRate = 0;
    let commissionCost = 0;

    if (input.customCosts?.customCommission !== undefined) {
      commissionRate = input.customCosts.customCommission / 100;
      commissionCost = salePrice * commissionRate;
      steps.push({
        step: "7",
        description: "Comissão do canal (customizada)",
        calculation: `R$ ${salePrice.toFixed(2)} × ${(commissionRate * 100).toFixed(2)}% = R$ ${commissionCost.toFixed(2)}`,
        value: commissionCost,
        appliedRate: commissionRate * 100
      });
    } else {
      // Buscar categoria do produto para calcular comissão
      const categoryId = 1; // Default - deveria buscar pela categoria do produto
      commissionRate = await this.getCommissionRate({
        categoryId,
        channelType: channel.channelType || "amazon",
        serviceType: channel.serviceType || "FBA",
        salePrice
      });
      
      // Aplicar sobretaxa de parcelamento sem juros se configurado
      if (input.settings?.useNoInterestSurcharge) {
        commissionRate *= 1.01; // +1%
      }

      commissionCost = salePrice * commissionRate;
      steps.push({
        step: "7",
        description: "Comissão do canal (calculada)",
        calculation: `R$ ${salePrice.toFixed(2)} × ${(commissionRate * 100).toFixed(2)}% = R$ ${commissionCost.toFixed(2)}`,
        value: commissionCost,
        appliedRate: commissionRate * 100
      });
    }
    totalCost += commissionCost;

    // 9. Impostos
    const taxCost = salePrice * userTaxRate;
    if (taxCost > 0) {
      totalCost += taxCost;
      steps.push({
        step: "8",
        description: "Impostos",
        calculation: `R$ ${salePrice.toFixed(2)} × ${(userTaxRate * 100).toFixed(2)}% = R$ ${taxCost.toFixed(2)}`,
        value: taxCost,
        appliedRate: userTaxRate * 100
      });
    }

    // 10. Custo de Anúncios
    let adsCost = 0;
    if (input.customCosts?.adsPercentage) {
      const adsRate = input.customCosts.adsPercentage / 100;
      adsCost = salePrice * adsRate;
      totalCost += adsCost;
      steps.push({
        step: "9",
        description: "Custo de anúncios",
        calculation: `R$ ${salePrice.toFixed(2)} × ${input.customCosts.adsPercentage.toFixed(2)}% = R$ ${adsCost.toFixed(2)}`,
        value: adsCost,
        appliedRate: input.customCosts.adsPercentage
      });
    }

    // 11. Outros Custos
    let otherCosts = 0;
    if (input.customCosts?.otherCostPercentage) {
      const otherRate = input.customCosts.otherCostPercentage / 100;
      otherCosts = salePrice * otherRate;
    }
    if (input.customCosts?.otherCostValue) {
      otherCosts += input.customCosts.otherCostValue;
    }
    if (otherCosts > 0) {
      totalCost += otherCosts;
      steps.push({
        step: "10",
        description: "Outros custos",
        calculation: `R$ ${otherCosts.toFixed(2)}`,
        value: otherCosts
      });
    }

    // 12. Cálculos Finais
    const profit = salePrice - totalCost;
    const margin = salePrice > 0 ? (profit / salePrice) * 100 : 0;
    const roi = baseCost > 0 ? (profit / baseCost) * 100 : 0;

    // Adicionar passos finais
    steps.push({
      step: "11",
      description: "Custo total",
      calculation: `Soma de todos os custos = R$ ${totalCost.toFixed(2)}`,
      value: totalCost
    });

    steps.push({
      step: "12",
      description: "Lucro líquido",
      calculation: `R$ ${salePrice.toFixed(2)} - R$ ${totalCost.toFixed(2)} = R$ ${profit.toFixed(2)}`,
      value: profit
    });

    steps.push({
      step: "13",
      description: "Margem de lucro",
      calculation: `(R$ ${profit.toFixed(2)} ÷ R$ ${salePrice.toFixed(2)}) × 100 = ${margin.toFixed(2)}%`,
      value: margin
    });

    steps.push({
      step: "14",
      description: "ROI",
      calculation: `(R$ ${profit.toFixed(2)} ÷ R$ ${baseCost.toFixed(2)}) × 100 = ${roi.toFixed(2)}%`,
      value: roi
    });

    return {
      profit,
      margin,
      roi,
      totalCost,
      salePrice,
      breakdown: {
        baseCost,
        packagingCost: packCost,
        freightCost: inboundFreight + outboundFreight,
        commissionCost,
        taxCost,
        adsCost,
        otherCosts
      },
      appliedRates: {
        commissionRate: commissionRate * 100,
        freightRate: 0, // Seria calculado se fosse por peso
        taxRate: userTaxRate * 100
      },
      calculationSteps: steps
    };
  }

  // Salvar log de cálculo
  async saveCalculationLog(
    userId: number,
    productId: number,
    channelId: number,
    inputData: PricingCalculationInput,
    result: DetailedCalculationResult
  ) {
    await db.insert(calculationLogs).values({
      userId,
      productId,
      channelId,
      inputData: inputData as any,
      calculationSteps: result.calculationSteps as any,
      result: result as any
    });
  }

  // Obter canais ativos do usuário
  async getUserActiveChannels(userId: number) {
    return await db
      .select({
        id: availableChannels.id,
        channelType: availableChannels.channelType,
        serviceType: availableChannels.serviceType,
        displayName: availableChannels.displayName,
        description: availableChannels.description,
        isActive: availableChannels.isActive,
        customSettings: userActiveChannels.customSettings
      })
      .from(userActiveChannels)
      .innerJoin(availableChannels, eq(userActiveChannels.channelId, availableChannels.id))
      .where(
        and(
          eq(userActiveChannels.userId, userId),
          eq(userActiveChannels.isActive, true),
          eq(availableChannels.isActive, true)
        )
      );
  }

  // Salvar configuração de canal do produto
  async saveProductChannelConfig(
    productId: number,
    channelId: number,
    pricing: any,
    calculation: DetailedCalculationResult
  ) {
    const existing = await db
      .select()
      .from(productChannelConfigs)
      .where(
        and(
          eq(productChannelConfigs.productId, productId),
          eq(productChannelConfigs.channelId, channelId)
        )
      )
      .limit(1);

    const data = {
      productId,
      channelId,
      isActive: true,
      pricing,
      lastCalculation: calculation as any,
      updatedAt: new Date()
    };

    if (existing.length > 0) {
      await db
        .update(productChannelConfigs)
        .set(data)
        .where(eq(productChannelConfigs.id, existing[0].id));
    } else {
      await db.insert(productChannelConfigs).values(data);
    }
  }

  // Obter configurações dos canais de um produto
  async getProductChannelConfigs(productId: number) {
    return await db
      .select({
        id: productChannelConfigs.id,
        channelId: productChannelConfigs.channelId,
        channelType: availableChannels.channelType,
        serviceType: availableChannels.serviceType,
        displayName: availableChannels.displayName,
        isActive: productChannelConfigs.isActive,
        pricing: productChannelConfigs.pricing,
        lastCalculation: productChannelConfigs.lastCalculation
      })
      .from(productChannelConfigs)
      .innerJoin(availableChannels, eq(productChannelConfigs.channelId, availableChannels.id))
      .where(eq(productChannelConfigs.productId, productId));
  }
}

export const pricingService = new PricingService();