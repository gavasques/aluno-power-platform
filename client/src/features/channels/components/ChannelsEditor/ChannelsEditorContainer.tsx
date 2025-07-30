/**
 * CHANNELS EDITOR CONTAINER
 * Componente container que orquestra toda a lógica do editor de canais
 * Extraído de ChannelsEditor.tsx (735 linhas) para modularização
 */
import React from 'react';
import { ChannelsEditorContainerProps } from '../../types/channels';
import { useChannelsEditor } from '../../hooks/useChannelsEditor';
import ChannelsEditorPresentation from './ChannelsEditorPresentation';

const ChannelsEditorContainer: React.FC<ChannelsEditorContainerProps> = (props) => {
  const {
    state,
    actions,
    utils,
    form,
    readOnly
  } = useChannelsEditor(props);

  return (
    <ChannelsEditorPresentation
      state={state}
      actions={actions}
      utils={utils}
      readOnly={readOnly}
    />
  );
};

export default ChannelsEditorContainer;
