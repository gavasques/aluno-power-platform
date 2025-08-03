/**
 * HOOK: useLoginForm
 * Gerencia estado e validação do formulário de login
 * Extraído de LoginNew.tsx para modularização
 */
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { LoginFormData, LoginErrors, UseLoginFormReturn } from '../types';
// Temporary inline validation until utils/validation is created
const validateLoginForm = (data: LoginFormData): LoginErrors => {
  const errors: LoginErrors = {};
  if (!data.email.trim()) errors.email = 'Email é obrigatório';
  else if (!/\S+@\S+\.\S+/.test(data.email)) errors.email = 'Email inválido';
  if (!data.password) errors.password = 'Senha é obrigatória';
  return errors;
};

export const useLoginForm = (): UseLoginFormReturn => {
  // ===== EXTERNAL HOOKS =====
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // ===== STATE =====
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<LoginErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  // ===== INPUT HANDLERS =====
  const handleInputChange = useCallback((field: keyof LoginFormData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      
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
    const validationErrors = validateLoginForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await login(formData.email, formData.password);
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      
      setLocation('/');
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro ao fazer login';
      
      setErrors({
        general: errorMessage
      });
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [formData, login, toast, setLocation]);

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