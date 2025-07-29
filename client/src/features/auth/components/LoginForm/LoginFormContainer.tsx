/**
 * CONTAINER: LoginFormContainer
 * Lógica de negócio para formulário de login
 * Extraído de LoginNew.tsx para modularização
 */
import { useLoginForm } from '../../hooks/useLoginForm';
import { useRegisterForm } from '../../hooks/useRegisterForm';
import { useModalManager } from '../../hooks/useModalManager';
import { LoginFormPresentation } from './LoginFormPresentation';

export const LoginFormContainer = () => {
  // ===== HOOKS INTEGRATION =====
  const loginHook = useLoginForm();
  const registerHook = useRegisterForm();
  const modalHook = useModalManager();

  // ===== CONTAINER ORCHESTRATION =====
  const containerProps = {
    // Login form
    loginProps: {
      formData: loginHook.formData,
      errors: loginHook.errors,
      showPassword: loginHook.showPassword,
      isLoading: loginHook.isLoading,
      onInputChange: loginHook.handleInputChange,
      onSubmit: loginHook.handleSubmit,
      onTogglePassword: loginHook.togglePasswordVisibility,
      onForgotPassword: () => modalHook.openModal('isForgotPasswordModalOpen')
    },

    // Register form
    registerProps: {
      isOpen: modalHook.modalStates.isRegisterModalOpen,
      onClose: () => modalHook.closeModal('isRegisterModalOpen'),
      formData: registerHook.formData,
      errors: registerHook.errors,
      showPassword: registerHook.showPassword,
      isLoading: registerHook.isLoading,
      onInputChange: registerHook.handleInputChange,
      onSubmit: registerHook.handleSubmit,
      onTogglePassword: registerHook.togglePasswordVisibility
    },

    // Modal management
    modalProps: {
      modalStates: modalHook.modalStates,
      onOpenRegister: () => modalHook.openModal('isRegisterModalOpen'),
      onCloseAll: modalHook.closeAllModals
    }
  };

  return <LoginFormPresentation {...containerProps} />;
};