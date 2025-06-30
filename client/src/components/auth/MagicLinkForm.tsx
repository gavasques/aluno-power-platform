import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, CheckCircle, Zap } from 'lucide-react';

interface MagicLinkFormProps {
  onBack?: () => void;
}

export function MagicLinkForm({ onBack }: MagicLinkFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(result.error || 'Erro ao enviar magic link');
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
        <div className="relative">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <Zap className="absolute -top-1 -right-1 h-6 w-6 text-blue-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Magic Link enviado!</h3>
          <p className="text-sm text-muted-foreground">
            Verifique sua caixa de entrada e clique no link mágico para fazer login automaticamente.
          </p>
          <p className="text-xs text-muted-foreground">
            O link expira em 10 minutos por segurança.
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
        <Label htmlFor="magic-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="magic-email"
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
          Receba um link mágico para fazer login sem senha.
        </p>
      </div>

      <div className="space-y-2">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando magic link...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Enviar Magic Link
            </>
          )}
        </Button>
        
        <Button variant="ghost" onClick={onBack} className="w-full">
          Voltar ao login
        </Button>
      </div>
    </form>
  );
}