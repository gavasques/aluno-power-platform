import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  User, 
  FileText
} from "lucide-react";
import { useSuppliers } from "@/contexts/SuppliersContext";
import { SUPPLIER_CATEGORIES, SUPPLIER_DEPARTMENTS, FILE_TYPES, SupplierFile } from "@/types/supplier";
import { useToast } from "@/hooks/use-toast";

const SupplierForm = () => {
  const [match, params] = useRoute('/admin/conteudo/fornecedores/:id?/:action?');
  const [, setLocation] = useLocation();
  const { addSupplier, updateSupplier, getSupplierById } = useSuppliers();
  const { toast } = useToast();
  
  const id = params?.id;
  const isEditing = id && id !== 'novo';
  const supplier = isEditing ? getSupplierById(id) : null;

  // Estados do formulário principal
  const [formData, setFormData] = useState({
    tradeName: '',
    corporateName: '',
    categoryId: '',
    departmentId: '',
    notes: '',
    commercialTerms: '',
    isVerified: false,
    logo: ''
  });

  // Estados para contatos múltiplos
  const [contacts, setContacts] = useState([
    { name: '', role: '', phone: '', whatsapp: '', email: '', notes: '' }
  ]);

  // Estados para arquivos - corrigindo o tipo
  const [files, setFiles] = useState<SupplierFile[]>([]);
  
  // Estado para departamentos
  const [departments, setDepartments] = useState<any[]>([]);

  // Carregar departamentos
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        const data = await response.json();
        setDepartments(data);
      } catch (error) {
        console.error('Erro ao carregar departamentos:', error);
      }
    };

    fetchDepartments();
  }, []);

  // Carregar dados do fornecedor se estiver editando
  useEffect(() => {
    if (supplier) {
      setFormData({
        tradeName: supplier.tradeName,
        corporateName: supplier.corporateName || '',
        categoryId: supplier.categoryId?.toString() || '',
        departmentId: '', // Por enquanto vazio até implementar no backend
        notes: supplier.notes || '',
        commercialTerms: '', // Por enquanto vazio até implementar no backend
        isVerified: supplier.isVerified,
        logo: supplier.logo || ''
      });
    }
  }, [supplier]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCategory = SUPPLIER_CATEGORIES.find(cat => cat.id === formData.categoryId);
    const selectedDepartment = departments.find(dept => dept.id.toString() === formData.departmentId);
    
    if (!selectedCategory) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um tipo de fornecedor.",
        variant: "destructive"
      });
      return;
    }

    // Preparar contatos simples para formulário
    const contactsWithIds = contacts.filter(contact => contact.name.trim() !== '').map(contact => ({
      ...contact,
      id: Date.now().toString() + Math.random()
    }));

    // Preparar arquivos simples para formulário
    const filesWithIds = files.filter(file => file.name.trim() !== '').map(file => ({
      ...file,
      id: Date.now().toString() + Math.random(),
      uploadedAt: new Date().toISOString()
    }));

    const supplierData = {
      tradeName: formData.tradeName,
      corporateName: formData.corporateName,
      category: selectedCategory,
      department: selectedDepartment,
      categoryId: parseInt(formData.categoryId),
      departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
      brands: isEditing ? supplier?.brands || [] : [],
      notes: formData.notes,
      contacts: contactsWithIds,
      files: filesWithIds,
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

    setLocation('/admin/conteudo/fornecedores');
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

  const addFile = () => {
    const newFile: SupplierFile = {
      id: Date.now().toString(),
      name: '',
      description: '',
      type: 'catalog',
      fileUrl: '',
      size: 0,
      uploadedAt: new Date().toISOString()
    };
    setFiles([...files, newFile]);
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const updateFile = (index: number, field: keyof SupplierFile, value: string | number) => {
    const updatedFiles = [...files];
    updatedFiles[index] = { ...updatedFiles[index], [field]: value };
    setFiles(updatedFiles);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          onClick={() => setLocation('/admin/conteudo/fornecedores')}
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
            <TabsTrigger value="files">Arquivos</TabsTrigger>
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
                    <Label htmlFor="corporateName">Razão Social</Label>
                    <Input
                      id="corporateName"
                      value={formData.corporateName}
                      onChange={(e) => setFormData({ ...formData, corporateName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Tipo de Fornecedor *</Label>
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
                  <Label htmlFor="department">Departamento Principal</Label>
                  <Select value={formData.departmentId} onValueChange={(value) => setFormData({ ...formData, departmentId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um departamento" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(department => (
                        <SelectItem key={department.id} value={department.id.toString()}>
                          {department.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

          <TabsContent value="files" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Arquivos do Fornecedor</CardTitle>
                  <Button type="button" onClick={addFile}>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Arquivo
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {files.map((file, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <h4 className="font-medium">Arquivo {index + 1}</h4>
                      </div>
                      {files.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Nome do Arquivo</Label>
                        <Input
                          value={file.name}
                          onChange={(e) => updateFile(index, 'name', e.target.value)}
                          placeholder="Ex: Catálogo Produtos 2024"
                        />
                      </div>
                      <div>
                        <Label>Tipo de Arquivo</Label>
                        <Select value={file.type} onValueChange={(value) => updateFile(index, 'type', value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FILE_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>URL do Arquivo</Label>
                        <Input
                          value={file.fileUrl}
                          onChange={(e) => updateFile(index, 'fileUrl', e.target.value)}
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <Label>Tamanho (bytes)</Label>
                        <Input
                          type="number"
                          value={file.size}
                          onChange={(e) => updateFile(index, 'size', parseInt(e.target.value) || 0)}
                          placeholder="2048000"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Descrição</Label>
                        <Textarea
                          value={file.description}
                          onChange={(e) => updateFile(index, 'description', e.target.value)}
                          placeholder="Descrição do arquivo..."
                          rows={2}
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
            onClick={() => setLocation('/admin/conteudo/fornecedores')}
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
