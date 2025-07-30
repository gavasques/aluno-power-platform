import { useState, useEffect } from 'react';
import { useWatch } from 'react-hook-form';
import { 
  calculateUnifiedChannelProfitability as calculateChannelProfitability,
  type UnifiedChannelCalculationResult as ChannelCalculationResult 
} from '@/shared/utils/unifiedChannelCalculations';
import { ChannelFormData } from './useChannelsState';

export const useChannelCalculations = (
  form: any,
  product: any
) => {
  const [channelCalculations, setChannelCalculations] = useState<Record<string, ChannelCalculationResult>>({});

  // Watch form values for real-time calculations
  const watchedValues = useWatch({
    control: form.control,
    name: 'channels'
  });

  // Calculate financial metrics in real-time
  useEffect(() => {
    if (!product || !watchedValues) return;

    const newCalculations: Record<string, ChannelCalculationResult> = {};

    watchedValues.forEach((channel: any, index: number) => {
      if (channel.isActive && channel.data) {
        const productBase = {
          costItem: parseFloat((product as any).data?.costItem) || 0,
          taxPercent: parseFloat((product as any).data?.taxPercent) || 0,
        };

        const calculation = calculateChannelProfitability(
          channel.type,
          channel.data as any,
          productBase
        );

        newCalculations[channel.type] = calculation;
      }
    });

    setChannelCalculations(newCalculations);
  }, [watchedValues, product]);

  return {
    channelCalculations
  };
}; 