import React, { useState } from 'react';
import { usePartners } from '@/contexts/PartnersContext';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
import { Upload, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Partner as DbPartner, PartnerType } from '@shared/schema';
import { BulletPointEditor } from './BulletPointEditor';
import { PartnerContactsManager } from './PartnerContactsManager';
import { PartnerFilesManager } from './PartnerFilesManager';
import { PhoneInput } from '@/components/ui/phone-input';

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
    partnerTypeId: partner?.partnerTypeId ? partner.partnerTypeId.toString() : '',
    specialties: Array.isArray(partner?.specialties) ? partner.specialties : [],
    description: partner?.description || '',
    website: partner?.website || '',
    instagram: partner?.instagram || '',
    linkedin: partner?.linkedin || '',
    isVerified: partner?.isVerified || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.partnerTypeId) {
      toast({
        title: 'Erro',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    const partnerData = {
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone,
      logo: formData.logo || null,
      partnerTypeId: parseInt(formData.partnerTypeId),
      specialties: Array.isArray(formData.specialties) ? formData.specialties : [],
      description: formData.description,
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

  // Fetch partner types from database
  const { data: partnerTypes = [] } = useQuery<PartnerType[]>({
    queryKey: ['/api/partner-types'],
    queryFn: () => apiRequest<PartnerType[]>('/api/partner-types'),
  });

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">
            {isEditing ? 'Editar Parceiro' : 'Novo Parceiro'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-slate-800">
              <TabsTrigger value="basic" className="text-white data-[state=active]:bg-red-600">
                Básico
              </TabsTrigger>
              <TabsTrigger value="details" className="text-white data-[state=active]:bg-red-600">
                Detalhes
              </TabsTrigger>
              <TabsTrigger value="social" className="text-white data-[state=active]:bg-red-600">
                Redes Sociais
              </TabsTrigger>
              <TabsTrigger value="files" className="text-white data-[state=active]:bg-red-600">
                Arquivos
              </TabsTrigger>
              <TabsTrigger value="contacts" className="text-white data-[state=active]:bg-red-600">
                Contatos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="Nome do parceiro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">Tipo de Parceiro *</Label>
                  <Select
                    value={formData.partnerTypeId}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, partnerTypeId: value }))}
                  >
                    <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                      <SelectValue placeholder="Selecione um tipo" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-600">
                      {partnerTypes.map((type) => (
                        <SelectItem 
                          key={type.id} 
                          value={type.id.toString()}
                          className="text-white hover:bg-slate-700"
                        >
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Telefone</Label>
                  <PhoneInput
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo" className="text-white">Logo (URL)</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo"
                    value={formData.logo}
                    onChange={(e) => setFormData(prev => ({ ...prev, logo: e.target.value }))}
                    className="bg-slate-800 border-slate-600 text-white flex-1"
                    placeholder="https://exemplo.com/logo.png"
                  />
                  {formData.logo && (
                    <div className="w-12 h-12 border border-slate-600 rounded flex items-center justify-center bg-slate-800">
                      <img 
                        src={formData.logo} 
                        alt="Logo preview" 
                        className="w-10 h-10 object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="text-slate-400"><Image size={16} /></div>';
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <BulletPointEditor
                label="Especialidades"
                placeholder="Adicione uma especialidade"
                items={formData.specialties}
                onChange={(items) => setFormData(prev => ({ ...prev, specialties: items }))}
              />
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">Detalhes do Parceiro</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="Informações completas sobre o parceiro, incluindo serviços oferecidos, experiência, diferenciais e outras informações relevantes..."
                  rows={8}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="verified"
                  checked={formData.isVerified}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVerified: checked }))}
                />
                <Label htmlFor="verified" className="text-white">Parceiro Verificado</Label>
              </div>
            </TabsContent>

            <TabsContent value="social" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website" className="text-white">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="https://website.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram" className="text-white">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram}
                  onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="@usuario_instagram"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin" className="text-white">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin: e.target.value }))}
                  className="bg-slate-800 border-slate-600 text-white"
                  placeholder="https://linkedin.com/in/usuario"
                />
              </div>
            </TabsContent>

            <TabsContent value="files" className="space-y-4">
              {isEditing && partner ? (
                <PartnerFilesManager partnerId={partner.id} />
              ) : (
                <div className="text-slate-400 text-center py-8">
                  Salve o parceiro primeiro para gerenciar arquivos
                </div>
              )}
            </TabsContent>

            <TabsContent value="contacts" className="space-y-4">
              {isEditing && partner ? (
                <PartnerContactsManager partnerId={partner.id} />
              ) : (
                <div className="text-slate-400 text-center py-8">
                  Salve o parceiro primeiro para gerenciar contatos
                </div>
              )}
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