import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock } from 'lucide-react';
import { ButtonLoader } from '@/components/common/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        onSuccess?.();
      } else {
        setError(result.error || 'Erro ao fazer login');
      }
    } catch (err) {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
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
            className="pl-10 h-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            className="pl-10 h-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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