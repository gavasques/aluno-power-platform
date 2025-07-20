import { useChannelsState } from './hooks/useChannelsState';
import { useChannelCalculations } from './hooks/useChannelCalculations';
import { useChannelsAPI } from './hooks/useChannelsAPI';
import { ChannelsEditorPresentation } from './ChannelsEditorPresentation';

interface ChannelsEditorContainerProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ChannelsEditorContainer = ({ 
  productId, 
  isOpen, 
  onClose 
}: ChannelsEditorContainerProps) => {
  // Hooks para gerenciamento de estado e operações
  const {
    product,
    loadingProduct,
    error,
    form,
    expandedChannels,
    toggleChannelExpansion,
    CHANNEL_FIELDS
  } = useChannelsState(productId, isOpen);

  const { channelCalculations } = useChannelCalculations(form, product);

  const { handleSubmit, isSaving } = useChannelsAPI(productId, onClose);

  const onSubmit = async (data: any) => {
    await handleSubmit(data);
  };

  return (
    <ChannelsEditorPresentation
      // Estado
      product={product}
      loadingProduct={loadingProduct}
      error={error}
      isSaving={isSaving}
      isOpen={isOpen}
      
      // Form e dados
      form={form}
      expandedChannels={expandedChannels}
      channelCalculations={channelCalculations}
      CHANNEL_FIELDS={CHANNEL_FIELDS}
      
      // Handlers
      onSubmit={onSubmit}
      onClose={onClose}
      toggleChannelExpansion={toggleChannelExpansion}
    />
  );
}; 