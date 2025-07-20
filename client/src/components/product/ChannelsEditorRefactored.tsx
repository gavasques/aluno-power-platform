import { ChannelsEditorContainer } from './ChannelsEditor/ChannelsEditorContainer';

interface ChannelsEditorRefactoredProps {
  productId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const ChannelsEditorRefactored: React.FC<ChannelsEditorRefactoredProps> = ({ 
  productId, 
  isOpen, 
  onClose 
}) => {
  return <ChannelsEditorContainer productId={productId} isOpen={isOpen} onClose={onClose} />;
}; 