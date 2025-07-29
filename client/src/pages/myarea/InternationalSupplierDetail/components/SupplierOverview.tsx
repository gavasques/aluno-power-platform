import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, Mail, Phone, MapPin, Edit, Save, X } from 'lucide-react';
import type { SupplierOverviewProps } from '../types';
import { BUSINESS_TYPES, COUNTRIES, CURRENCIES } from '../types';

/**
 * SUPPLIER OVERVIEW COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para aba Overview
 * Responsabilidade única: Exibir e editar dados básicos do fornecedor
 */
export function SupplierOverview({ supplier, isLoading, onUpdate }: SupplierOverviewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    whatsapp: supplier?.whatsapp || '',
    country: supplier?.country || '',
    address: supplier?.address || '',
    website: supplier?.website || '',
    businessType: supplier?.businessType || '',
    specialties: supplier?.specialties || [],
    certifications: supplier?.certifications || [],
    paymentTerms: supplier?.paymentTerms || '',
    minimumOrder: supplier?.minimumOrder || 0,
    leadTime: supplier?.leadTime || '',
    notes: supplier?.notes || '',
    isActive: supplier?.isActive ?? true
  });

  const handleSave = async () => {
    try {
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handleCancel = () => {
    setFormData({
      name: supplier?.name || '',
      email: supplier?.email || '',
      phone: supplier?.phone || '',
      whatsapp: supplier?.whatsapp || '',
      country: supplier?.country || '',
      address: supplier?.address || '',
      website: supplier?.website || '',
      businessType: supplier?.businessType || '',
      specialties: supplier?.specialties || [],
      certifications: supplier?.certifications || [],
      paymentTerms: supplier?.paymentTerms || '',
      minimumOrder: supplier?.minimumOrder || 0,
      leadTime: supplier?.leadTime || '',
      notes: supplier?.notes || '',
      isActive: supplier?.isActive ?? true
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium mb-2">Fornecedor não encontrado</h3>
            <p>Não foi possível carregar os dados do fornecedor.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Informações Gerais</h2>
          <p className="text-gray-600">Dados básicos do fornecedor internacional</p>
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <>
              <Button onClick={handleCancel} variant="outline">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <Badge className={supplier.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {supplier.isActive ? 'Ativo' : 'Inativo'}
        </Badge>
        <Badge variant="outline">{supplier.businessType}</Badge>
        <Badge variant="outline">{supplier.country}</Badge>
      </div>

      {/* Main Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building2 className="w-5 h-5 mr-2" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome da Empresa</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1">{supplier.name}</p>
              )}
            </div>

            <div>
              <Label htmlFor="businessType">Tipo de Negócio</Label>
              {isEditing ? (
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, businessType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-900 mt-1">{supplier.businessType}</p>
              )}
            </div>

            <div>
              <Label htmlFor="country">País</Label>
              {isEditing ? (
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {supplier.country}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1">{supplier.address}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {supplier.email}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="phone">Telefone</Label>
              {isEditing ? (
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <Phone className="w-4 h-4 mr-1" />
                  {supplier.phone}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              {isEditing ? (
                <Input
                  id="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                />
              ) : (
                supplier.whatsapp && (
                  <p className="text-sm text-gray-900 mt-1 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {supplier.whatsapp}
                  </p>
                )
              )}
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              {isEditing ? (
                <Input
                  id="website"
                  value={formData.website || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                />
              ) : (
                supplier.website && (
                  <p className="text-sm text-gray-900 mt-1 flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    <a 
                      href={supplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {supplier.website}
                    </a>
                  </p>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <CardTitle>Detalhes Comerciais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="paymentTerms">Condições de Pagamento</Label>
              {isEditing ? (
                <Input
                  id="paymentTerms"
                  value={formData.paymentTerms || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, paymentTerms: e.target.value }))}
                  placeholder="Ex: 30 dias"
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1">{supplier.paymentTerms || 'Não informado'}</p>
              )}
            </div>

            <div>
              <Label htmlFor="minimumOrder">Pedido Mínimo</Label>
              {isEditing ? (
                <Input
                  id="minimumOrder"
                  type="number"
                  value={formData.minimumOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumOrder: parseInt(e.target.value) || 0 }))}
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1">
                  {supplier.minimumOrder ? `${supplier.minimumOrder} unidades` : 'Não informado'}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="leadTime">Prazo de Entrega</Label>
              {isEditing ? (
                <Input
                  id="leadTime"
                  value={formData.leadTime || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, leadTime: e.target.value }))}
                  placeholder="Ex: 15-30 dias"
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1">{supplier.leadTime || 'Não informado'}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Specialties and Certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Especialidades</CardTitle>
          </CardHeader>
          <CardContent>
            {supplier.specialties.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {supplier.specialties.map((specialty, index) => (
                  <Badge key={index} variant="outline">
                    {specialty}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma especialidade informada</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Certificações</CardTitle>
          </CardHeader>
          <CardContent>
            {supplier.certifications.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {supplier.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="bg-green-50 text-green-700">
                    {cert}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma certificação informada</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Observações sobre o fornecedor..."
            />
          ) : (
            <p className="text-sm text-gray-900">
              {supplier.notes || 'Nenhuma observação registrada'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}