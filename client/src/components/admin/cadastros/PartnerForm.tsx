
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
import { Partner, PARTNER_CATEGORIES, PartnerContact } from '@/types/partner';
import { useToast } from '@/hooks/use-toast';

import type { Partner as DbPartner } from '@shared/schema';

interface PartnerFormProps {
  partner?: DbPartner | null;
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
    logo: partner?.logo || '',
    categoryId: partner?.categoryId ? partner.categoryId.toString() : '',
    specialties: partner?.specialties || '',
    description: partner?.description || '',
    about: partner?.about || '',
    services: partner?.services || '',
    address: partner?.address || {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    website: partner?.website || '',
    instagram: partner?.instagram || '',
    linkedin: partner?.linkedin || '',
    isVerified: partner?.isVerified || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.categoryId) {
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
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone,
      logo: formData.logo || null,
      categoryId: parseInt(formData.categoryId),
      specialties: formData.specialties,
      description: formData.description,
      about: formData.about,
      services: formData.services,
      address: formData.address,
      website: formData.website,
      instagram: formData.instagram,
      linkedin: formData.linkedin,
      isVerified: formData.isVerified,
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

  const addContact = () => {
    const newContact: PartnerContact = {
      id: Date.now().toString(),
      type: 'phone',
      value: '',
      label: 'Novo contato'
    };

    setFormData(prev => ({
      ...prev,
      contacts: [...prev.contacts, newContact]
    }));
  };

  const updateContact = (index: number, field: keyof PartnerContact, value: string) => {
    setFormData(prev => ({
      ...prev,
      contacts: prev.contacts.map((contact, i) => 
        i === index ? { ...contact, [field]: value } : contact
      )
    }));
  };

  const removeContact = (index: number) => {
    if (formData.contacts.length > 1) {
      setFormData(prev => ({
        ...prev,
        contacts: prev.contacts.filter((_, i) => i !== index)
      }));
    }
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
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="basic" className="text-slate-300">Básico</TabsTrigger>
              <TabsTrigger value="details" className="text-slate-300">Detalhes</TabsTrigger>
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
                <Textarea
                  value={formData.specialties}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                  rows={3}
                  placeholder="Digite as especialidades separadas por vírgula"
                />
              </div>

              <div>
                <Label className="text-slate-300">Serviços</Label>
                <Textarea
                  value={formData.services}
                  onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value }))}
                  className="bg-slate-700 border-slate-600 text-slate-100"
                  rows={4}
                  placeholder="Descreva os serviços oferecidos"
                />
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

              <div>
                <Label className="text-slate-300">Contatos</Label>
                {formData.contacts.map((contact, index) => (
                  <div key={contact.id} className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-2">
                    <Select 
                      value={contact.type} 
                      onValueChange={(value: 'phone' | 'email' | 'whatsapp' | 'website') => 
                        updateContact(index, 'type', value)
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600">
                        <SelectItem value="phone" className="text-slate-100">Telefone</SelectItem>
                        <SelectItem value="email" className="text-slate-100">Email</SelectItem>
                        <SelectItem value="whatsapp" className="text-slate-100">WhatsApp</SelectItem>
                        <SelectItem value="website" className="text-slate-100">Website</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Valor do contato"
                      value={contact.value}
                      onChange={(e) => updateContact(index, 'value', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                    <Input
                      placeholder="Label (opcional)"
                      value={contact.label || ''}
                      onChange={(e) => updateContact(index, 'label', e.target.value)}
                      className="bg-slate-700 border-slate-600 text-slate-100"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeContact(index)}
                      className="border-slate-600 text-slate-300"
                      disabled={formData.contacts.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContact}
                  className="mt-2 border-slate-600 text-slate-300"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Contato
                </Button>
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
