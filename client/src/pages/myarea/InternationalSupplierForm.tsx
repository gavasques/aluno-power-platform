import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/useAuth';
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Globe, Save, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupplierFormData {
  corporateName: string;
  tradeName: string;
  country: string;
  state: string;
  city: string;
  postalCode: string;
  address: string;
  phone: string;
  fax: string;
  mobile: string;
  email: string;
  website: string;
  description: string;
  status: 'ativo' | 'inativo';
  categoryId?: number;
}

export default function InternationalSupplierForm() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  const [formData, setFormData] = useState<SupplierFormData>({
    corporateName: '',
    tradeName: '',
    country: '',
    state: '',
    city: '',
    postalCode: '',
    address: '',
    phone: '',
    fax: '',
    mobile: '',
    email: '',
    website: '',
    description: '',
    status: 'ativo',
    categoryId: undefined
  });

  // Carregar departamentos (categorias)
  useEffect(() => {
    if (!token) return;

    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCategories(data || []);
        }
      } catch (error) {

      }
    };

    fetchDepartments();
  }, [token]);

  const handleInputChange = (field: keyof SupplierFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Erro",
        description: "Token de autenticação não encontrado",
        variant: "destructive"
      });
      return;
    }

    // Validação básica
    if (!formData.corporateName.trim() || !formData.country.trim()) {
      toast({
        title: "Erro",
        description: "Nome corporativo e país são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/international-suppliers', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Tentar fazer parse do JSON apenas se a resposta for ok
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          // Se não conseguir fazer parse do JSON, considerar sucesso mesmo assim

        }

        toast({
          title: "Sucesso",
          description: "Fornecedor internacional criado com sucesso!"
        });
        
        // Redirecionar para o CRM completo do fornecedor recém-criado
        if (data && data.data && data.data.id) {
          navigate(`/minha-area/importacoes/fornecedores/${data.data.id}`);
        } else {
          // Fallback para a lista de fornecedores
          navigate('/minha-area/importacoes/fornecedores');
        }
      } else {
        // Tentar obter a mensagem de erro
        let errorMessage = 'Erro ao criar fornecedor';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se não conseguir fazer parse, usar mensagem padrão
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
    } catch (error: any) {

      toast({
        title: "Erro",
        description: error.message || "Erro inesperado ao criar fornecedor",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/minha-area/importacoes/fornecedores">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Fornecedores
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Globe className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Novo Fornecedor Internacional</h1>
          </div>
          <p className="text-gray-600">Cadastre um novo fornecedor especializado para importações</p>
        </div>
      </div>
      {/* Formulário */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-600" />
              Informações do Fornecedor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Informações Básicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="corporateName">
                  Nome Corporativo *
                </Label>
                <Input
                  id="corporateName"
                  value={formData.corporateName}
                  onChange={(e) => handleInputChange('corporateName', e.target.value)}
                  placeholder="Nome oficial da empresa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tradeName">Nome Comercial</Label>
                <Input
                  id="tradeName"
                  value={formData.tradeName}
                  onChange={(e) => handleInputChange('tradeName', e.target.value)}
                  placeholder="Nome fantasia/comercial"
                />
              </div>
            </div>

            {/* Localização */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">
                  País *
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Ex: China, Estados Unidos"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado/Província</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="Ex: Guangdong, California"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade/Distrito</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Ex: Shenzhen, Los Angeles"
                />
              </div>
            </div>

            {/* Endereço */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-3 space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Endereço completo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">CEP/Código Postal</Label>
                <Input
                  id="postalCode"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="Ex: 518000"
                />
              </div>
            </div>

            {/* Contato */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Ex: +86 755 1234 5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fax">FAX</Label>
                <Input
                  id="fax"
                  value={formData.fax}
                  onChange={(e) => handleInputChange('fax', e.target.value)}
                  placeholder="Ex: +86 755 1234 5679"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile</Label>
                <Input
                  id="mobile"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  placeholder="Ex: +86 138 0013 8000"
                />
              </div>
            </div>

            {/* E-mail e Website */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="email@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://www.empresa.com"
                />
              </div>
            </div>

            {/* Categoria e Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryId">Categoria</Label>
                <select
                  id="categoryId"
                  value={formData.categoryId || ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    setFormData(prev => ({ ...prev, categoryId: value }));
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'ativo' | 'inativo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Descrição da empresa, produtos oferecidos, especialidades, etc."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botões de Ação */}
        <div className="mt-6 flex gap-4 justify-end">
          <Link href="/minha-area/importacoes/fornecedores">
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </Link>
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Fornecedor
              </>
            )}
          </Button>
        </div>
      </form>
      {/* Aviso Informativo */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-800 mb-1">Sistema Especializado</h4>
            <p className="text-sm text-blue-700">
              Este formulário é específico para <strong>fornecedores internacionais</strong> de importação. 
              Para fornecedores nacionais, utilize o sistema em <Link href="/minha-area/fornecedores" className="underline font-medium">Meus Fornecedores</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}