import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    // Password strength validation (matching backend requirements)
    if (formData.password.length < 12) {
      setError('A senha deve ter pelo menos 12 caracteres');
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      setError('A senha deve conter pelo menos uma letra maiúscula');
      return;
    }

    if (!/[a-z]/.test(formData.password)) {
      setError('A senha deve conter pelo menos uma letra minúscula');
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      setError('A senha deve conter pelo menos um número');
      return;
    }

    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password)) {
      setError('A senha deve conter pelo menos um caractere especial');
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData.email, formData.name, formData.password);
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Erro no cadastro');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (error) setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
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
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
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
            disabled={isLoading}
            required
          />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
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