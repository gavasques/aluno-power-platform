import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Bot, Camera, Search, MessageSquare, Edit3, BarChart3, Shield, Zap, Star, Mail, UserPlus, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import newLogo from '@assets/Asset 14-8_1752691852003.png';

export default function Login() {
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading, login, register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', phone: '' });
  const [verificationOpen, setVerificationOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [tempUserId, setTempUserId] = useState<number | null>(null);
  const [registerLoading, setRegisterLoading] = useState(false);
  const { toast } = useToast();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      setLocation('/');
    }
  }, [user, authLoading, setLocation]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // If user is logged in, don't render login page
  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);

      if (result.success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo ao Core Guilherme Vasques!",
        });
        setLocation('/');
      } else {
        toast({
          title: "Erro no login",
          description: result.error || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail) {
      toast({
        title: "Erro",
        description: "Por favor, digite seu email",
        variant: "destructive",
      });
      return;
    }

    setForgotPasswordLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotPasswordEmail }),
      });

      if (response.ok) {
        toast({
          title: "Email enviado",
          description: "Instruções para recuperação de senha foram enviadas para seu email.",
        });
        setForgotPasswordOpen(false);
        setForgotPasswordEmail('');
      } else {
        toast({
          title: "Erro",
          description: "Erro ao enviar email de recuperação. Verifique o endereço informado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao processar solicitação. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, password, phone } = registerData;
    
    if (!name || !email || !password || !phone) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Senha inválida",
        description: "A senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    // Validar formato do telefone (números brasileiros)
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: "Telefone inválido",
        description: "Por favor, digite um telefone no formato (11) 99999-9999",
        variant: "destructive",
      });
      return;
    }

    setRegisterLoading(true);
    try {
      // Primeira etapa: criar conta temporária
      const response = await fetch('/api/auth/register-with-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone })
      });

      const result = await response.json();

      if (result.success) {
        setTempUserId(result.userId);
        setRegisterOpen(false);
        setVerificationOpen(true);
        toast({
          title: "Código enviado!",
          description: "Verifique seu WhatsApp para o código de verificação",
        });
      } else {
        toast({
          title: "Erro no cadastro",
          description: result.error || "Erro ao criar conta",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no cadastro",
        description: "Erro ao processar cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Por favor, digite o código de 6 dígitos",
        variant: "destructive",
      });
      return;
    }

    setVerificationLoading(true);
    try {
      const response = await fetch('/api/auth/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tempUserId, code: verificationCode })
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Conta verificada com sucesso!",
          description: "Bem-vindo ao Core Guilherme Vasques!",
        });
        setVerificationOpen(false);
        setVerificationCode('');
        setRegisterData({ name: '', email: '', password: '', phone: '' });
        setLocation('/');
      } else {
        toast({
          title: "Código incorreto",
          description: result.error || "Código de verificação inválido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na verificação",
        description: "Erro ao verificar código. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setVerificationLoading(false);
    }
  };

  const features = [
    {
      icon: Bot,
      title: "10+ Agentes de IA",
      description: "Agentes especializados em Amazon FBA, SEO e e-commerce",
      color: "text-blue-600"
    },
    {
      icon: Camera,
      title: "Geração de Imagens",
      description: "Crie fotografias profissionais e infográficos",
      color: "text-purple-600"
    },
    {
      icon: Search,
      title: "Análise de Keywords",
      description: "Pesquisa e otimização de palavras-chave",
      color: "text-green-600"
    },
    {
      icon: MessageSquare,
      title: "Atendimento ao Cliente",
      description: "Respostas inteligentes para avaliações e emails",
      color: "text-orange-600"
    },
    {
      icon: Edit3,
      title: "Otimização de Listagens",
      description: "Títulos, bullet points e descrições otimizadas",
      color: "text-indigo-600"
    },
    {
      icon: BarChart3,
      title: "Simuladores Financeiros",
      description: "Cálculos de ROI, impostos e custos",
      color: "text-emerald-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-screen">
          {/* Left Side - Login Form */}
          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <img
                    src={newLogo}
                    alt="Core Guilherme Vasques Logo"
                    className="h-16 w-auto object-contain"
                  />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Core Guilherme Vasques
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Plataforma completa de inteligência artificial para Amazon FBA e e-commerce
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11"
                    />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Entrar
                      </>
                    )}
                  </Button>
                </form>
                
                <div className="mt-6 space-y-4">
                  <div className="text-center">
                    <Dialog open={forgotPasswordOpen} onOpenChange={setForgotPasswordOpen}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          Esqueci minha senha
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Mail className="h-5 w-5 text-blue-600" />
                            Recuperar Senha
                          </DialogTitle>
                          <DialogDescription>
                            Digite seu email e enviaremos instruções para redefinir sua senha.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="forgot-email">Email</Label>
                            <Input
                              id="forgot-email"
                              type="email"
                              placeholder="seu@email.com"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              required
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setForgotPasswordOpen(false)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={forgotPasswordLoading}
                              className="flex-1"
                            >
                              {forgotPasswordLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Enviando...
                                </>
                              ) : (
                                <>
                                  <Mail className="mr-2 h-4 w-4" />
                                  Enviar
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">
                      Ainda não tem acesso?
                    </p>
                    <Dialog open={registerOpen} onOpenChange={setRegisterOpen}>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md transition-colors"
                        >
                          Cadastrar-se
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-green-600" />
                            Criar Conta
                          </DialogTitle>
                          <DialogDescription>
                            Preencha seus dados para criar uma conta no Core Guilherme Vasques.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleRegisterSubmit} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="register-name">Nome completo</Label>
                            <Input
                              id="register-name"
                              type="text"
                              placeholder="Seu nome completo"
                              value={registerData.name}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, name: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="register-email">Email</Label>
                            <Input
                              id="register-email"
                              type="email"
                              placeholder="seu@email.com"
                              value={registerData.email}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="register-phone">Telefone (WhatsApp)</Label>
                            <Input
                              id="register-phone"
                              type="tel"
                              placeholder="(11) 99999-9999"
                              value={registerData.phone}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '');
                                if (value.length <= 11) {
                                  value = value.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
                                  setRegisterData(prev => ({ ...prev, phone: value }));
                                }
                              }}
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Número do WhatsApp para verificação de conta
                            </p>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="register-password">Senha</Label>
                            <Input
                              id="register-password"
                              type="password"
                              placeholder="Mínimo 8 caracteres"
                              value={registerData.password}
                              onChange={(e) => setRegisterData(prev => ({ ...prev, password: e.target.value }))}
                              required
                            />
                            <p className="text-xs text-gray-500">
                              Mínimo 8 caracteres incluindo maiúscula, minúscula e número
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setRegisterOpen(false)}
                              className="flex-1"
                            >
                              Cancelar
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={registerLoading}
                              className="flex-1"
                            >
                              {registerLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Criando...
                                </>
                              ) : (
                                <>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Criar conta
                                </>
                              )}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Modal de Verificação de Telefone */}
                  <Dialog open={verificationOpen} onOpenChange={setVerificationOpen}>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Phone className="h-5 w-5 text-green-600" />
                          Verificar WhatsApp
                        </DialogTitle>
                        <DialogDescription>
                          Digite o código de 6 dígitos que enviamos para seu WhatsApp.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleVerificationSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="verification-code">Código de verificação</Label>
                          <Input
                            id="verification-code"
                            type="text"
                            placeholder="000000"
                            maxLength={6}
                            value={verificationCode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '');
                              setVerificationCode(value);
                            }}
                            className="text-center text-lg tracking-widest"
                            required
                          />
                          <p className="text-xs text-gray-500 text-center">
                            Não recebeu? Verifique se o WhatsApp está ativo
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setVerificationOpen(false)}
                            className="flex-1"
                          >
                            Cancelar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={verificationLoading || verificationCode.length !== 6}
                            className="flex-1"
                          >
                            {verificationLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Verificando...
                              </>
                            ) : (
                              <>
                                <Phone className="mr-2 h-4 w-4" />
                                Verificar
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - System Information */}
          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200">
                <Star className="w-3 h-3 mr-1" />
                Plataforma Premium
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                Transforme seu negócio na 
                <span className="text-gradient bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"> Amazon</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Mais de 10 agentes de IA especializados para otimizar suas vendas, 
                criar conteúdo profissional e automatizar processos complexos.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="border-0 bg-white/60 backdrop-blur-sm hover:bg-white/80 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-50 ${feature.color}`}>
                        <feature.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Zap className="w-6 h-6" />
                  <h3 className="text-lg font-semibold">Pronto para começar?</h3>
                </div>
                <p className="text-blue-100 mb-4">
                  Junte-se a centenas de vendedores que já estão usando nossa plataforma 
                  para escalar seus negócios na Amazon.
                </p>
                
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Footer de Suporte */}
        <div className="text-center py-6 border-t border-gray-200/50 mt-8">
          <p className="text-sm text-gray-600">
            Precisa de ajuda? Entre em contato com 
            <a 
              href="mailto:suporte@guivasques.app" 
              className="text-blue-600 hover:text-blue-700 font-medium ml-1"
            >
              suporte@guivasques.app
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}