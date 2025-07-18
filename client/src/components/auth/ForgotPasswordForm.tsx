import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, CheckCircle } from 'lucide-react';
import { AuthService } from '@/services/authService';
import { useUnifiedFormValidation, commonValidationRules } from '@/hooks/useUnifiedFormValidation';
import { ButtonLoader } from '@/components/common/LoadingSpinner';

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

interface ForgotPasswordFormData {
  email: string;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    formData,
    isSubmitting,
    globalError,
    handleInputChange,
    handleSubmit
  } = useUnifiedFormValidation<ForgotPasswordFormData>({
    initialData: {
      email: ''
    },
    validationRules: {
      email: commonValidationRules.email
    },
    onSubmit: async (data) => {
      const result = await AuthService.forgotPassword({ email: data.email });
      if (result.success) {
        setIsSuccess(true);
      }
      return result;
    },
    successMessage: 'Email de recuperação enviado!',
    errorMessage: 'Erro ao enviar email'
  });

  if (isSuccess) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Email enviado!</h3>
          <p className="text-sm text-muted-foreground">
            Verifique sua caixa de entrada e clique no link para redefinir sua senha.
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="w-full">
          Voltar ao login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {globalError && (
        <Alert variant="destructive">
          <AlertDescription>{globalError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="forgot-email"
            type="email"
            placeholder="seu@email.com"
            className="pl-10"
            value={formData.email}
            onChange={handleInputChange('email')}
            disabled={isSubmitting}
            required
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Digite seu email para receber um link de redefinição de senha.
        </p>
      </div>

      <div className="space-y-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <ButtonLoader />
              Enviando...
            </>
          ) : (
            'Enviar link de recuperação'
          )}
        </Button>
        
        <Button variant="ghost" onClick={onBack} className="w-full">
          Voltar ao login
        </Button>
      </div>
    </form>
  );
}