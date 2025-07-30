/**
 * LEGACY CHANNELS EDITOR - REDIRECTION
 * Original: 735 linhas de código monolítico
 * Refatorado: Sistema modular em client/src/features/channels/
 * 
 * ✅ ARQUITETURA IMPLEMENTADA:
 * - Container/Presentational pattern
 * - Tipos centralizados (channels.ts)
 * - Hook especializado (useChannelsEditor)
 * - UI modular e reutilizável
 * - Calculadora de rentabilidade integrada
 * - Validação com Zod schemas
 */
import React from 'react';
import ChannelsEditorRefactored from '@/features/channels/components/ChannelsEditor/ChannelsEditorRefactored';

// Redirecionamento para componente refatorado
const ChannelsEditor = (props: { productId: number; isOpen: boolean; onClose: () => void }) => {
  return <ChannelsEditorRefactored {...props} />;
};

export default ChannelsEditor;
