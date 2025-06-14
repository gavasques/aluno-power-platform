
export interface Product {
  id: string;
  name: string;
  photo?: string;
  ean?: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  weight: number;
  brand: string;
  category: string;
  supplierId: string;
  ncm?: string;
  costItem: number; // Custo FOB
  packCost: number; // Custo de embalagem
  taxPercent: number; // Imposto global %
  channels: ProductChannels;
  createdAt: string;
}

export interface ProductChannels {
  sitePropio?: SiteProprioChannel;
  amazonFBM?: AmazonFBMChannel;
  amazonFBAOnSite?: AmazonFBAOnSiteChannel;
  amazonDBA?: AmazonDBAChannel;
  amazonFBA?: AmazonFBAChannel;
  mlME1?: MLMEChannel;
  mlFlex?: MLFlexChannel;
  mlEnvios?: MLEnviosChannel;
  mlFull?: MLFullChannel;
}

export interface BaseChannel {
  enabled: boolean;
  commissionPct: number;
  fixedFee: number;
  otherPct: number;
  otherValue: number;
  adsPct: number;
  salePrice: number;
}

export interface SiteProprioChannel extends BaseChannel {
  gatewayPct: number; // Custo de Gateway de pagamento
}

export interface AmazonFBMChannel extends BaseChannel {
  outboundFreight: number;
}

export interface AmazonFBAOnSiteChannel extends BaseChannel {
  outboundFreight: number;
}

export interface AmazonDBAChannel extends BaseChannel {
  outboundFreight: number;
}

export interface AmazonFBAChannel extends BaseChannel {
  inboundFreight: number;
  prepCenter: number;
}

export interface MLMEChannel extends BaseChannel {
  // Usa apenas os custos base
}

export interface MLFlexChannel extends BaseChannel {
  outboundFreight: number;
  flexRevenue: number; // Receita ML Flex (positiva)
}

export interface MLEnviosChannel extends BaseChannel {
  outboundFreight: number;
}

export interface MLFullChannel extends BaseChannel {
  inboundFreight: number;
  prepCenter: number;
}

export interface ChannelInput {
  price: number;
  costItem: number;
  packCost?: number;
  inboundFreight?: number;
  outboundFreight?: number;
  prepCenter?: number;
  fixedFee?: number;
  commissionPct?: number;
  adsPct?: number;
  otherPct?: number;
  otherValue?: number;
  flexRevenue?: number;
  gatewayPct?: number;
}

export interface ChannelResult {
  profit: number;
  margin: number;
  roi: number;
}

export interface Supplier {
  id: string;
  tradeName: string;
}

export interface Category {
  id: string;
  name: string;
}
