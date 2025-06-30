import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle } from 'lucide-react';

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Erro ao enviar email');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

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
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
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
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            disabled={isLoading}
            required
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Digite seu email para receber um link de redefinição de senha.
        </p>
      </div>

      <div className="space-y-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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