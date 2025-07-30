/**
 * LEGACY REDIRECTION: LancamentosManager
 * Redirecionamento para sistema modular refatorado
 * Original: 672 linhas → Modular: ~200 linhas efetivas (70% redução)
 */
import React from 'react';
import { LancamentosManagerRefactored } from '../../features/financas360/components/LancamentosManager/LancamentosManagerRefactored';
import { LancamentosManagerContainerProps } from '../../features/financas360/types/lancamentos';

const LancamentosManager: React.FC<LancamentosManagerContainerProps> = (props) => {
  return <LancamentosManagerRefactored {...props} />;
};

export default LancamentosManager;
