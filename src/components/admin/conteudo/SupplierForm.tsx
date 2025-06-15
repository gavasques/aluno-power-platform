
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Building2, 
  User, 
  Phone, 
  Mail 
} from "lucide-react";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { SUPPLIER_CATEGORIES } from "@/types/supplier";
import { useToast } from "@/hooks/use-toast";

const SupplierForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addSupplier, updateSupplier, getSupplierById } = useSuppliers();
  const { toast } = useToast();
  
  const isEditing = id && id !== 'novo';
  const supplier = isEditing ? getSupplierById(id) : null;

  // Estados do formulário principal
  const [formData, setFormData] = useState({
    tradeName: '',
    corporateName: '',
    categoryId: '',
    notes: '',
    email: '',
    mainContact: '',
    phone: '',
    whatsapp: '',
    commercialTerms: '',
    isVerified: false,
    logo: ''
  });

  // Estados para contatos múltiplos
  const [contacts, setContacts] = useState([
    { name: '', role: '', phone: '', whatsapp: '', email: '', notes: '' }
  ]);

  // Estados para filiais múltiplas
  const [branches, setBranches] = useState([
    { 
      name: '', 
      corporateName: '', 
      cnpj: '', 
      municipalRegistration: '', 
      stateRegistration: '', 
      address: '', 
      notes: '' 
    }
  ]);

  // Carregar dados do fornecedor se estiver editando
  useEffect(() => {
    if (supplier) {
      setFormData({
        tradeName: supplier.tradeName,
        corporateName: supplier.corporateName,
        categoryId: supplier.category.id,
        notes: supplier.notes,
        email: supplier.email,
        mainContact: supplier.mainContact,
        phone: supplier.phone,
        whatsapp: supplier.whatsapp,
        commercialTerms: supplier.commercialTerms,
        isVerified: supplier.isVerified,
        logo: supplier.logo || ''
      });
      setContacts(supplier.contacts.length > 0 ? supplier.contacts : [{ name: '', role: '', phone: '', whatsapp: '', email: '', notes: '' }]);
      setBranches(supplier.branches.length > 0 ? supplier.branches : [{ name: '', corporateName: '', cnpj: '', municipalRegistration: '', stateRegistration: '', address: '', notes: '' }]);
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = SUPPLIER_CATEGORIES.find(cat => cat.id === formData.categoryId);
    if (!selectedCategory) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma categoria.",
        variant: "destructive"
      });
      return;
    }

    const supplierData = {
      tradeName: formData.tradeName,
      corporateName: formData.corporateName,
      category: selectedCategory,
      notes: formData.notes,
      email: formData.email,
      mainContact: formData.mainContact,
      phone: formData.phone,
      whatsapp: formData.whatsapp,
      contacts: contacts.filter(contact => contact.name.trim() !== ''),
      branches: branches.filter(branch => branch.name.trim() !== ''),
      commercialTerms: formData.commercialTerms,
      logo: formData.logo,
      isVerified: formData.isVerified
    };

    if (isEditing) {
      updateSupplier(id, supplierData);
      toast({
        title: "Sucesso",
        description: "Fornecedor atualizado com sucesso!"
      });
    } else {
      addSupplier(supplierData);
      toast({
        title: "Sucesso",
        description: "Fornecedor criado com sucesso!"
      });
    }

    navigate('/admin/conteudo/fornecedores');
  };

  const addContact = () => {
    setContacts([...contacts, { name: '', role: '', phone: '', whatsapp: '', email: '', notes: '' }]);
  };

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index));
  };

  const updateContact = (index: number, field: string, value: string) => {
    const updatedContacts = [...contacts];
    updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    setContacts(updatedContacts);
  };

  const addBranch = () => {
    setBranches([...branches, { name: '', corporateName: '', cnpj: '', municipalRegistration: '', stateRegistration: '', address: '', notes: '' }]);
  };

  const removeBranch = (index: number) => {
    setBranches(branches.filter((_, i) => i !== index));
  };

  const updateBranch = (index: number, field: string, value: string) => {
    const updatedBranches = [...branches];
    updatedBranches[index] = { ...updatedBranches[index], [field]: value };
    setBranches(updatedBranches);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/admin/conteudo/fornecedores')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Atualize as informações do fornecedor' : 'Cadastre um novo fornecedor'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Informações Básicas</TabsTrigger>
            <TabsTrigger value="contacts">Contatos</TabsTrigger>
            <TabsTrigger value="branches">Filiais</TabsTrigger>
            <TabsTrigger value="commercial">Termos Comerciais</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações da Empresa</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="tradeName">Nome Fantasia *</Label>
                    <Input
                      id="tradeName"
                      value={formData.tradeName}
                      onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="corporateName">Razão Social *</Label>
                    <Input
                      id="corporateName"
                      value={formData.corporateName}
                      onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Categoria Principal *</Label>
                    <Select value={formData.categoryId} onValueChange={(value) => setFormData({ ...formData, categoryId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUPPLIER_CATEGORIES.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="logo">URL do Logo</Label>
                    <Input
                      id="logo"
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contato Principal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mainContact">Nome do Contato *</Label>
                    <Input
                      id="mainContact"
                      value={formData.mainContact}
                      onChange={(e) => setFormData({ ...formData, mainContact: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Contatos Adicionais</CardTitle>
                  <Button type="button" onClick={addContact}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Contato
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {contacts.map((contact, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <h4 className="font-medium">Contato {index + 1}</h4>
                      </div>
                      {contacts.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeContact(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={contact.name}
                          onChange={(e) => updateContact(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Função</Label>
                        <Input
                          value={contact.role}
                          onChange={(e) => updateContact(index, 'role', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Telefone</Label>
                        <Input
                          value={contact.phone}
                          onChange={(e) => updateContact(index, 'phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>WhatsApp</Label>
                        <Input
                          value={contact.whatsapp}
                          onChange={(e) => updateContact(index, 'whatsapp', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={contact.email}
                          onChange={(e) => updateContact(index, 'email', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Observações</Label>
                        <Input
                          value={contact.notes}
                          onChange={(e) => updateContact(index, 'notes', e.target.value)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="branches" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Filiais</CardTitle>
                  <Button type="button" onClick={addBranch}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Filial
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {branches.map((branch, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        <h4 className="font-medium">Filial {index + 1}</h4>
                      </div>
                      {branches.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeBranch(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome da Filial</Label>
                        <Input
                          value={branch.name}
                          onChange={(e) => updateBranch(index, 'name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Razão Social</Label>
                        <Input
                          value={branch.corporateName}
                          onChange={(e) => updateBranch(index, 'corporateName', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>CNPJ</Label>
                        <Input
                          value={branch.cnpj}
                          onChange={(e) => updateBranch(index, 'cnpj', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Inscrição Municipal</Label>
                        <Input
                          value={branch.municipalRegistration}
                          onChange={(e) => updateBranch(index, 'municipalRegistration', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Inscrição Estadual</Label>
                        <Input
                          value={branch.stateRegistration}
                          onChange={(e) => updateBranch(index, 'stateRegistration', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Endereço</Label>
                        <Input
                          value={branch.address}
                          onChange={(e) => updateBranch(index, 'address', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Observações</Label>
                        <Input
                          value={branch.notes}
                          onChange={(e) => updateBranch(index, 'notes', e.target.value)}
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commercial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Termos Comerciais</CardTitle>
              </CardHeader>
              <CardContent>
                <Label htmlFor="commercialTerms">Condições e Termos</Label>
                <Textarea
                  id="commercialTerms"
                  value={formData.commercialTerms}
                  onChange={(e) => setFormData({ ...formData, commercialTerms: e.target.value })}
                  rows={8}
                  placeholder="Ex: Pagamento: 30 dias&#10;Frete: CIF&#10;Desconto para pedidos acima de R$ 10.000&#10;Garantia de 1 ano em todos os produtos"
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/conteudo/fornecedores')}
          >
            Cancelar
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            {isEditing ? 'Atualizar' : 'Criar'} Fornecedor
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;
