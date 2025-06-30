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

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
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