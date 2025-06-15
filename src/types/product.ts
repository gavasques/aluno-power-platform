export interface Product {
  id: string;
  name: string;
  photo?: string;
  sku?: string; // Novo campo SKU
  internalCode?: string; // Novo campo Código Interno
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
  supplierProductCode?: string; // Novo campo Código do Produto no Fornecedor
  suppliers?: ProductSupplier[]; // Novo campo para múltiplos fornecedores
  ncm?: string;
  costItem: number; // Custo FOB
  packCost: number; // Custo de embalagem
  taxPercent: number; // Imposto global %
  observations?: string; // Novo campo Observações do Produto
  descriptions?: ProductDescriptions; // Novo campo para descrições
  channels: ProductChannels;
  active: boolean; // Nova propriedade para ativar/desativar produto
  createdAt: string;
}

// Novo tipo para descrições do produto
export interface ProductDescriptions {
  description?: string; // Descrição em texto
  htmlDescription?: string; // Descrição em HTML
  bulletPoints?: string; // Bullet Points
  technicalSpecs?: string; // Ficha Técnica
}

// Novo tipo para fornecedores do produto
export interface ProductSupplier {
  id: string;
  supplierId: string;
  supplierProductCode: string;
  cost: number;
  isMain: boolean; // Indica se é o fornecedor principal
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
  productCode?: string; // Novo campo para código do produto no canal
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
  fnsku?: string; // Novo campo FNSKU
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
