/**
 * Modern Login Page - Redesigned based on user requirements
 * Features professional design with Guilherme Vasques branding
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Eye, EyeOff, Mail, Lock, Users, BarChart3, Zap, ShoppingBag, TrendingUp, Shield, Crown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
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
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      await login(formData.email, formData.password);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo de volta.",
      });
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

  return (
    <>
      <Helmet>
        <title>Login - Core Guilherme Vasques</title>
        <meta name="description" content="Acesse a plataforma completa de inteligência artificial para Amazon FBA e e-commerce. Transforme seu negócio na Amazon." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated background glow effects */}
        <div className="absolute inset-0">
          {/* Main glow orb - animated */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-3xl animate-pulse-slow" />
          
          {/* Secondary glow orb - animated */}
          <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-float" />
          
          {/* Tertiary small glow */}
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse-slow" style={{animationDelay: '2s'}} />
          
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.05),transparent_70%)]" />
          <div className="absolute inset-0 opacity-30" style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, rgba(59, 130, 246, 0.1) 2px, transparent 0)`,
            backgroundSize: '50px 50px'
          }} />
        </div>
        
        <div className="relative z-10 flex">
          {/* Left Column - Login Form */}
          <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
            <div className="w-full max-w-md">
              {/* Premium Badge */}
              <div className="flex justify-center mb-8">
                <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  <Shield className="w-4 h-4 mr-2" />
                  Plataforma Premium
                </span>
              </div>

              {/* Logo and Title */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <img 
                    src={logoPath} 
                    alt="Guilherme Vasques Logo" 
                    className="h-16 w-auto"
                  />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Core Guilherme Vasques
                </h1>
                <p className="text-gray-600">
                  Plataforma completa de inteligência artificial para Amazon FBA e e-commerce
                </p>
              </div>

              {/* Login Card */}
              <Card className="shadow-2xl border border-white/30 bg-white/90 backdrop-blur-md">
                <CardHeader className="pb-4">
                  <div className="text-center">
                    <h2 className="text-xl font-semibold text-gray-900">Fazer Login</h2>
                    <p className="text-gray-600 mt-1">Acesse sua conta para continuar</p>
                  </div>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="seu@email.com"
                          value={formData.email}
                          onChange={handleChange}
                          className={`pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
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
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Senha
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className={`pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                            errors.password ? 'border-red-500' : ''
                          }`}
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-sm text-red-600">{errors.password}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
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
                  <div className="mt-6 text-center space-y-3">
                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Esqueci minha senha
                    </button>
                    <div className="text-gray-500 text-sm">
                      Ainda não tem acesso? {' '}
                      <button className="text-blue-600 hover:text-blue-700 font-medium">
                        Cadastre-se
                      </button>
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
      </div>
    </>
  );
}