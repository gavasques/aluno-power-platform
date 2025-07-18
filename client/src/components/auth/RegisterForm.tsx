import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedFormValidation, commonValidationRules, usePasswordValidation } from '@/hooks/useUnifiedFormValidation';

interface RegisterFormProps {
  onSuccess?: () => void;
}

interface RegisterFormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register } = useAuth();
  const { validatePassword } = usePasswordValidation();

  const {
    formData,
    isSubmitting,
    globalError,
    handleInputChange,
    handleSubmit
  } = useUnifiedFormValidation<RegisterFormData>({
    initialData: {
      email: '',
      name: '',
      password: '',
      confirmPassword: ''
    },
    validationRules: {
      email: commonValidationRules.email,
      name: commonValidationRules.name,
      password: {
        required: true,
        custom: (value) => validatePassword(value).length === 0,
        message: 'Senha não atende aos requisitos de segurança'
      },
      confirmPassword: {
        required: true,
        custom: (value) => value === formData.password,
        message: 'As senhas não coincidem'
      }
    },
    onSubmit: async (data) => {
      const result = await register(data.email, data.name, data.password);
      return result;
    },
    onSuccess: () => {
      onSuccess?.();
    },
    successMessage: 'Conta criada com sucesso!',
    errorMessage: 'Erro no cadastro'
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="register-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="register-email"
            type="email"
            placeholder="seu@email.com"
            className="pl-10"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-name">Nome completo</Label>
        <div className="relative">
          <UserPlus className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="register-name"
            placeholder="Seu Nome Completo"
            className="pl-10"
            value={formData.name}
            onChange={handleInputChange('name')}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="register-password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={isSubmitting}
            required
          />
        </div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>A senha deve conter:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li className={formData.password.length >= 12 ? 'text-green-600' : 'text-gray-500'}>
              Pelo menos 12 caracteres
            </li>
            <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
              Uma letra maiúscula
            </li>
            <li className={/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
              Uma letra minúscula
            </li>
            <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
              Um número
            </li>
            <li className={/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password) ? 'text-green-600' : 'text-gray-500'}>
              Um caractere especial (!@#$%^&*...)
            </li>
          </ul>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-confirm-password">Confirmar senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="register-confirm-password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={formData.confirmPassword}
            onChange={handleInputChange('confirmPassword')}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando conta...
          </>
        ) : (
          'Criar conta'
        )}
      </Button>
    </form>
  );
}