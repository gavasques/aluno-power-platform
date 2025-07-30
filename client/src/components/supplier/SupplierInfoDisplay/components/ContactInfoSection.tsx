import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, X, Phone, Mail, MessageSquare, Globe, Linkedin, Instagram, Youtube } from 'lucide-react';
import type { SupplierInfo } from '../types';

interface ContactInfoSectionProps {
  supplier: SupplierInfo;
  isEditing: boolean;
  formData: any;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onSaveChanges: () => void;
  onFieldChange: (field: string, value: any) => void;
  isUpdating: boolean;
}

export const ContactInfoSection = memo<ContactInfoSectionProps>(({
  supplier,
  isEditing,
  formData,
  onStartEditing,
  onCancelEditing,
  onSaveChanges,
  onFieldChange,
  isUpdating
}) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Phone className="w-5 h-5" />
          Informações de Contato
        </CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={onStartEditing}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancelEditing} disabled={isUpdating}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button size="sm" onClick={onSaveChanges} disabled={isUpdating}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commercialEmail">Email Comercial</Label>
                <Input
                  id="commercialEmail"
                  type="email"
                  value={formData.commercialEmail || ''}
                  onChange={(e) => onFieldChange('commercialEmail', e.target.value)}
                  placeholder="comercial@empresa.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Email de Suporte</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={formData.supportEmail || ''}
                  onChange={(e) => onFieldChange('supportEmail', e.target.value)}
                  placeholder="suporte@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp</Label>
                <Input
                  id="whatsappNumber"
                  value={formData.whatsappNumber || ''}
                  onChange={(e) => onFieldChange('whatsappNumber', e.target.value)}
                  placeholder="+55 11 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => onFieldChange('phone', e.target.value)}
                  placeholder="+55 11 3333-3333"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => onFieldChange('website', e.target.value)}
                  placeholder="https://www.empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  value={formData.linkedin || ''}
                  onChange={(e) => onFieldChange('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/company/empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={formData.instagram || ''}
                  onChange={(e) => onFieldChange('instagram', e.target.value)}
                  placeholder="@empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="youtube">YouTube</Label>
                <Input
                  id="youtube"
                  value={formData.youtube || ''}
                  onChange={(e) => onFieldChange('youtube', e.target.value)}
                  placeholder="https://youtube.com/@empresa"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supplier.commercialEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Email Comercial</h4>
                  <a href={`mailto:${supplier.commercialEmail}`} className="text-blue-600 hover:underline">
                    {supplier.commercialEmail}
                  </a>
                </div>
              </div>
            )}

            {supplier.supportEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Email de Suporte</h4>
                  <a href={`mailto:${supplier.supportEmail}`} className="text-blue-600 hover:underline">
                    {supplier.supportEmail}
                  </a>
                </div>
              </div>
            )}

            {supplier.whatsappNumber && (
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">WhatsApp</h4>
                  <a href={`https://wa.me/${supplier.whatsappNumber.replace(/\D/g, '')}`} className="text-green-600 hover:underline">
                    {supplier.whatsappNumber}
                  </a>
                </div>
              </div>
            )}

            {supplier.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Telefone</h4>
                  <a href={`tel:${supplier.phone}`} className="text-blue-600 hover:underline">
                    {supplier.phone}
                  </a>
                </div>
              </div>
            )}

            {supplier.website && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Website</h4>
                  <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {supplier.website}
                  </a>
                </div>
              </div>
            )}

            {supplier.linkedin && (
              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">LinkedIn</h4>
                  <a href={supplier.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    LinkedIn
                  </a>
                </div>
              </div>
            )}

            {supplier.instagram && (
              <div className="flex items-center gap-3">
                <Instagram className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Instagram</h4>
                  <a href={`https://instagram.com/${supplier.instagram}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {supplier.instagram}
                  </a>
                </div>
              </div>
            )}

            {supplier.youtube && (
              <div className="flex items-center gap-3">
                <Youtube className="w-4 h-4 text-muted-foreground" />
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">YouTube</h4>
                  <a href={supplier.youtube} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    YouTube
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});