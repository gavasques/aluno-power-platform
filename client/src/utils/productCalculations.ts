import { Product, BaseChannel } from "@/types/product";

export const channelNames = {
  mercadolivre: "Mercado Livre",
  amazon: "Amazon",
  shopee: "Shopee",
  magazineluiza: "Magazine Luiza",
  americanas: "Americanas",
  casasbahia: "Casas Bahia",
  pontofrio: "Ponto Frio",
  extra: "Extra",
  carrefour: "Carrefour",
  ecommerce: "E-commerce Próprio",
  whatsapp: "WhatsApp",
  fisico: "Físico",
};

export interface ChannelResults {
  revenue: number;
  totalCosts: number;
  profit: number;
  margin: number;
  roi: number;
  fees: {
    shipping: number;
    platform: number;
    payment: number;
    advertising: number;
    operational: number;
    other: number;
  };
}

export function calculateChannelResults(
  product: Product,
  channelKey: string,
  channel: BaseChannel
): ChannelResults {
  const costItem = product.costItem || 0;
  const packCost = product.packCost || 0;
  const taxPercent = product.taxPercent || 0;
  
  // Cost already includes everything (product, taxes, shipping, etc.)
  const totalProductCost = costItem + packCost;
  
  const revenue = channel.price;
  
  const fees = {
    shipping: channel.shippingCost || 0,
    platform: channel.platformFee || 0,
    payment: channel.paymentFee || 0,
    advertising: channel.advertisingCost || 0,
    operational: channel.operationalCost || 0,
    other: channel.otherCosts || 0,
  };
  
  const totalFees = Object.values(fees).reduce((sum, fee) => sum + fee, 0);
  const totalCosts = totalProductCost + totalFees;
  
  const profit = revenue - totalCosts;
  const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
  const roi = totalProductCost > 0 ? (profit / totalProductCost) * 100 : 0;
  
  return {
    revenue,
    totalCosts,
    profit,
    margin,
    roi,
    fees,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getDefaultChannels() {
  const defaultChannel: BaseChannel = {
    enabled: false,
    price: 0,
    shippingCost: 0,
    platformFee: 0,
    paymentFee: 0,
    advertisingCost: 0,
    operationalCost: 0,
    otherCosts: 0,
  };

  return {
    mercadolivre: { ...defaultChannel },
    amazon: { ...defaultChannel },
    shopee: { ...defaultChannel },
    magazineluiza: { ...defaultChannel },
    americanas: { ...defaultChannel },
    casasbahia: { ...defaultChannel },
    pontofrio: { ...defaultChannel },
    extra: { ...defaultChannel },
    carrefour: { ...defaultChannel },
    ecommerce: { ...defaultChannel },
    whatsapp: { ...defaultChannel },
    fisico: { ...defaultChannel },
  };
}