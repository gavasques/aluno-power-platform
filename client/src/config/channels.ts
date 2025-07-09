
import { ProductChannels } from "@/types/product";

// Mapeamento correto dos tipos do banco de dados para nomes amigáveis
export const channelNames: Record<string, string> = {
  // Banco usa: SITE_PROPRIO
  "SITE_PROPRIO": "Site Próprio",
  // Banco usa: AMAZON_*
  "AMAZON_FBM": "Amazon FBM",
  "AMAZON_FBA_ONSITE": "Amazon FBA On Site", 
  "AMAZON_DBA": "Amazon DBA",
  "AMAZON_FBA": "Amazon FBA",
  // Banco usa: MERCADO_LIVRE_*
  "MERCADO_LIVRE_ME1": "ML ME1",
  "MERCADO_LIVRE_FLEX": "ML Flex",
  "MERCADO_LIVRE_ENVIOS": "ML Envios",
  "MERCADO_LIVRE_FULL": "ML Full",
  // Banco usa: SHOPEE
  "SHOPEE": "Shopee",
  // Magalu canais
  "MAGALU_FULL": "Magalu Full",
  "MAGALU_ENVIOS": "Magalu Envios",
  // TikTok Shop
  "TIKTOKSHOP_NORMAL": "TikTok Shop",
  // Outros
  "MARKETPLACE_OTHER": "Outro Marketplace"
};

// Configurações padrão para os canais (usando campos corretos do banco de dados)
export const defaultChannels: Record<string, any> = {
  "SITE_PROPRIO": { 
    enabled: false, 
    price: 0,
    otherCostValue: 0,
    fixedCostPercent: 0,
    otherCostPercent: 0,
    packagingCostValue: 0,
    financialCostPercent: 0,
    marketingCostPercent: 0
  },
  "AMAZON_FBM": { 
    enabled: false, 
    price: 0,
    shippingCost: 0,
    commissionPercent: 15,
    otherCostValue: 0,
    fixedCostPercent: 0,
    otherCostPercent: 0
  },
  "AMAZON_FBA_ONSITE": { 
    enabled: false, 
    price: 0,
    rebateValue: 0,
    shippingCost: 0,
    rebatePercent: 0,
    otherCostValue: 0,
    fixedCostPercent: 0,
    otherCostPercent: 0,
    tacosCostPercent: 0,
    commissionPercent: 15,
    installmentPercent: 0,
    packagingCostValue: 0
  },
  "AMAZON_DBA": { 
    enabled: false, 
    price: 0,
    shippingCost: 0,
    commissionPercent: 15,
    otherCostValue: 0
  },
  "AMAZON_FBA": { 
    enabled: false, 
    price: 0,
    shippingCost: 0,
    productCostFBA: 0,
    commissionPercent: 15
  },
  "MERCADO_LIVRE_ME1": { 
    enabled: false, 
    price: 0,
    commissionPercent: 14,
    otherCostValue: 0
  },
  "MERCADO_LIVRE_FLEX": { 
    enabled: false, 
    price: 0,
    shippingCost: 0,
    commissionPercent: 14,
    otherCostValue: 0
  },
  "MERCADO_LIVRE_ENVIOS": { 
    enabled: false, 
    price: 0,
    shippingCost: 0,
    commissionPercent: 14,
    otherCostValue: 0
  },
  "MERCADO_LIVRE_FULL": { 
    enabled: false, 
    price: 0,
    shippingCost: 0,
    tacosCostPercent: 0,
    commissionPercent: 14,
    productCostMLFull: 0
  },
  "SHOPEE": { 
    enabled: false, 
    price: 0,
    shippingCost: 0,
    commissionPercent: 12,
    otherCostValue: 0
  },
  // Novos canais: Magalu e TikTok
  "MAGALU_FULL": { 
    enabled: false, 
    price: 0,
    shippingCost: 0,
    commissionPercent: 16,
    tacosCostPercent: 0,
    productCostMagaluFull: 0
  },
  "MAGALU_ENVIOS": { 
    enabled: false, 
    price: 0,
    shippingCost: 0,
    commissionPercent: 16,
    otherCostValue: 0
  },
  "TIKTOKSHOP_NORMAL": { 
    enabled: false, 
    price: 0,
    shippingCost: 0,
    commissionPercent: 8,
    otherCostValue: 0
  },
  "MARKETPLACE_OTHER": { 
    enabled: false, 
    price: 0,
    commissionPercent: 10,
    otherCostValue: 0
  }
};
