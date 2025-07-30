/**
 * REFACTORED: LancamentosManagerRefactored
 * Sistema de gerenciamento de lançamentos financeiros refatorado
 * Substituição de LancamentosManager.tsx (672 linhas) por arquitetura modular
 */
import React from 'react';
import { LancamentosManagerContainer } from './LancamentosManagerContainer';
import { LancamentosManagerContainerProps } from '../../types/lancamentos';

export const LancamentosManagerRefactored: React.FC<LancamentosManagerContainerProps> = (props) => {
  return <LancamentosManagerContainer {...props} />;
};

export default LancamentosManagerRefactored;
