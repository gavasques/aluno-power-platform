import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { useUnifiedFormValidation, commonValidationRules } from '@/hooks/useUnifiedFormValidation';

interface LoginFormProps {
  onSuccess?: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();

  const {
    formData,
    isSubmitting,
    globalError,
    handleInputChange,
    handleSubmit
  } = useUnifiedFormValidation<LoginFormData>({
    initialData: {
      email: '',
      password: ''
    },
    validationRules: {
      email: commonValidationRules.email,
      password: { required: true, message: 'Senha é obrigatória' }
    },
    onSubmit: async (data) => {
      const result = await login(data.email, data.password);
      return result;
    },
    onSuccess: () => {
      onSuccess?.();
    },
    successMessage: 'Login realizado com sucesso!',
    errorMessage: 'Erro no login'
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="email"
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
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            className="pl-10"
            value={formData.password}
            onChange={handleInputChange('password')}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <ButtonLoader className="mr-2" />
            Entrando...
          </>
        ) : (
          'Entrar'
        )}
      </Button>
    </form>
  );
}