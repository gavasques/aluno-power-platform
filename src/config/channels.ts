
import { ProductChannels } from "@/types/product";

export const channelNames: Record<keyof ProductChannels, string> = {
  sitePropio: "Site Próprio",
  amazonFBM: "Amazon FBM",
  amazonFBAOnSite: "Amazon FBA On Site",
  amazonDBA: "Amazon DBA",
  amazonFBA: "Amazon FBA",
  mlME1: "ML ME1",
  mlFlex: "ML Flex",
  mlEnvios: "ML Envios",
  mlFull: "ML Full"
};

export const defaultChannels: ProductChannels = {
    sitePropio: { enabled: false, commissionPct: 0, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, salePrice: 0, gatewayPct: 0 },
    amazonFBM: { enabled: false, commissionPct: 15, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, outboundFreight: 0, salePrice: 0 },
    amazonFBAOnSite: { enabled: false, commissionPct: 15, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, outboundFreight: 0, salePrice: 0 },
    amazonDBA: { enabled: false, commissionPct: 15, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, outboundFreight: 0, salePrice: 0 },
    amazonFBA: { enabled: false, commissionPct: 15, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, inboundFreight: 0, prepCenter: 0, salePrice: 0 },
    mlME1: { enabled: false, commissionPct: 14, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, salePrice: 0 },
    mlFlex: { enabled: false, commissionPct: 14, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, outboundFreight: 0, flexRevenue: 0, salePrice: 0 },
    mlEnvios: { enabled: false, commissionPct: 14, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, outboundFreight: 0, salePrice: 0 },
    mlFull: { enabled: false, commissionPct: 14, fixedFee: 0, otherPct: 0, otherValue: 0, adsPct: 0, inboundFreight: 0, outboundFreight: 0, prepCenter: 0, salePrice: 0 }
};
