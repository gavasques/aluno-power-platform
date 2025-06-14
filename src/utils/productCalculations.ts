
import { ChannelInput, ChannelResult, Product, BaseChannel } from "@/types/product";

export function calcChannel(input: ChannelInput, taxPct: number = 0): ChannelResult {
  const P = input.price;
  const pct = (p: number | undefined) => (p ?? 0) / 100 * P;
  
  const Cperc = pct(input.commissionPct) + pct(input.adsPct) + pct(input.otherPct) + pct(taxPct);
  const Cunit = (
    input.costItem +
    (input.packCost ?? 0) +
    (input.inboundFreight ?? 0) +
    (input.outboundFreight ?? 0) +
    (input.prepCenter ?? 0) +
    (input.fixedFee ?? 0) +
    (input.otherValue ?? 0) -
    (input.flexRevenue ?? 0) // Para ML Flex
  );
  
  const Ctotal = Cperc + Cunit;
  const profit = P - Ctotal;
  const margin = P > 0 ? (profit / P) * 100 : 0;
  const roi = (input.costItem + (input.inboundFreight ?? 0) + (input.prepCenter ?? 0)) > 0 
    ? (profit / (input.costItem + (input.inboundFreight ?? 0) + (input.prepCenter ?? 0))) * 100 
    : 0;

  return { profit, margin, roi };
}

export function priceForMargin(input: ChannelInput, targetMarginPct: number, taxPct: number = 0): number {
  const pct = (p: number | undefined) => (p ?? 0);
  const varPct = pct(input.commissionPct) + pct(input.adsPct) + pct(input.otherPct) + taxPct;
  const Cunit = (
    input.costItem +
    (input.packCost ?? 0) +
    (input.inboundFreight ?? 0) +
    (input.outboundFreight ?? 0) +
    (input.prepCenter ?? 0) +
    (input.fixedFee ?? 0) +
    (input.otherValue ?? 0) -
    (input.flexRevenue ?? 0)
  );
  
  return Cunit / (1 - (varPct + targetMarginPct) / 100);
}

export function calculateChannelResults(product: Product, channelType: string, channel: BaseChannel): ChannelResult {
  const baseInput: ChannelInput = {
    price: channel.salePrice,
    costItem: product.costItem,
    packCost: product.packCost,
    commissionPct: channel.commissionPct,
    adsPct: channel.adsPct,
    otherPct: channel.otherPct,
    otherValue: channel.otherValue,
    fixedFee: channel.fixedFee,
  };

  // Adicionar custos específicos por canal
  switch (channelType) {
    case 'amazonFBM':
    case 'amazonFBAOnSite':
    case 'amazonDBA':
      baseInput.outboundFreight = (channel as any).outboundFreight || 0;
      break;
    case 'amazonFBA':
    case 'mlFull':
      baseInput.inboundFreight = (channel as any).inboundFreight || 0;
      baseInput.prepCenter = (channel as any).prepCenter || 0;
      break;
    case 'mlFlex':
      baseInput.outboundFreight = (channel as any).outboundFreight || 0;
      baseInput.flexRevenue = (channel as any).flexRevenue || 0;
      break;
    case 'mlEnvios':
      baseInput.outboundFreight = (channel as any).outboundFreight || 0;
      break;
  }

  return calcChannel(baseInput, product.taxPercent);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
