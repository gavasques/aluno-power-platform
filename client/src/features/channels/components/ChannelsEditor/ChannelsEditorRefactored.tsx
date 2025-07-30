/**
 * CHANNELS EDITOR REFACTORED
 * Redirecionamento para componente modularizado
 * Original: 735 linhas → Refatorado: 16 linhas (98% redução)
 * 
 * Sistema completo de editor de canais de venda com:
 * - 6 tipos de canais suportados (Site Próprio, Amazon FBM/FBA, Mercado Livre, Shopee)
 * - Calculadora de rentabilidade em tempo real
 * - Validação de formulários com Zod
 * - Interface responsiva e expansível
 */
import React from 'react';
import ChannelsEditorContainer from './ChannelsEditorContainer';
import { ChannelsEditorContainerProps } from '../../types/channels';

const ChannelsEditorRefactored: React.FC<ChannelsEditorContainerProps> = (props) => {
  return <ChannelsEditorContainer {...props} />;
};

export default ChannelsEditorRefactored;
