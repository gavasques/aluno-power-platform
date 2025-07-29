/**
 * HOOK: useRegisterForm
 * Gerencia estado e validação do formulário de registro
 * Extraído de LoginNew.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { RegisterFormData, RegisterErrors, UseRegisterFormReturn } from '../types';
// Temporary inline validation until utils/validation is created
const validateRegisterForm = (data: RegisterFormData): RegisterErrors => {
  const errors: RegisterErrors = {};
  if (!data.name.trim()) errors.name = 'Nome é obrigatório';
  if (!data.email.trim()) errors.email = 'Email é obrigatório';
  else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email inválido';
  if (!data.password) errors.password = 'Senha é obrigatória';
  else if (data.password.length < 6) errors.password = 'Senha deve ter pelo menos 6 caracteres';
  if (!data.confirmPassword) errors.confirmPassword = 'Confirme sua senha';
  else if (data.password !== data.confirmPassword) errors.confirmPassword = 'Senhas não coincidem';
  if (!data.acceptedTerms) errors.acceptedTerms = 'Você deve aceitar os termos de uso';
  return errors;
};

export const useRegisterForm = (): UseRegisterFormReturn => {
  // ===== EXTERNAL HOOKS =====
  const { register, isLoading } = useAuth();
  const { toast } = useToast();

  // ===== STATE =====
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptedTerms: false
  });
  
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  // ===== INPUT HANDLERS =====
  const handleInputChange = useCallback((field: keyof RegisterFormData) => 
    (e: React.ChangeEvent<HTMLInputElement> | boolean) => {
      let value: string | boolean;
      
      if (typeof e === 'boolean') {
        // Handle checkbox (acceptedTerms)
        value = e;
      } else {
        // Handle regular inputs
        value = e.target.value;
      }
      
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
      
      // Clear field error when user starts typing
      if (errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    }, [errors]);

  // ===== FORM SUBMISSION =====
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});
    
    // Validate form
    const validationErrors = validateRegisterForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await register(formData);
      
      toast({
        title: "Conta criada com sucesso",
        description: "Bem-vindo! Você já pode fazer login.",
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        acceptedTerms: false
      });
      
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao criar conta';
      
      setErrors({
        general: errorMessage
      });
      
      toast({
        title: "Erro ao criar conta",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [formData, register, toast]);

  // ===== UTILITY FUNCTIONS =====
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    showPassword,
    isLoading,
    handleInputChange,
    handleSubmit,
    togglePasswordVisibility,
    clearErrors
  };
};