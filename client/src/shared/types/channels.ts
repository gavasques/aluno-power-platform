// Re-export unified types from core module
export * from '../../types/core/channel';

// Legacy exports for backward compatibility
export type {
  ChannelType,
  SalesChannel,
  ChannelCostData,
  ChannelCalculationResult,
  ChannelFormData,
  ChannelEditorProps,
  ChannelCalculatorProps,
  ChannelUpdateRequest,
  ChannelUpdateResponse
} from '../../types/core';

// Product with channels interface
export interface ProductWithChannels {
  id: number;
  name: string;
  costItem: number;
  taxPercent: number;
  channels: SalesChannel[];
}