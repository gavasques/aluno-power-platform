import { UseFormReturn } from 'react-hook-form';
import { ChannelFormData, CHANNEL_FIELDS } from './hooks/useChannelsState';
import { ChannelCalculationResult } from '@/utils/channelCalculations';

export interface ChannelsEditorPresentationProps {
  // Estado
  product: any;
  loadingProduct: boolean;
  error: any;
  isSaving: boolean;
  isOpen: boolean;
  
  // Form e dados
  form: UseFormReturn<ChannelFormData>;
  expandedChannels: Set<string>;
  channelCalculations: Record<string, ChannelCalculationResult>;
  CHANNEL_FIELDS: typeof CHANNEL_FIELDS;
  
  // Handlers
  onSubmit: (data: ChannelFormData) => Promise<void>;
  onClose: () => void;
  toggleChannelExpansion: (channelType: string) => void;
} 