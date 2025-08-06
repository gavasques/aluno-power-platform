/**
 * Hook simplificado para recursos do Finanças360
 * MIGRADO: Elimina duplicação usando useEntityCRUD como base
 * 
 * ⚠️ DEPRECATED: Use useEntityCRUD diretamente para novos componentes
 */

import { useEntityCRUD } from '@/shared/hooks/useEntityCRUD';
import { type ValidationSchema } from '@/shared/utils/ValidationUtils';

interface UseFinancasResourceProps<TEntity, TFormData> {
  resource: string;
  initialFormData: TFormData;
  validationSchema?: ValidationSchema<TFormData>;
  mapEntityToForm?: (entity: TEntity) => TFormData;
  customMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    deleteConfirm?: string;
    loading?: string;
  };
}

/**
 * Hook simplificado que delega para useEntityCRUD
 * Wrapper para compatibilidade com código existente
 */
export function useFinancasResource<TEntity, TFormData>({
  resource,
  initialFormData,
  validationSchema,
  mapEntityToForm,
  customMessages = {}
}: UseFinancasResourceProps<TEntity, TFormData>) {
  // Messages with defaults
  const messages = {
    create: customMessages.create || `${resource} criado com sucesso!`,
    update: customMessages.update || `${resource} atualizado com sucesso!`,
    delete: customMessages.delete || `${resource} excluído com sucesso!`,
    deleteConfirm: customMessages.deleteConfirm || `Tem certeza que deseja excluir este ${resource.toLowerCase()}?`,
    loading: customMessages.loading || `Carregando ${resource.toLowerCase()}s...`
  };

  // Delegar tudo para useEntityCRUD
  return useEntityCRUD<TEntity, TFormData>({
    endpoint: `/api/financas360/${resource}`,
    queryKey: [`financas360-${resource}`],
    entityName: resource,
    initialFormData,
    validationSchema,
    mapEntityToForm,
    messages
  });
}