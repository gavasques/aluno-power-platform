import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, Globe, Mail, Phone, MapPin, Edit, Save, X, FileText, Smartphone } from 'lucide-react';
import type { SupplierOverviewProps, SupplierFormData } from '../types';

/**
 * SUPPLIER OVERVIEW COMPONENT - FASE 4 REFATORAÇÃO
 * 
 * Componente de apresentação pura para aba Overview
 * Responsabilidade única: Exibir e editar dados básicos do fornecedor
 */
export function SupplierOverview({ supplier, isLoading, onUpdate }: SupplierOverviewProps) {
  console.log('🔍 SupplierOverview component loaded with supplier:', supplier);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SupplierFormData>({
    corporateName: supplier?.corporateName || '',
    tradeName: supplier?.tradeName || '',
    country: supplier?.country || '',
    state: supplier?.state || '',
    city: supplier?.city || '',
    postalCode: supplier?.postalCode || '',
    address: supplier?.address || '',
    phone: supplier?.phone || '',
    fax: supplier?.fax || '',
    mobile: supplier?.mobile || '',
    email: supplier?.email || '',
    website: supplier?.website || '',
    description: supplier?.description || '',
    status: supplier?.status || 'ativo'
  });

  // Update form data when supplier changes
  React.useEffect(() => {
    if (supplier) {
      setFormData({
        corporateName: supplier.corporateName || '',
        tradeName: supplier.tradeName || '',
        country: supplier.country || '',
        state: supplier.state || '',
        city: supplier.city || '',
        postalCode: supplier.postalCode || '',
        address: supplier.address || '',
        phone: supplier.phone || '',
        fax: supplier.fax || '',
        mobile: supplier.mobile || '',
        email: supplier.email || '',
        website: supplier.website || '',
        description: supplier.description || '',
        status: supplier.status || 'ativo'
      });
    }
  }, [supplier]);

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
      corporateName: supplier?.corporateName || '',
      tradeName: supplier?.tradeName || '',
      country: supplier?.country || '',
      state: supplier?.state || '',
      city: supplier?.city || '',
      postalCode: supplier?.postalCode || '',
      address: supplier?.address || '',
      phone: supplier?.phone || '',
      fax: supplier?.fax || '',
      mobile: supplier?.mobile || '',
      email: supplier?.email || '',
      website: supplier?.website || '',
      description: supplier?.description || '',
      status: supplier?.status || 'ativo'
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
        <Badge className={supplier.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
          {supplier.status === 'ativo' ? 'Ativo' : 'Inativo'}
        </Badge>
        <Badge variant="outline">{supplier.country}</Badge>
        {supplier.city && <Badge variant="outline">{supplier.city}</Badge>}
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
              <Label htmlFor="corporateName">Nome Corporativo</Label>
              {isEditing ? (
                <Input
                  id="corporateName"
                  value={formData.corporateName}
                  onChange={(e) => setFormData(prev => ({ ...prev, corporateName: e.target.value.toUpperCase() }))}
                  placeholder="Nome oficial da empresa"
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1 font-medium">{supplier.corporateName}</p>
              )}
            </div>

            <div>
              <Label htmlFor="tradeName">Nome Comercial</Label>
              {isEditing ? (
                <Input
                  id="tradeName"
                  value={formData.tradeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, tradeName: e.target.value.toUpperCase() }))}
                  placeholder="Nome comercial/fantasia"
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1">{supplier.tradeName || 'Não informado'}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="country">País</Label>
                {isEditing ? (
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value.toUpperCase() }))}
                    placeholder="Ex: CHINA, ESTADOS UNIDOS"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1 flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {supplier.country}
                  </p>
                )}
              </div>
              
              <div>
                <Label htmlFor="state">Estado/Província</Label>
                {isEditing ? (
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                    placeholder="Ex: GUANGDONG, CALIFORNIA"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1">{supplier.state || 'Não informado'}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">Cidade/Distrito</Label>
                {isEditing ? (
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value.toUpperCase() }))}
                    placeholder="Ex: SHENZHEN, LOS ANGELES"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1">{supplier.city || 'Não informado'}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="postalCode">CEP/Código Postal</Label>
                {isEditing ? (
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="Ex: 518000"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1">{supplier.postalCode || 'Não informado'}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="address">Endereço</Label>
              {isEditing ? (
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value.toUpperCase() }))}
                  rows={3}
                  placeholder="Endereço completo"
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1">{supplier.address || 'Não informado'}</p>
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
                  placeholder="email@empresa.com"
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <Mail className="w-4 h-4 mr-1" />
                  {supplier.email || 'Não informado'}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="phone">Telefone</Label>
                {isEditing ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ex: +86 755 1234 5678"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1 flex items-center">
                    <Phone className="w-4 h-4 mr-1" />
                    {supplier.phone || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="fax">FAX</Label>
                {isEditing ? (
                  <Input
                    id="fax"
                    value={formData.fax}
                    onChange={(e) => setFormData(prev => ({ ...prev, fax: e.target.value }))}
                    placeholder="Ex: +86 755 1234 5679"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1 flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {supplier.fax || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="mobile">Mobile</Label>
                {isEditing ? (
                  <Input
                    id="mobile"
                    value={formData.mobile}
                    onChange={(e) => setFormData(prev => ({ ...prev, mobile: e.target.value }))}
                    placeholder="Ex: +86 138 0000 0000"
                  />
                ) : (
                  <p className="text-sm text-gray-900 mt-1 flex items-center">
                    <Smartphone className="w-4 h-4 mr-1" />
                    {supplier.mobile || 'Não informado'}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              {isEditing ? (
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://www.empresa.com"
                />
              ) : (
                <p className="text-sm text-gray-900 mt-1 flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  {supplier.website ? (
                    <a 
                      href={supplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {supplier.website}
                    </a>
                  ) : (
                    'Não informado'
                  )}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              {isEditing ? (
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'ativo' | 'inativo' }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-900 mt-1">
                  <Badge className={supplier.status === 'ativo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {supplier.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Descrição</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Descrição da empresa, produtos oferecidos, especialidades, etc."
            />
          ) : (
            <p className="text-sm text-gray-900 leading-relaxed">
              {supplier.description || 'Nenhuma descrição registrada'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}