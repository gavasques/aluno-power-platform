/**
 * Modern Login Page - Redesigned based on user requirements
 * Features professional design with Guilherme Vasques branding
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Eye, EyeOff, Mail, Lock, Users, BarChart3, Zap, ShoppingBag, TrendingUp, Shield, Crown, UserPlus, Phone } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Footer } from '@/components/layout/Footer';
import { Link } from 'wouter';
import { Checkbox } from '@/components/ui/checkbox';
import { ForgotPasswordCodeForm } from '@/components/auth/ForgotPasswordCodeForm';
import logoPath from '@assets/Asset 14-8_1752953662731.png';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100`}>
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

export default function LoginNew() {
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    acceptedTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const [isForgotPasswordCodeModalOpen, setIsForgotPasswordCodeModalOpen] = useState(false);
  const [forgotPasswordErrors, setForgotPasswordErrors] = useState<Record<string, string>>({});
  const [forgotPasswordData, setForgotPasswordData] = useState({
    identifier: '',
    type: 'email' as 'email' | 'phone'
  });
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: '',
    type: 'email' as 'email' | 'phone'
  });
  const [resetPasswordErrors, setResetPasswordErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta.",
        });
        
        // Redirect to dashboard after successful login
        setLocation('/');
      } else {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: result.error || "Credenciais inválidas. Tente novamente.",
        });
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Erro no login",
        description: error.message || "Credenciais inválidas. Tente novamente.",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (registerErrors[name]) {
      setRegisterErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterErrors({});

    // Validation
    const newErrors: Record<string, string> = {};
    if (!registerData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }
    if (!registerData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(registerData.email)) {
      newErrors.email = 'Email inválido';
    }
    if (!registerData.password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (registerData.password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerData.password)) {
      newErrors.password = 'Senha deve conter ao menos uma letra maiúscula, uma minúscula e um número';
    }
    if (!registerData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirme sua senha';
    } else if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }
    if (!registerData.phone.trim()) {
      newErrors.phone = 'Telefone é obrigatório';
    } else if (!/^\(?[1-9]{2}\)?\s?[0-9]{4,5}-?[0-9]{4}$/.test(registerData.phone.replace(/\s+/g, ''))) {
      newErrors.phone = 'Formato de telefone inválido (ex: 11999999999)';
    }
    if (!registerData.acceptedTerms) {
      newErrors.acceptedTerms = 'Você deve aceitar os Termos de Uso e Política de Privacidade';
    }

    if (Object.keys(newErrors).length > 0) {
      setRegisterErrors(newErrors);
      return;
    }

    try {
      // Remove confirmPassword from data sent to server
      const { confirmPassword, ...registrationData } = registerData;
      await register(registrationData);
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Agora você deve verificar seu telefone via WhatsApp",
      });
      setIsRegisterModalOpen(false);
      
      // Always redirect to verification since phone is mandatory
      setLocation('/phone-verification');
    } catch (error: any) {
      console.error('Register error:', error);
      toast({
        title: "Erro no cadastro",
        description: error.response?.data?.message || "Erro interno do servidor",
        variant: "destructive",
      });
      if (error.response?.data?.field) {
        setRegisterErrors({
          [error.response.data.field]: error.response.data.message
        });
      }
    }
  };

  // Handle forgot password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotPasswordErrors({});

    const newErrors: Record<string, string> = {};
    if (!forgotPasswordData.identifier.trim()) {
      newErrors.identifier = forgotPasswordData.type === 'email' ? 'Email é obrigatório' : 'Telefone é obrigatório';
    } else if (forgotPasswordData.type === 'email' && !/\S+@\S+\.\S+/.test(forgotPasswordData.identifier)) {
      newErrors.identifier = 'Email inválido';
    }

    if (Object.keys(newErrors).length > 0) {
      setForgotPasswordErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(forgotPasswordData),
      });

      const data = await response.json();

      if (data.success) {
        setIsForgotPasswordModalOpen(false);
        setIsResetPasswordModalOpen(true);
        setResetPasswordData(prev => ({ ...prev, type: forgotPasswordData.type }));
        
        toast({
          title: "Código enviado!",
          description: data.message,
        });
      } else {
        if (data.field && data.message) {
          setForgotPasswordErrors({
            [data.field]: data.message
          });
        } else {
          toast({
            variant: "destructive",
            title: "Erro",
            description: data.message || "Erro ao enviar código de recuperação",
          });
        }
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro de conexão. Tente novamente.",
      });
    }
  };

  // Handle reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetPasswordErrors({});

    const newErrors: Record<string, string> = {};
    if (!resetPasswordData.token.trim()) {
      newErrors.token = resetPasswordData.type === 'email' ? 'Token é obrigatório' : 'Código é obrigatório';
    }
    if (!resetPasswordData.newPassword.trim()) {
      newErrors.newPassword = 'Nova senha é obrigatória';
    } else if (resetPasswordData.newPassword.length < 8) {
      newErrors.newPassword = 'Senha deve ter pelo menos 8 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(resetPasswordData.newPassword)) {
      newErrors.newPassword = 'Senha deve conter maiúscula, minúscula e números';
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não conferem';
    }

    if (Object.keys(newErrors).length > 0) {
      setResetPasswordErrors(newErrors);
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetPasswordData.token,
          newPassword: resetPasswordData.newPassword,
          type: resetPasswordData.type
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsResetPasswordModalOpen(false);
        setResetPasswordData({
          token: '',
          newPassword: '',
          confirmPassword: '',
          type: 'email'
        });
        
        toast({
          title: "Senha redefinida!",
          description: "Sua senha foi alterada com sucesso. Faça login novamente.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Erro",
          description: data.message || "Erro ao redefinir senha",
        });
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro de conexão. Tente novamente.",
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Login - Core Guilherme Vasques</title>
        <meta name="description" content="Acesse a plataforma completa de inteligência artificial para Amazon FBA e e-commerce. Transforme seu negócio na Amazon." />
      </Helmet>

      <div className="login-container-optimized bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated background glow effects */}
        <div className="absolute inset-0">
          {/* Orb 1 - simplified */}
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/15 to-indigo-400/15 rounded-full blur-3xl animate-pulse-slow" />
          
          {/* Orb 2 - simplified */}
          <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-float" />
        </div>
        
        <div className="relative z-10 flex">
          {/* Left Column - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full login-card-responsive">
              {/* Premium Badge */}
              <div className="flex justify-center mb-4">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
                  <Shield className="w-3 h-3 mr-1.5" />
                  Plataforma Premium
                </span>
              </div>

              {/* Logo and Title */}
              <div className="text-center mb-6">
                <div className="flex justify-center mb-4">
                  <img 
                    src={logoPath} 
                    alt="Guilherme Vasques Logo" 
                    className="h-12 w-auto"
                  />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Core Guilherme Vasques
                </h1>
                <p className="text-gray-600 text-sm">
                  Plataforma completa de inteligência artificial para Amazon FBA e e-commerce
                </p>
              </div>

              {/* Login Card */}
              <Card className="shadow-lg border border-white/30 bg-white/90 backdrop-blur-sm login-form-compact">
                <CardHeader className="pb-3">
                  <div className="text-center">
                    <h2 className="text-lg font-semibold text-gray-900">Fazer Login</h2>
                    <p className="text-gray-600 mt-0.5 text-sm">Acesse sua conta para continuar</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Field */}
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-medium text-gray-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={`pl-9 h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                            errors.email ? 'border-red-500' : ''
                          }`}
                          disabled={isLoading}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-medium text-gray-700">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className={`pl-9 pr-9 h-9 text-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                            errors.password ? 'border-red-500' : ''
                          }`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-9 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                          Entrando...
                        </div>
                      ) : (
                        'Entrar'
                      )}
                    </Button>
                  </form>

                  {/* Footer Links */}
                  <div className="mt-4 text-center space-y-2">
                    <div className="flex flex-col gap-1.5">
                      <button 
                        type="button"
                        onClick={() => setIsForgotPasswordCodeModalOpen(true)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-all duration-200"
                      >
                        Esqueci minha senha (Código por Email)
                      </button>
                      <button 
                        type="button"
                        onClick={() => setIsForgotPasswordModalOpen(true)}
                        className="text-gray-500 hover:text-gray-700 text-xs font-medium hover:underline transition-all duration-200"
                      >
                        Outras opções de recuperação
                      </button>
                    </div>
                    <div className="text-gray-500 text-sm">
                      Ainda não tem acesso? {' '}
                      <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
                        <DialogTrigger asChild>
                          <button 
                            type="button"
                            className="text-blue-600 hover:text-blue-700 font-medium hover:underline transition-all duration-200"
                          >
                            Cadastre-se aqui
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle className="text-center text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                              <UserPlus className="w-5 h-5" />
                              Criar Conta
                            </DialogTitle>
                          </DialogHeader>
                          <form onSubmit={handleRegisterSubmit} className="space-y-4">
                            {/* Name Field */}
                            <div className="space-y-2">
                              <Label htmlFor="register-name" className="text-sm font-medium text-gray-700">
                                Nome completo
                              </Label>
                              <Input
                                id="register-name"
                                name="name"
                                type="text"
                                placeholder="Seu nome completo"
                                value={registerData.name}
                                onChange={handleRegisterChange}
                                className={`h-10 ${registerErrors.name ? 'border-red-500' : ''}`}
                                disabled={isLoading}
                              />
                              {registerErrors.name && (
                                <p className="text-sm text-red-600">{registerErrors.name}</p>
                              )}
                            </div>

                            {/* Email Field */}
                            <div className="space-y-2">
                              <Label htmlFor="register-email" className="text-sm font-medium text-gray-700">
                                Email
                              </Label>
                              <Input
                                id="register-email"
                                name="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={registerData.email}
                                onChange={handleRegisterChange}
                                className={`h-10 ${registerErrors.email ? 'border-red-500' : ''}`}
                                disabled={isLoading}
                              />
                              {registerErrors.email && (
                                <p className="text-sm text-red-600">{registerErrors.email}</p>
                              )}
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-2">
                              <Label htmlFor="register-phone" className="text-sm font-medium text-gray-700">
                                Telefone WhatsApp <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  id="register-phone"
                                  name="phone"
                                  type="tel"
                                  placeholder="11999999999"
                                  value={registerData.phone}
                                  onChange={handleRegisterChange}
                                  className={`pl-10 h-10 ${registerErrors.phone ? 'border-red-500' : ''}`}
                                  disabled={isLoading}
                                />
                              </div>
                              {registerErrors.phone && (
                                <p className="text-sm text-red-600">{registerErrors.phone}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                Obrigatório para verificação via código WhatsApp
                              </p>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                              <Label htmlFor="register-password" className="text-sm font-medium text-gray-700">
                                Senha <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  id="register-password"
                                  name="password"
                                  type={showRegisterPassword ? 'text' : 'password'}
                                  placeholder="••••••••"
                                  value={registerData.password}
                                  onChange={handleRegisterChange}
                                  className={`pl-10 pr-10 h-10 ${registerErrors.password ? 'border-red-500' : ''}`}
                                  disabled={isLoading}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                  {showRegisterPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                              </div>
                              {registerErrors.password && (
                                <p className="text-sm text-red-600">{registerErrors.password}</p>
                              )}
                              <p className="text-xs text-gray-500">
                                Mínimo 8 caracteres, com maiúscula, minúscula e número
                              </p>
                            </div>

                            {/* Confirm Password Field */}
                            <div className="space-y-2">
                              <Label htmlFor="register-confirm-password" className="text-sm font-medium text-gray-700">
                                Repita a Senha <span className="text-red-500">*</span>
                              </Label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  id="register-confirm-password"
                                  name="confirmPassword"
                                  type="password"
                                  placeholder="••••••••"
                                  value={registerData.confirmPassword}
                                  onChange={handleRegisterChange}
                                  className={`pl-10 h-10 ${registerErrors.confirmPassword ? 'border-red-500' : ''}`}
                                  disabled={isLoading}
                                />
                              </div>
                              {registerErrors.confirmPassword && (
                                <p className="text-sm text-red-600">{registerErrors.confirmPassword}</p>
                              )}
                            </div>

                            {/* Terms Acceptance */}
                            <div className="space-y-3 pt-2">
                              <div className="flex items-start space-x-2">
                                <Checkbox 
                                  id="acceptedTerms"
                                  checked={registerData.acceptedTerms}
                                  onCheckedChange={(checked) => 
                                    setRegisterData(prev => ({ ...prev, acceptedTerms: !!checked }))
                                  }
                                  className="mt-0.5"
                                />
                                <Label htmlFor="acceptedTerms" className="text-xs text-gray-600 leading-relaxed">
                                  Ao cadastrar-se na ferramenta, você aceita os{' '}
                                  <a 
                                    href="/termos-de-uso" 
                                    className="text-blue-600 hover:text-blue-700 underline cursor-pointer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Termos de Uso
                                  </a>
                                  {' '}e a{' '}
                                  <a 
                                    href="/politica-de-privacidade" 
                                    className="text-blue-600 hover:text-blue-700 underline cursor-pointer"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Política de Privacidade
                                  </a>
                                  <span className="text-red-500"> *</span>
                                </Label>
                              </div>
                              {registerErrors.acceptedTerms && (
                                <p className="text-sm text-red-600">{registerErrors.acceptedTerms}</p>
                              )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex gap-3 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsRegisterModalOpen(false)}
                                disabled={isLoading}
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                disabled={isLoading}
                              >
                                {isLoading ? (
                                  <div className="flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                                    Criando...
                                  </div>
                                ) : (
                                  <>
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Criar Conta
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Support Link */}
              <div className="text-center mt-8">
                <p className="text-gray-500 text-sm">
                  Precisa de ajuda? Entre em contato com{' '}
                  <a 
                    href="mailto:suporte@guilhermevasques.app" 
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    suporte@guilhermevasques.app
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Features Showcase */}
          <div className="hidden lg:flex lg:w-1/2 p-12 items-center relative">
            <div className="w-full max-w-2xl">
              {/* Premium Badge - Floating */}
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-8 shadow-lg">
                <Crown className="w-4 h-4 mr-2" />
                Plataforma Premium
              </div>

              {/* Main Title - No background */}
              <div className="mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  Transforme seu negócio na <span className="text-blue-600">Amazon</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Mais de 10 agentes de IA especializados para otimizar suas vendas, 
                  criar conteúdo profissional e automatizar processos complexos.
                </p>
              </div>

              {/* Features Grid - Floating Cards */}
              <div className="grid grid-cols-2 gap-6 mb-12">
                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mr-4">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">10+ Agentes de IA</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Agentes especializados em Amazon FBA, SEO e e-commerce</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mr-4">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Geração de Imagens</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Crie fotografias profissionais e infográficos</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mr-4">
                      <BarChart3 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Análise de Keywords</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Pesquisa e otimização de palavras-chave</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mr-4">
                      <ShoppingBag className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Otimização de Listagens</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Títulos, bullet points e descrições otimizadas</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mr-4">
                      <TrendingUp className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Atendimento ao Cliente</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Respostas inteligentes para avaliações e emails</p>
                </div>

                <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  <div className="flex items-center mb-3">
                    <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mr-4">
                      <BarChart3 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Simuladores Financeiros</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Cálculos de ROI, impostos e custos</p>
                </div>
              </div>

              {/* CTA Section - Floating */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-2xl border border-blue-500/20">
                <div className="flex items-center mb-4">
                  <Zap className="w-6 h-6 mr-3" />
                  <h3 className="text-xl font-semibold">Pronto para começar?</h3>
                </div>
                <p className="text-blue-100 mb-0">
                  Junte-se a centenas de vendedores que já estão usando nossa 
                  plataforma para escalar seus negócios na Amazon.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Forgot Password Modal */}
        <Dialog open={isForgotPasswordModalOpen} onOpenChange={setIsForgotPasswordModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                Recuperar Senha
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              {/* Recovery Type Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Como você deseja receber o código?</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="email"
                      checked={forgotPasswordData.type === 'email'}
                      onChange={(e) => setForgotPasswordData(prev => ({ ...prev, type: e.target.value as 'email' | 'phone' }))}
                      className="mr-2"
                    />
                    <Mail className="w-4 h-4 mr-1" />
                    Email
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="type"
                      value="phone"
                      checked={forgotPasswordData.type === 'phone'}
                      onChange={(e) => setForgotPasswordData(prev => ({ ...prev, type: e.target.value as 'email' | 'phone' }))}
                      className="mr-2"
                    />
                    <Phone className="w-4 h-4 mr-1" />
                    WhatsApp
                  </label>
                </div>
              </div>

              {/* Identifier Field */}
              <div className="space-y-2">
                <Label htmlFor="identifier" className="text-sm font-medium text-gray-700">
                  {forgotPasswordData.type === 'email' ? 'Email' : 'Telefone'}
                </Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type={forgotPasswordData.type === 'email' ? 'email' : 'tel'}
                  placeholder={forgotPasswordData.type === 'email' ? 'seu@email.com' : '11999999999'}
                  value={forgotPasswordData.identifier}
                  onChange={(e) => setForgotPasswordData(prev => ({ ...prev, identifier: e.target.value }))}
                  className={`h-10 ${forgotPasswordErrors.identifier ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {forgotPasswordErrors.identifier && (
                  <p className="text-sm text-red-600">{forgotPasswordErrors.identifier}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsForgotPasswordModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Enviando...
                    </div>
                  ) : (
                    'Enviar Código'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Reset Password Modal */}
        <Dialog open={isResetPasswordModalOpen} onOpenChange={setIsResetPasswordModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <Lock className="w-5 h-5" />
                Nova Senha
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Token/Code Field */}
              <div className="space-y-2">
                <Label htmlFor="reset-token" className="text-sm font-medium text-gray-700">
                  {resetPasswordData.type === 'email' ? 'Token do Email' : 'Código do WhatsApp'}
                </Label>
                <Input
                  id="reset-token"
                  name="token"
                  type="text"
                  placeholder={resetPasswordData.type === 'email' ? 'Token recebido no email' : '123456'}
                  value={resetPasswordData.token}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, token: e.target.value }))}
                  className={`h-10 ${resetPasswordErrors.token ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {resetPasswordErrors.token && (
                  <p className="text-sm text-red-600">{resetPasswordErrors.token}</p>
                )}
              </div>

              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="reset-password" className="text-sm font-medium text-gray-700">
                  Nova Senha
                </Label>
                <Input
                  id="reset-password"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  className={`h-10 ${resetPasswordErrors.newPassword ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {resetPasswordErrors.newPassword && (
                  <p className="text-sm text-red-600">{resetPasswordErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="reset-confirm-password" className="text-sm font-medium text-gray-700">
                  Confirmar Nova Senha
                </Label>
                <Input
                  id="reset-confirm-password"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  className={`h-10 ${resetPasswordErrors.confirmPassword ? 'border-red-500' : ''}`}
                  disabled={isLoading}
                />
                {resetPasswordErrors.confirmPassword && (
                  <p className="text-sm text-red-600">{resetPasswordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsResetPasswordModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Alterando...
                    </div>
                  ) : (
                    'Alterar Senha'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Forgot Password Code Modal */}
        <Dialog open={isForgotPasswordCodeModalOpen} onOpenChange={setIsForgotPasswordCodeModalOpen}>
          <DialogContent className="sm:max-w-md p-0">
            <ForgotPasswordCodeForm 
              onBack={() => setIsForgotPasswordCodeModalOpen(false)}
            />
          </DialogContent>
        </Dialog>
        
        {/* Footer with legal links */}
        <Footer variant="login" />
      </div>
    </>
  );
}