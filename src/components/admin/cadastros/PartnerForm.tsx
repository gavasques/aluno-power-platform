import React, { useState } from 'react';
import { usePartners } from '@/contexts/PartnersContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { Partner, PARTNER_CATEGORIES, PartnerService } from '@/types/partner';
import { useToast } from '@/hooks/use-toast';

interface PartnerFormProps {
  partner?: Partner | null;
  onClose: () => void;
}

const PartnerForm: React.FC<PartnerFormProps> = ({ partner, onClose }) => {
  const { addPartner, updatePartner } = usePartners();
  const { toast } = useToast();
  const isEditing = !!partner;

  const [formData, setFormData] = useState({
    name: partner?.name || '',
    email: partner?.email || '',
    phone: partner?.phone || '',
    categoryId: partner?.category.id || '',
    specialties: partner?.specialties || [''],
    description: partner?.description || '',
    about: partner?.about || '',
    services: partner?.services || [],
    address: {
      street: partner?.address.street || '',
      city: partner?.address.city || '',
      state: partner?.address.state || '',
      zipCode: partner?.address.zipCode || '',
    },
    website: partner?.website || '',
    instagram: partner?.instagram || '',
    linkedin: partner?.linkedin || '',
    certifications: partner?.certifications || [''],
    isVerified: partner?.isVerified || false,
  });

  const [newService, setNewService] = useState<Partial<PartnerService>>({
    name: '',
    description: '',
    price: '',
    duration: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.categoryId) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const selectedCategory = PARTNER_CATEGORIES.find(cat => cat.id === formData.categoryId);
    if (!selectedCategory) {
      toast({
        title: 'Erro',
        description: 'Categoria inválida.',
        variant: 'destructive',
      });
      return;
    }

    const partnerData = {
      ...formData,
      category: selectedCategory,
      specialties: formData.specialties.filter(s => s.trim()),
      certifications: formData.certifications.filter(c => c.trim()),
      portfolio: partner?.portfolio || [],
    };

    try {
      if (isEditing && partner) {
        updatePartner(partner.id, partnerData);
        toast({
          title: 'Sucesso',
          description: 'Parceiro atualizado com sucesso!',
        });
      } else {
        addPartner(partnerData);
        toast({
          title: 'Sucesso',
          description: 'Parceiro adicionado com sucesso!',
        });
      }
      onClose();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o parceiro.',
        variant: 'destructive',
      });
    }
  };

  const addSpecialty = () => {
    setFormData(prev => ({
      ...prev,
      specialties: [...prev.specialties, '']
    }));
  };

  const updateSpecialty = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.map((spec, i) => i === index ? value : spec)
    }));
  };

  const removeSpecialty = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index)
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const updateCertification = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => i === index ? value : cert)
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const addService = () => {
    if (!newService.name || !newService.description) {
      toast({
        title: 'Erro',
        description: 'Preencha nome e descrição do serviço.',
        variant: 'destructive',
      });
      return;
    }

    const service: PartnerService = {
      id: Date.now().toString(),
      name: newService.name,
      description: newService.description,
      price: newService.price,
      duration: newService.duration,
    };

    setFormData(prev => ({
      ...prev,
      services: [...prev.services, service]
    }));

    setNewService({
      name: '',
      description: '',
      price: '',
      duration: '',
    });
  };

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            {isEditing ? 'Editar Parceiro' : 'Novo Parceiro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-slate-700">
              <TabsTrigger value="basic" className="text-slate-300">Básico</TabsTrigger>
              <TabsTrigger value="details" className="text-slate-300">Detalhes</TabsTrigger>
              <TabsTrigger value="services" className="text-slate-300">Serviços</TabsTrigger>
              <TabsTrigger value="contact" className="text-slate-300">Contato</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300">Nome *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    required
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Categoria *</Label>
                  <Select value={formData.categoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}>
                    <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-700 border-slate-600">
                      {PARTNER_CATEGORIES.map(category => (
                        <SelectItem key={category.id} value={category.id} className="text-slate-100">
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-slate-300">Descrição Breve</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                  rows={2}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked }))}
                />
                <Label className="text-slate-300">Parceiro Verificado</Label>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div>
                <Label className="text-slate-300">Sobre</Label>
                <Textarea
                  value={formData.about}
                  onChange={(e) => setFormData(prev => ({ ...prev, about: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                  rows={4}
                />
              </div>

              <div>
                <Label className="text-slate-300">Especialidades</Label>
                {formData.specialties.map((specialty, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={specialty}
                      onChange={(e) => updateSpecialty(index, e.target.value)}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="Digite uma especialidade"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeSpecialty(index)}
                      className="border-slate-600 text-slate-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addSpecialty}
                  className="mt-2 border-slate-600 text-slate-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Especialidade
                </Button>
              </div>

              <div>
                <Label className="text-slate-300">Certificações</Label>
                {formData.certifications.map((cert, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <Input
                      value={cert}
                      onChange={(e) => updateCertification(index, e.target.value)}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                      placeholder="Digite uma certificação"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeCertification(index)}
                      className="border-slate-600 text-slate-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCertification}
                  className="mt-2 border-slate-600 text-slate-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Certificação
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="services" className="space-y-4">
              <div>
                <Label className="text-slate-300">Serviços Oferecidos</Label>
                
                {/* Existing Services */}
                <div className="space-y-2 mt-2">
                  {formData.services.map((service, index) => (
                    <div key={service.id} className="border border-slate-600 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-slate-100">{service.name}</h4>
                          <p className="text-sm text-slate-400 mt-1">{service.description}</p>
                          <div className="flex gap-4 mt-2 text-sm text-slate-300">
                            {service.price && <span>Preço: {service.price}</span>}
                            {service.duration && <span>Duração: {service.duration}</span>}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeService(index)}
                          className="border-slate-600 text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add New Service */}
                <div className="border border-slate-600 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-slate-100 mb-3">Adicionar Novo Serviço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-slate-300">Nome do Serviço</Label>
                      <Input
                        value={newService.name}
                        onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Preço (opcional)</Label>
                      <Input
                        value={newService.price}
                        onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                        placeholder="Ex: R$ 500,00"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-slate-300">Descrição</Label>
                      <Textarea
                        value={newService.description}
                        onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label className="text-slate-300">Duração (opcional)</Label>
                      <Input
                        value={newService.duration}
                        onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-slate-100"
                        placeholder="Ex: 15 dias"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={addService}
                    className="mt-3 bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Serviço
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contact" className="space-y-4">
              <div>
                <Label className="text-slate-300">Endereço</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Rua, número"
                      value={formData.address.street}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Cidade"
                      value={formData.address.city}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value }
                      }))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="Estado"
                      value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: e.target.value }
                      }))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>
                  <div>
                    <Input
                      placeholder="CEP"
                      value={formData.address.zipCode}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, zipCode: e.target.value }
                      }))}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-slate-300">Website</Label>
                  <Input
                    value={formData.website}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label className="text-slate-300">Instagram</Label>
                  <Input
                    value={formData.instagram}
                    onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    placeholder="@usuario"
                  />
                </div>
                <div>
                  <Label className="text-slate-300">LinkedIn</Label>
                  <Input
                    value={formData.linkedin}
                    onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                    className="bg-slate-700 border-slate-600 text-slate-100"
                    placeholder="usuario-linkedin"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">
              Cancelar
            </Button>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              {isEditing ? 'Atualizar' : 'Criar'} Parceiro
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PartnerForm;
